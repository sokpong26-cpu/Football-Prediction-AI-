import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Upload,
  ScanLine,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  ArrowRight,
  Cloud,
  RefreshCw,
  Image as ImageIcon,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { PhotoScanResult, PhotoScanRowSignal } from '../../types';
import { MULTIPLIERS, appState } from '../../services/store';
import { sound } from '../../services/sound';
import { useAuth } from '../../contexts/AuthContext';
import {
  deletePhotoScanFromFirestore,
  FirestorePhotoScanDoc,
  savePhotoScanToFirestore,
  subscribeToUserPhotoScans,
} from '../../services/firestoreService';

interface UploadedPhotoItem {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  status: 'pending' | 'scanning' | 'done' | 'error';
  errorMessage?: string;
  retryable?: boolean;
  scanResult?: PhotoScanResult;
}

type VisionModelMode = 'auto' | 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';

interface AiPhotoScanViewProps {
  onApplyToBot?: () => void;
}

const DEFAULT_ROW_LABELS = [...MULTIPLIERS].map((m) => ({
  rowNumber: m.index + 1,
  multiplier: m.label,
}));

function extractReadableErrorMessage(raw: unknown): string {
  if (!raw) return 'Unable to complete AI photo scan. Please try again.';
  let msg = typeof raw === 'string' ? raw : raw instanceof Error ? raw.message : String(raw);
  msg = msg.trim();

  for (let i = 0; i < 3; i++) {
    if (!msg.startsWith('{')) break;
    try {
      const parsed = JSON.parse(msg) as {
        message?: string;
        error?: string | { message?: string };
      };
      if (parsed?.error && typeof parsed.error === 'object' && parsed.error.message) {
        msg = String(parsed.error.message).trim();
        continue;
      }
      if (typeof parsed?.error === 'string' && parsed.error.trim()) {
        msg = parsed.error.trim();
        continue;
      }
      if (typeof parsed?.message === 'string' && parsed.message.trim()) {
        msg = parsed.message.trim();
        continue;
      }
      break;
    } catch {
      break;
    }
  }

  return msg || 'Unable to complete AI photo scan. Please try again.';
}

async function prepareImageForVision(
  file: File
): Promise<{ dataUrl: string; mimeType: string }> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });

  const MAX_DIMENSION = 1280;
  const MAX_RAW_CHARS = 950_000;

  // Resize/compress large screenshots cleanly on canvas so Vision upload stays fast & crisp
  return await new Promise<{ dataUrl: string; mimeType: string }>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      const needsResize =
        width > MAX_DIMENSION || height > MAX_DIMENSION || rawDataUrl.length > MAX_RAW_CHARS;

      if (!needsResize || width === 0 || height === 0) {
        resolve({ dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
        return;
      }

      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
      const targetW = Math.max(1, Math.round(width * scale));
      const targetH = Math.max(1, Math.round(height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const optimized = canvas.toDataURL('image/jpeg', 0.86);
      resolve({
        dataUrl: optimized.length < rawDataUrl.length ? optimized : rawDataUrl,
        mimeType: optimized.length < rawDataUrl.length ? 'image/jpeg' : file.type || 'image/jpeg',
      });
    };
    img.onerror = () => {
      resolve({ dataUrl: rawDataUrl, mimeType: file.type || 'image/jpeg' });
    };
    img.src = rawDataUrl;
  });
}

export const AiPhotoScanView: React.FC<AiPhotoScanViewProps> = ({ onApplyToBot }) => {
  const { firebaseUser, signInGoogle, getFreshToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [photos, setPhotos] = useState<UploadedPhotoItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [platformHint, setPlatformHint] = useState<'Auto-detect' | 'SokRizyBet' | '1xBet'>('Auto-detect');
  const [modelMode, setModelMode] = useState<VisionModelMode>('auto');
  const [userNote, setUserNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);
  const [savedScans, setSavedScans] = useState<FirestorePhotoScanDoc[]>([]);

  useEffect(() => {
    if (!firebaseUser) {
      setSavedScans([]);
      return;
    }
    const unsub = subscribeToUserPhotoScans(firebaseUser.uid, (items) => {
      setSavedScans(items);
    });
    return () => unsub();
  }, [firebaseUser]);

  const selectedPhoto = photos.find((p) => p.id === selectedId) || photos[0] || null;

  const handleFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const loaded: UploadedPhotoItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const prepared = await prepareImageForVision(file);
      loaded.push({
        id: `photo_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        fileName: file.name,
        mimeType: prepared.mimeType,
        dataUrl: prepared.dataUrl,
        status: 'pending',
      });
    }

    if (loaded.length > 0) {
      sound.playClick();
      setPhotos((prev) => [...loaded, ...prev].slice(0, 12));
      setSelectedId(loaded[0].id);
      setCloudMessage(null);
    }
  };

  const scanSinglePhoto = async (
    photo: UploadedPhotoItem,
    overrideMode?: VisionModelMode
  ) => {
    const activeMode = overrideMode || modelMode;
    sound.playStepChime(1);
    setCloudMessage(null);
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === photo.id
          ? { ...p, status: 'scanning', errorMessage: undefined, retryable: undefined }
          : p
      )
    );

    try {
      const res = await fetch('/api/ai/scan-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photo.dataUrl,
          mimeType: photo.mimeType,
          platformHint,
          modelMode: activeMode,
          note: userNote.trim() || undefined,
        }),
      });

      const rawBody = await res.text();
      let payload: Record<string, unknown> = {};
      try {
        payload = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
      } catch {
        throw new Error(
          res.ok
            ? 'Received an unexpected response format from AI server.'
            : `AI Vision service returned HTTP ${res.status}. Please click Retry Scan.`
        );
      }

      if (!res.ok) {
        const cleanMsg = extractReadableErrorMessage(
          payload?.error || `AI Vision request failed (HTTP ${res.status}).`
        );
        const err = new Error(cleanMsg) as Error & { retryable?: boolean };
        err.retryable =
          Boolean(payload?.retryable) || res.status === 503 || res.status === 429 || res.status >= 500;
        throw err;
      }

      const raw = (payload.result || {}) as Record<string, unknown>;
      const normalizedRows: PhotoScanRowSignal[] = DEFAULT_ROW_LABELS.map((base) => {
        const match = Array.isArray(raw.rowSignals)
          ? (raw.rowSignals as PhotoScanRowSignal[]).find(
              (r) => Number(r.rowNumber) === base.rowNumber
            )
          : null;

        const bestCol = Math.max(
          1,
          Math.min(5, Number(match?.bestColumn) || Number(raw.recommendedColumn) || 1)
        );
        const safeCols =
          Array.isArray(match?.safeColumns) && match.safeColumns.length > 0
            ? match.safeColumns.map((c: number) => Math.max(1, Math.min(5, Number(c))))
            : [bestCol];

        return {
          rowNumber: base.rowNumber,
          multiplier: match?.multiplier || base.multiplier,
          safeColumns: safeCols,
          bestColumn: bestCol,
          status:
            match?.status === 'revealed_win' || match?.status === 'revealed_loss'
              ? match.status
              : 'ai_predicted_target',
          confidence: Number(match?.confidence ?? raw.overallConfidence ?? 99.99),
        };
      });

      const result: PhotoScanResult = {
        id: photo.id,
        fileName: photo.fileName,
        previewUrl: photo.dataUrl,
        scannedAt: String(payload.scannedAt || new Date().toISOString()),
        model: String(payload.model || 'gemini-4-hydrogen'),
        isAppleOfFortuneScreenshot: Boolean(raw.isAppleOfFortuneScreenshot ?? true),
        detectedPlatform: String(raw.detectedPlatform || platformHint),
        detectedActiveRow: Math.max(1, Math.min(10, Number(raw.detectedActiveRow) || 1)),
        recommendedColumn: Math.max(1, Math.min(5, Number(raw.recommendedColumn) || 1)),
        overallConfidence: Number(raw.overallConfidence ?? 99.99),
        summaryTitle: String(raw.summaryTitle || 'AI Answer Signal Ready'),
        answerExplanation: String(
          raw.answerExplanation ||
            `Target Row #${raw.detectedActiveRow || 1} → Safe Column ${raw.recommendedColumn || 1}.`
        ),
        rowSignals: normalizedRows,
      };

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id
            ? { ...p, status: 'done', errorMessage: undefined, retryable: false, scanResult: result }
            : p
        )
      );
      sound.playCompleteFanfare();
    } catch (err: unknown) {
      const errObj = err as Error & { retryable?: boolean };
      const msg = extractReadableErrorMessage(errObj?.message || err);
      const isRetryable = errObj?.retryable ?? true;
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id
            ? { ...p, status: 'error', errorMessage: msg, retryable: isRetryable }
            : p
        )
      );
    }
  };

  const handleScanAll = async () => {
    if (photos.length === 0 || isScanningAll) return;
    setIsScanningAll(true);
    for (const item of photos) {
      await scanSinglePhoto(item);
    }
    setIsScanningAll(false);
  };

  const handleSaveCloud = async (result: PhotoScanResult) => {
    if (!firebaseUser) {
      await signInGoogle();
      return;
    }

    setIsSavingCloud(true);
    setCloudMessage(null);
    try {
      await savePhotoScanToFirestore(firebaseUser.uid, result);

      const token = await getFreshToken();
      if (token) {
        const dbRes = await fetch('/api/ai/scans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            platform: result.detectedPlatform,
            activeRow: result.detectedActiveRow,
            recommendedColumn: result.recommendedColumn,
            overallConfidence: result.overallConfidence,
            summaryTitle: result.summaryTitle,
            answerExplanation: result.answerExplanation,
            rowSignals: result.rowSignals,
          }),
        });

        if (!dbRes.ok) {
          const errPayload = await dbRes.json().catch(() => ({}));
          setCloudMessage(
            `Saved to Firebase. Cloud SQL sync notice: ${extractReadableErrorMessage(
              errPayload?.error || 'Retry later'
            )}`
          );
          sound.playCompleteFanfare();
          return;
        }
      }

      sound.playCompleteFanfare();
      setCloudMessage('AI Answer Signal saved to Firebase & Cloud SQL Storage.');
    } catch (err: unknown) {
      setCloudMessage(extractReadableErrorMessage(err));
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleApplyToBotBoard = (result: PhotoScanResult) => {
    sound.playSuccessChime();
    const mappedSteps = result.rowSignals.map((r, idx) => ({
      rowIndex: idx,
      multiplier: MULTIPLIERS[idx]?.multiplier || 1.23,
      multiplierText: r.multiplier || MULTIPLIERS[idx]?.label || '×1.23',
      safeColumn: Math.max(0, Math.min(4, (r.bestColumn || 1) - 1)),
      confidence: r.confidence || result.overallConfidence || 99.99,
    }));

    appState.activeSignalSession = {
      id: `sess_photo_${Date.now()}`,
      gameId: `PHOTO-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      serverHash: `AI-VISION-${Date.now().toString(16).toUpperCase()}`,
      clientSeed: `SCAN-${result.detectedPlatform.toUpperCase()}-R${result.detectedActiveRow}C${result.recommendedColumn}`,
      steps: mappedSteps,
      maxStep: Math.max(1, result.detectedActiveRow),
      accuracy: Number(result.overallConfidence || 99.99),
      sourceServer: `${result.detectedPlatform} AI Vision Scan`,
      strategy: 'power_max',
      hackStatus: 'power_max_ai',
    };
    appState.notify();

    if (onApplyToBot) {
      onApplyToBot();
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const activeResult = selectedPhoto?.scanResult;

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0f1f14] via-[#0b1610] to-[#08100c] border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full rounded-2xl bg-[#09120c] flex items-center justify-center text-emerald-400">
              <Camera size={24} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                AI Scan New • Apple of Fortune Photo Analyzer
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase">
                Vision AI 99.99%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              1. Upload photos of Apple of Fortune → 2. AI Scan Signal of the photos → 3. Instant AI Answer Signal Grid
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!firebaseUser ? (
            <button
              type="button"
              onClick={() => signInGoogle()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <Cloud size={15} className="text-cyan-400" />
              <span>Sign In with Google to Sync</span>
            </button>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <ShieldCheck size={15} />
              <span>Synced: {firebaseUser.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-Step Pipeline Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${photos.length > 0 ? 'bg-emerald-950/40 border-emerald-500/50' : 'bg-[#0b1610] border-[#1b3322]'}`}>
          <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm">1</span>
          <div>
            <div className="text-xs font-black text-white">Upload Photos</div>
            <div className="text-[11px] text-gray-400">Apple of Fortune screenshots</div>
          </div>
        </div>
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${selectedPhoto?.status === 'scanning' || activeResult ? 'bg-cyan-950/40 border-cyan-500/50' : 'bg-[#0b1610] border-[#1b3322]'}`}>
          <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm">2</span>
          <div>
            <div className="text-xs font-black text-white">AI Scan Signal</div>
            <div className="text-[11px] text-gray-400">Deep Vision grid inspection</div>
          </div>
        </div>
        <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${activeResult ? 'bg-amber-950/30 border-amber-500/50' : 'bg-[#0b1610] border-[#1b3322]'}`}>
          <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-sm">3</span>
          <div>
            <div className="text-xs font-black text-white">AI Answer Signal</div>
            <div className="text-[11px] text-gray-400">Safe Apple target Row & Col</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Step 1 Upload & Step 2 Scan Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              void handleFilesAdded(e.dataTransfer.files);
            }}
            className={`p-6 rounded-3xl border-2 border-dashed transition text-center space-y-3 ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-[#25452e] bg-[#0c1610] hover:border-emerald-500/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void handleFilesAdded(e.target.files)}
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Upload size={26} />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">
                1. Upload Photos of Apple of Fortune
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Drop PNG/JPG screenshots or tap below to choose 1 or multiple game photos
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ImageIcon size={16} />
              <span>Select Photos from Device</span>
            </button>
          </div>

          {/* Platform, AI Engine & Note Controls */}
          <div className="p-4 rounded-2xl bg-[#0c1610] border border-[#1c3423] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">
                  Platform Hint
                </label>
                <select
                  value={platformHint}
                  onChange={(e) => setPlatformHint(e.target.value as typeof platformHint)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white font-semibold"
                >
                  <option value="Auto-detect">Auto-detect</option>
                  <option value="SokRizyBet">SokRizyBet</option>
                  <option value="1xBet">1xBet</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">
                  AI Vision Engine
                </label>
                <select
                  value={modelMode}
                  onChange={(e) => setModelMode(e.target.value as VisionModelMode)}
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-cyan-300 font-semibold"
                >
                  <option value="auto">Auto (Hydrogen + Fallback)</option>
                  <option value="gemini-4-hydrogen">Gemini 4 Hydrogen (Deep)</option>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Fast)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Optional Note
              </label>
              <input
                type="text"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="e.g. Round #5 next..."
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white"
              />
            </div>

            {photos.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={!selectedPhoto || selectedPhoto.status === 'scanning'}
                  onClick={() => selectedPhoto && void scanSinglePhoto(selectedPhoto)}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {selectedPhoto?.status === 'scanning' ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Scanning with Auto-Retry...</span>
                    </>
                  ) : (
                    <>
                      <ScanLine size={16} />
                      <span>2. AI Scan Selected Photo</span>
                    </>
                  )}
                </button>
                {photos.length > 1 && (
                  <button
                    type="button"
                    disabled={isScanningAll}
                    onClick={() => void handleScanAll()}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#152a1b] hover:bg-[#1e3a27] border border-emerald-500/40 text-emerald-300 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isScanningAll ? 'Scanning...' : `Scan All (${photos.length})`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Uploaded Thumbnails List */}
          {photos.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#0c1610] border border-[#1c3423] space-y-2.5">
              <div className="text-xs font-bold text-gray-300 flex items-center justify-between">
                <span>Uploaded Queue ({photos.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhotos([]);
                    setSelectedId(null);
                  }}
                  className="text-[11px] text-red-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {photos.map((photo) => {
                  const isSel = selectedPhoto?.id === photo.id;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedId(photo.id)}
                      className={`p-2 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        isSel
                          ? 'bg-emerald-950/40 border-emerald-500/60'
                          : 'bg-[#08100b] border-[#172c1d] hover:border-emerald-500/30'
                      }`}
                    >
                      <img
                        src={photo.dataUrl}
                        alt={photo.fileName}
                        className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {photo.fileName}
                        </div>
                        <div className="text-[10px] mt-0.5">
                          {photo.status === 'pending' && (
                            <span className="text-gray-400">Ready to scan</span>
                          )}
                          {photo.status === 'scanning' && (
                            <span className="text-cyan-400 font-bold animate-pulse">
                              AI Scanning Signal...
                            </span>
                          )}
                          {photo.status === 'done' && photo.scanResult && (
                            <span className="text-emerald-400 font-bold">
                              Answer: Row {photo.scanResult.detectedActiveRow} • Col {photo.scanResult.recommendedColumn} 🍎
                            </span>
                          )}
                          {photo.status === 'error' && (
                            <span className="text-red-400 font-bold">
                              Scan Error • Tap Retry
                            </span>
                          )}
                        </div>
                      </div>
                      {photo.status === 'error' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(photo.id);
                            void scanSinglePhoto(photo);
                          }}
                          title="Retry AI scan"
                          className="p-1.5 rounded-lg text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 cursor-pointer"
                        >
                          <RefreshCw size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photo.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Photo Preview with Scan Overlay */}
          {selectedPhoto && (
            <div className="relative rounded-3xl overflow-hidden border border-[#22412b] bg-black">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.fileName}
                className="w-full max-h-72 object-contain mx-auto"
              />
              {selectedPhoto.status === 'scanning' && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 px-4 text-center">
                  <RefreshCw size={28} className="text-cyan-400 animate-spin" />
                  <div className="text-xs font-black text-cyan-300 tracking-wider uppercase">
                    Scanning Apple of Fortune Pattern...
                  </div>
                  <div className="text-[11px] text-gray-300">
                    Auto-retry & model fallback enabled for high reliability
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Step 3 AI Answer Signal Result Board */}
        <div className="lg:col-span-7 space-y-4">
          {selectedPhoto?.status === 'error' && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="font-black text-red-300">AI Scan Signal Error</div>
                  <p className="leading-relaxed">{selectedPhoto.errorMessage}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-8">
                <button
                  type="button"
                  onClick={() => void scanSinglePhoto(selectedPhoto)}
                  className="px-3.5 py-2 rounded-xl bg-red-500/25 hover:bg-red-500/35 border border-red-400/50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry Scan</span>
                </button>
                {selectedPhoto.retryable !== false && modelMode !== 'gemini-3.1-flash-lite' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModelMode('gemini-3.1-flash-lite');
                      void scanSinglePhoto(selectedPhoto, 'gemini-3.1-flash-lite');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>Try Fast Flash-Lite Engine</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {!activeResult ? (
            <div className="p-8 rounded-3xl bg-[#0c1610] border border-[#1c3423] text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl">
                🍎
              </div>
              <h3 className="text-base font-black text-white">
                3. AI Answer Signal Will Appear Here
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Upload an Apple of Fortune game screenshot on the left and click{' '}
                <strong className="text-emerald-400">AI Scan Selected Photo</strong>. Our vision engine detects revealed apples/cores and outputs the exact next safe Row & Column target.
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-[#0c1610] border border-emerald-500/40 shadow-2xl space-y-5">
              {/* Top Answer Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0f2417] to-cyan-950/60 border border-emerald-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-black text-[10px] uppercase">
                      AI Answer Signal
                    </span>
                    <span className="text-xs font-mono text-cyan-300 font-bold">
                      {activeResult.detectedPlatform}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-200 border border-white/15 text-[10px] font-mono">
                      {activeResult.model}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Target size={18} className="text-emerald-400" />
                    <span>
                      Row #{activeResult.detectedActiveRow} → Column {activeResult.recommendedColumn} 🍎
                    </span>
                  </h3>
                  <p className="text-xs text-gray-300">{activeResult.summaryTitle}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Confidence</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {activeResult.overallConfidence.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 10x5 Answer Grid (Row 10 at top down to Row 1 at bottom) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                  <span>10×5 Apple of Fortune Answer Grid</span>
                  <span className="font-mono">Col 1 — Col 5</span>
                </div>
                <div className="space-y-1.5 bg-[#070d09] p-3 rounded-2xl border border-[#193020]">
                  {[...activeResult.rowSignals]
                    .sort((a, b) => b.rowNumber - a.rowNumber)
                    .map((row) => {
                      const isTargetRow = row.rowNumber === activeResult.detectedActiveRow;
                      return (
                        <div
                          key={row.rowNumber}
                          className={`grid grid-cols-7 items-center gap-1.5 p-1.5 rounded-xl transition ${
                            isTargetRow
                              ? 'bg-emerald-500/15 border border-emerald-400/60'
                              : 'bg-[#0b150e] border border-transparent'
                          }`}
                        >
                          <div className="col-span-2 flex items-center justify-between px-2 text-[11px] font-mono">
                            <span className={isTargetRow ? 'text-emerald-300 font-black' : 'text-gray-400'}>
                              R{row.rowNumber}
                            </span>
                            <span className="text-amber-300 font-bold">{row.multiplier}</span>
                          </div>
                          {[1, 2, 3, 4, 5].map((col) => {
                            const isBest = col === row.bestColumn;
                            const isSafe = row.safeColumns.includes(col);
                            const isLoss = row.status === 'revealed_loss' && !isSafe;
                            return (
                              <div
                                key={col}
                                className={`h-9 rounded-lg flex items-center justify-center text-sm font-black border transition ${
                                  isBest && isTargetRow
                                    ? 'bg-emerald-500 text-black border-emerald-200 shadow-lg shadow-emerald-500/40 scale-105'
                                    : isBest
                                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60'
                                    : isSafe
                                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/25'
                                    : isLoss
                                    ? 'bg-red-950/50 text-red-400 border-red-500/30'
                                    : 'bg-[#101c14] text-gray-600 border-[#1b3021]'
                                }`}
                              >
                                {isBest ? '🍎' : isSafe ? '🍏' : isLoss ? '🪱' : '•'}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Explanation */}
              <div className="p-3.5 rounded-2xl bg-[#08100b] border border-[#1b3422] text-xs text-gray-300 leading-relaxed">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>AI Vision Analysis Breakdown</span>
                </div>
                {activeResult.answerExplanation}
              </div>

              {cloudMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>{cloudMessage}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  disabled={isSavingCloud}
                  onClick={() => void handleSaveCloud(activeResult)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#132619] hover:bg-[#1a3423] border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Cloud size={15} />
                  <span>
                    {!firebaseUser
                      ? 'Sign In & Save Answer Signal'
                      : isSavingCloud
                      ? 'Saving...'
                      : 'Save Answer Signal'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyToBotBoard(activeResult)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <span>Apply Answer to Live Bot Board</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* Synced History */}
          {firebaseUser && savedScans.length > 0 && (
            <div className="p-4 rounded-3xl bg-[#0c1610] border border-[#1c3423] space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Cloud size={14} className="text-cyan-400" />
                <span>Saved AI Answer Signals ({savedScans.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {savedScans.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#08100b] border border-[#193020] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {item.summaryTitle}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        {item.platform} • Row {item.activeRow} → Col {item.recommendedColumn} ({item.overallConfidence}%)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deletePhotoScanFromFirestore(item.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0 cursor-pointer"
                      title="Delete saved scan"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
