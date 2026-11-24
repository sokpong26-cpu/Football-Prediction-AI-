import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Cloud,
  ExternalLink,
  Flag,
  Globe,
  Image as ImageIcon,
  Layers,
  Lock,
  RefreshCw,
  Scale,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Upload,
} from 'lucide-react';
import {
  FootballGroundingSource,
  FootballMarketConfidenceTier,
  FootballMatchPredictionResult,
  FootballWorkingStep,
} from '../../types';
import { sound } from '../../services/sound';
import { useAuth } from '../../contexts/AuthContext';
import {
  deleteFootballPredictionFromFirestore,
  FirestoreFootballPredictionDoc,
  saveFootballPredictionToFirestore,
  subscribeToUserFootballPredictions,
} from '../../services/firestoreService';

interface UploadedMatchPhoto {
  id: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  status: 'pending' | 'scanning' | 'done' | 'error';
  errorMessage?: string;
  retryable?: boolean;
  prediction?: FootballMatchPredictionResult;
}

type VisionModelMode = 'auto' | 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite';
type InputMode = 'photo' | 'manual';
type MatrixFilter = 'all' | 'high' | 'core' | 'props';

const LEAGUE_PRESETS = [
  'Premier League',
  'Champions League',
  'La Liga',
  'Serie A',
  'World Cup',
];

function normalizeTier(rawTier: unknown, conf: number): FootballMarketConfidenceTier {
  const s = String(rawTier || '').toUpperCase();
  if (s === 'LOCK' || conf >= 94) return 'LOCK';
  if (s === 'HIGH' || conf >= 86) return 'HIGH';
  return 'VALUE';
}

function clampConfidence(val: unknown, fallback: number): number {
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.max(50, Math.min(99.99, Number(n.toFixed(2))));
}

function extractReadableErrorMessage(raw: unknown): string {
  if (!raw) return 'Unable to complete match prediction. Please try again.';
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

  return msg || 'Unable to complete match prediction. Please try again.';
}

async function prepareMatchImageForVision(
  file: File
): Promise<{ dataUrl: string; mimeType: string }> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read match photo.'));
    reader.readAsDataURL(file);
  });

  const MAX_DIMENSION = 1280;
  const MAX_RAW_CHARS = 950_000;

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

function normalizePredictionPayload(params: {
  id: string;
  inputMode: 'photo' | 'manual';
  fileName: string;
  previewUrl?: string;
  payload: Record<string, unknown>;
  fallbackHome?: string;
  fallbackAway?: string;
  fallbackLeague?: string;
}): FootballMatchPredictionResult {
  const raw = (params.payload.result || {}) as Record<string, unknown>;
  const rawWinner = (raw.winningTeam || {}) as Record<string, unknown>;
  const rawHandicap = (raw.asianHandicap || {}) as Record<string, unknown>;
  const rawOverUnder = (raw.overUnder || {}) as Record<string, unknown>;
  const rawScore = (raw.correctScore || {}) as Record<string, unknown>;
  const rawBtts = (raw.btts || {}) as Record<string, unknown>;
  const rawHtFt = (raw.halfTimeFullTime || {}) as Record<string, unknown>;
  const rawCorners = (raw.corners || {}) as Record<string, unknown>;
  const rawCards = (raw.cards || {}) as Record<string, unknown>;
  const rawTopLock = (raw.topLockPick || {}) as Record<string, unknown>;

  const homeTeam = String(raw.homeTeam || params.fallbackHome || 'Home Team');
  const awayTeam = String(raw.awayTeam || params.fallbackAway || 'Away Team');
  const league = String(raw.league || params.fallbackLeague || 'International Match');

  const homeProb = Math.max(0, Math.min(100, Number(rawWinner.homeWinProb) || 54));
  const drawProb = Math.max(0, Math.min(100, Number(rawWinner.drawProb) || 24));
  const awayProb = Math.max(0, Math.min(100, Number(rawWinner.awayWinProb) || 22));
  const totalProb = Math.max(1, homeProb + drawProb + awayProb);

  const yesProbRaw = Math.max(0, Math.min(100, Number(rawBtts.yesProb) || 58));
  const noProbRaw = Math.max(0, Math.min(100, Number(rawBtts.noProb) || 100 - yesProbRaw));
  const bttsTotal = Math.max(1, yesProbRaw + noProbRaw);

  const winConf = clampConfidence(rawWinner.confidence, 92.4);
  const hcpConf = clampConfidence(rawHandicap.confidence, 90.8);
  const ouConf = clampConfidence(rawOverUnder.confidence, 91.5);
  const scoreConf = clampConfidence(rawScore.confidence, 84.2);
  const bttsConf = clampConfidence(rawBtts.confidence, 89.6);
  const htFtConf = clampConfidence(rawHtFt.confidence, 85.4);
  const cornerConf = clampConfidence(rawCorners.confidence, 88.9);
  const cardConf = clampConfidence(rawCards.confidence, 87.3);

  const normalizedSteps: FootballWorkingStep[] = Array.isArray(raw.workingMatchSteps)
    ? (raw.workingMatchSteps as FootballWorkingStep[]).slice(0, 6).map((step, i) => ({
        stepTitle: String(step.stepTitle || `Stage 0${i + 1}: Match Evaluation`),
        detail: String(step.detail || 'Analyzed team momentum and odds movement.'),
        signalImpact: String(step.signalImpact || 'Positive Signal'),
      }))
    : [
        {
          stepTitle: '01. Match & Market Extraction',
          detail: `Evaluated ${homeTeam} vs ${awayTeam} under ${league}.`,
          signalImpact: 'Verified Input',
        },
        {
          stepTitle: '02. Tactical Tempo & 8-Market Calibration',
          detail: String(raw.workingSummary || 'Calibrated goals, corners, cards, and HT/FT distributions.'),
          signalImpact: 'Strong Edge',
        },
      ];

  const groundingSources: FootballGroundingSource[] = Array.isArray(params.payload.groundingSources)
    ? (params.payload.groundingSources as FootballGroundingSource[])
        .filter((s) => Boolean(s?.uri && s?.title))
        .slice(0, 6)
    : [];

  const winningPick = String(rawWinner.pick || `${homeTeam} Win`);
  const topLockConf = clampConfidence(rawTopLock.confidence, Math.max(winConf, hcpConf, ouConf, 95.5));

  const isFootballMatch = Boolean(raw.isFootballMatchScreenshot ?? true);

  return {
    id: params.id,
    inputMode: params.inputMode,
    fileName: params.fileName,
    previewUrl: params.previewUrl,
    scannedAt: String(params.payload.scannedAt || new Date().toISOString()),
    model: String(params.payload.model || 'gemini-4-hydrogen'),
    isFootballMatchScreenshot: isFootballMatch,
    league,
    matchStatus: String(raw.matchStatus || 'Pre-Match'),
    homeTeam,
    awayTeam,
    visibleOddsOrScore: String(raw.visibleOddsOrScore || `${homeTeam} vs ${awayTeam} Power Matrix`),
    overallConfidence: isFootballMatch ? clampConfidence(raw.overallConfidence, 99.99) : 0,
    workingSummary: String(
      raw.workingSummary ||
        `${homeTeam} vs ${awayTeam} evaluated across winner, handicap, goal line, correct score, BTTS, HT/FT, corners, and cards.`
    ),
    workingMatchSteps: normalizedSteps,
    groundingSources,
    topLockPick: {
      market: String(rawTopLock.market || 'Team to Win (1X2)'),
      selection: String(rawTopLock.selection || winningPick),
      confidence: topLockConf,
      tier: normalizeTier(rawTopLock.tier, topLockConf),
      rationale: String(
        rawTopLock.rationale ||
          'Highest multi-model alignment across team strength, market spread, and scoring expectancy.'
      ),
    },
    winningTeam: {
      pick: winningPick,
      pickType:
        rawWinner.pickType === 'DRAW' || rawWinner.pickType === 'AWAY_WIN'
          ? rawWinner.pickType
          : 'HOME_WIN',
      homeWinProb: Number(((homeProb / totalProb) * 100).toFixed(1)),
      drawProb: Number(((drawProb / totalProb) * 100).toFixed(1)),
      awayWinProb: Number(((awayProb / totalProb) * 100).toFixed(1)),
      confidence: winConf,
      tier: normalizeTier(rawWinner.tier, winConf),
      reasoning: String(rawWinner.reasoning || 'Superior win probability based on match profile.'),
    },
    asianHandicap: {
      line: String(rawHandicap.line || '-0.5'),
      recommendedSide: String(rawHandicap.recommendedSide || homeTeam),
      pickLabel: String(rawHandicap.pickLabel || `${homeTeam} -0.5`),
      confidence: hcpConf,
      tier: normalizeTier(rawHandicap.tier, hcpConf),
      reasoning: String(rawHandicap.reasoning || 'Favorable spread coverage detected.'),
    },
    overUnder: {
      goalLine: String(rawOverUnder.goalLine || '2.5'),
      pick: rawOverUnder.pick === 'UNDER' ? 'UNDER' : 'OVER',
      pickLabel: String(rawOverUnder.pickLabel || 'Over 2.5 Goals'),
      expectedTotalGoals: Number(rawOverUnder.expectedTotalGoals || 2.8),
      confidence: ouConf,
      tier: normalizeTier(rawOverUnder.tier, ouConf),
      reasoning: String(rawOverUnder.reasoning || 'Attacking tempo supports goal line pick.'),
    },
    correctScore: {
      primaryScore: String(rawScore.primaryScore || '2 - 1'),
      alternativeScores: Array.isArray(rawScore.alternativeScores)
        ? rawScore.alternativeScores.slice(0, 3).map(String)
        : ['2 - 0', '1 - 1'],
      confidence: scoreConf,
      tier: normalizeTier(rawScore.tier, scoreConf),
      reasoning: String(rawScore.reasoning || 'Most likely final score distribution.'),
    },
    btts: {
      pick: String(rawBtts.pick || '').toUpperCase() === 'NO' ? 'NO' : 'YES',
      pickLabel: String(rawBtts.pickLabel || (String(rawBtts.pick || '').toUpperCase() === 'NO' ? 'BTTS No' : 'BTTS Yes')),
      yesProb: Number(((yesProbRaw / bttsTotal) * 100).toFixed(1)),
      noProb: Number(((noProbRaw / bttsTotal) * 100).toFixed(1)),
      confidence: bttsConf,
      tier: normalizeTier(rawBtts.tier, bttsConf),
      reasoning: String(rawBtts.reasoning || 'Expected chance creation and defensive clean-sheet rates.'),
    },
    halfTimeFullTime: {
      primaryCombo: String(rawHtFt.primaryCombo || 'Home / Home'),
      backupCombo: String(rawHtFt.backupCombo || 'Draw / Home'),
      confidence: htFtConf,
      tier: normalizeTier(rawHtFt.tier, htFtConf),
      reasoning: String(rawHtFt.reasoning || 'First-half tempo projection and second-half depth advantage.'),
    },
    corners: {
      line: String(rawCorners.line || '9.5'),
      pick: String(rawCorners.pick || '').toUpperCase() === 'UNDER' ? 'UNDER' : 'OVER',
      pickLabel: String(
        rawCorners.pickLabel ||
          `${String(rawCorners.pick || '').toUpperCase() === 'UNDER' ? 'Under' : 'Over'} ${String(
            rawCorners.line || '9.5'
          )} Corners`
      ),
      expectedCorners: Number(rawCorners.expectedCorners || 10.2),
      confidence: cornerConf,
      tier: normalizeTier(rawCorners.tier, cornerConf),
      reasoning: String(rawCorners.reasoning || 'Wing play volume and shot deflection rate.'),
    },
    cards: {
      line: String(rawCards.line || '3.5'),
      pick: String(rawCards.pick || '').toUpperCase() === 'UNDER' ? 'UNDER' : 'OVER',
      pickLabel: String(
        rawCards.pickLabel ||
          `${String(rawCards.pick || '').toUpperCase() === 'UNDER' ? 'Under' : 'Over'} ${String(
            rawCards.line || '3.5'
          )} Cards`
      ),
      expectedCards: Number(rawCards.expectedCards || 4.1),
      intensityLevel:
        rawCards.intensityLevel === 'Low' || rawCards.intensityLevel === 'High'
          ? rawCards.intensityLevel
          : 'Moderate',
      confidence: cardConf,
      tier: normalizeTier(rawCards.tier, cardConf),
      reasoning: String(rawCards.reasoning || 'Foul tempo and tactical transition stops.'),
    },
  };
}

function tierDisplayLabel(tier: FootballMarketConfidenceTier): { text: string; colorClass: string } {
  if (tier === 'LOCK') return { text: 'Top Lock', colorClass: 'text-emerald-400' };
  if (tier === 'HIGH') return { text: 'High Conf', colorClass: 'text-cyan-300' };
  return { text: 'Value Edge', colorClass: 'text-amber-300' };
}

export const FootballPredictionView: React.FC = () => {
  const { firebaseUser, signInGoogle, getFreshToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Input Mode & Photo Scan State
  const [inputMode, setInputMode] = useState<InputMode>('photo');
  const [photos, setPhotos] = useState<UploadedMatchPhoto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchNote, setMatchNote] = useState('');
  const [modelMode, setModelMode] = useState<VisionModelMode>('auto');
  const [isDragging, setIsDragging] = useState(false);
  const [isScanningAll, setIsScanningAll] = useState(false);

  // Manual Matchup Search State
  const [homeInput, setHomeInput] = useState('');
  const [awayInput, setAwayInput] = useState('');
  const [leagueInput, setLeagueInput] = useState('Premier League');
  const [matchTiming, setMatchTiming] = useState<'Pre-Match' | 'Live In-Play'>('Pre-Match');
  const [useWebGrounding, setUseWebGrounding] = useState(true);
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [manualError, setManualError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [manualPrediction, setManualPrediction] = useState<FootballMatchPredictionResult | null>(null);

  // Matrix Filtering & Cloud Sync State
  const [matrixFilter, setMatrixFilter] = useState<MatrixFilter>('all');
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);
  const [savedPredictions, setSavedPredictions] = useState<FirestoreFootballPredictionDoc[]>([]);

  useEffect(() => {
    if (!firebaseUser) {
      setSavedPredictions([]);
      return;
    }
    const unsub = subscribeToUserFootballPredictions(firebaseUser.uid, (items) => {
      setSavedPredictions(items);
    });
    return () => unsub();
  }, [firebaseUser]);

  const selectedPhoto = photos.find((p) => p.id === selectedId) || photos[0] || null;
  const activePrediction: FootballMatchPredictionResult | undefined =
    inputMode === 'manual'
      ? manualPrediction || undefined
      : selectedPhoto?.prediction || manualPrediction || undefined;

  const isWorking =
    (inputMode === 'manual' && isManualLoading) ||
    (inputMode === 'photo' && selectedPhoto?.status === 'scanning');

  const handleFilesAdded = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const loaded: UploadedMatchPhoto[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      const prepared = await prepareMatchImageForVision(file);
      loaded.push({
        id: `match_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        fileName: file.name,
        mimeType: prepared.mimeType,
        dataUrl: prepared.dataUrl,
        status: 'pending',
      });
    }

    if (loaded.length > 0) {
      sound.playClick();
      setInputMode('photo');
      setPhotos((prev) => [...loaded, ...prev].slice(0, 12));
      setSelectedId(loaded[0].id);
      setCloudMessage(null);
    }
  };

  const scanMatchPhoto = async (
    photo: UploadedMatchPhoto,
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
      const res = await fetch('/api/ai/scan-football', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMode: 'photo',
          imageBase64: photo.dataUrl,
          mimeType: photo.mimeType,
          modelMode: activeMode,
          note: matchNote.trim() || undefined,
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
            : `Football AI service returned HTTP ${res.status}. Please click Retry.`
        );
      }

      if (!res.ok) {
        const cleanMsg = extractReadableErrorMessage(
          payload?.error || `Football AI scan failed (HTTP ${res.status}).`
        );
        const err = new Error(cleanMsg) as Error & { retryable?: boolean };
        err.retryable =
          Boolean(payload?.retryable) || res.status === 503 || res.status === 429 || res.status >= 500;
        throw err;
      }

      const prediction = normalizePredictionPayload({
        id: photo.id,
        inputMode: 'photo',
        fileName: photo.fileName,
        previewUrl: photo.dataUrl,
        payload,
      });

      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id
            ? { ...p, status: 'done', errorMessage: undefined, retryable: false, prediction }
            : p
        )
      );
      setMatrixFilter('all');
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

  const handleManualPredict = async (overrideMode?: VisionModelMode) => {
    const cleanHome = homeInput.trim();
    const cleanAway = awayInput.trim();
    if (!cleanHome || !cleanAway) {
      setManualError({
        message: 'Please enter both Home Team and Away Team before running Power AI prediction.',
        retryable: false,
      });
      return;
    }

    const activeMode = overrideMode || modelMode;
    sound.playStepChime(1);
    setManualError(null);
    setCloudMessage(null);
    setIsManualLoading(true);

    try {
      const res = await fetch('/api/ai/scan-football', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMode: 'manual',
          homeTeam: cleanHome,
          awayTeam: cleanAway,
          league: leagueInput.trim() || undefined,
          matchTiming,
          useWebGrounding,
          modelMode: activeMode,
          note: matchNote.trim() || undefined,
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
            : `Football AI service returned HTTP ${res.status}. Please click Retry.`
        );
      }

      if (!res.ok) {
        const cleanMsg = extractReadableErrorMessage(
          payload?.error || `Matchup prediction failed (HTTP ${res.status}).`
        );
        const err = new Error(cleanMsg) as Error & { retryable?: boolean };
        err.retryable =
          Boolean(payload?.retryable) || res.status === 503 || res.status === 429 || res.status >= 500;
        throw err;
      }

      const prediction = normalizePredictionPayload({
        id: `manual_${Date.now()}`,
        inputMode: 'manual',
        fileName: `${cleanHome} vs ${cleanAway}`,
        payload,
        fallbackHome: cleanHome,
        fallbackAway: cleanAway,
        fallbackLeague: leagueInput.trim() || 'International',
      });

      setManualPrediction(prediction);
      setMatrixFilter('all');
      sound.playCompleteFanfare();
    } catch (err: unknown) {
      const errObj = err as Error & { retryable?: boolean };
      setManualError({
        message: extractReadableErrorMessage(errObj?.message || err),
        retryable: errObj?.retryable ?? true,
      });
    } finally {
      setIsManualLoading(false);
    }
  };

  const handleScanAll = async () => {
    if (photos.length === 0 || isScanningAll) return;
    setIsScanningAll(true);
    for (const item of photos) {
      await scanMatchPhoto(item);
    }
    setIsScanningAll(false);
  };

  const handleSaveCloud = async (prediction: FootballMatchPredictionResult) => {
    if (!firebaseUser) {
      await signInGoogle();
      return;
    }

    setIsSavingCloud(true);
    setCloudMessage(null);
    try {
      await saveFootballPredictionToFirestore(firebaseUser.uid, prediction);

      const token = await getFreshToken();
      if (token) {
        const dbRes = await fetch('/api/ai/football-scans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            league: prediction.league,
            homeTeam: prediction.homeTeam,
            awayTeam: prediction.awayTeam,
            winningTeamPick: prediction.winningTeam.pick,
            handicapPick: prediction.asianHandicap.pickLabel,
            overUnderPick: prediction.overUnder.pickLabel,
            correctScorePick: prediction.correctScore.primaryScore,
            confidence: prediction.overallConfidence,
            workingAnalysis: prediction.workingSummary,
            markets: {
              topLockPick: prediction.topLockPick,
              winningTeam: prediction.winningTeam,
              asianHandicap: prediction.asianHandicap,
              overUnder: prediction.overUnder,
              correctScore: prediction.correctScore,
              btts: prediction.btts,
              halfTimeFullTime: prediction.halfTimeFullTime,
              corners: prediction.corners,
              cards: prediction.cards,
            },
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
      setCloudMessage('Power AI 8-market prediction saved to Firebase & Cloud SQL.');
    } catch (err: unknown) {
      setCloudMessage(extractReadableErrorMessage(err));
    } finally {
      setIsSavingCloud(false);
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const swapTeams = () => {
    setHomeInput(awayInput);
    setAwayInput(homeInput);
  };

  // Market Visibility Helpers for Matrix Filtering
  const isMarketVisible = (category: 'core' | 'props', conf: number) => {
    if (matrixFilter === 'all') return true;
    if (matrixFilter === 'core') return category === 'core';
    if (matrixFilter === 'props') return category === 'props';
    return conf >= 90;
  };

  const visibleMarketCount = activePrediction
    ? [
        isMarketVisible('core', activePrediction.winningTeam.confidence),
        isMarketVisible('core', activePrediction.asianHandicap.confidence),
        isMarketVisible('core', activePrediction.overUnder.confidence),
        isMarketVisible('core', activePrediction.correctScore.confidence),
        isMarketVisible('props', activePrediction.btts.confidence),
        isMarketVisible('props', activePrediction.halfTimeFullTime.confidence),
        isMarketVisible('props', activePrediction.corners.confidence),
        isMarketVisible('props', activePrediction.cards.confidence),
      ].filter(Boolean).length
    : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1610] border border-[#1c3423] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Trophy size={24} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Power AI Match Football Prediction
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
              <span>Photo Scan &amp; Matchup Search</span>
              <span aria-hidden="true">·</span>
              <span>Top AI Lock Pick</span>
              <span aria-hidden="true">·</span>
              <span>8-Market Confidence Matrix</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                AI Help Prediction 99.99%
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {!firebaseUser ? (
            <button
              type="button"
              onClick={() => void signInGoogle()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Cloud size={15} className="text-emerald-400" />
              <span>Sign In to Sync Cloud</span>
            </button>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 whitespace-nowrap">
              <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px]">{firebaseUser.email}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4-Step Pipeline Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            num: '01',
            title: inputMode === 'photo' ? 'Upload Photos Match' : 'Search Team Matchup',
            sub: inputMode === 'photo' ? 'Fixtures, odds or scoreboard' : 'Home vs Away + live web form',
            active: inputMode === 'photo' ? photos.length > 0 : Boolean(homeInput.trim() && awayInput.trim()),
          },
          {
            num: '02',
            title: 'Power AI Analysis',
            sub: 'Vision + Web Search grounding',
            active: isWorking || Boolean(activePrediction),
          },
          {
            num: '03',
            title: 'AI Working Match',
            sub: 'Tactical tempo & market edge',
            active: Boolean(activePrediction),
          },
          {
            num: '04',
            title: 'Top Lock & 8 Markets',
            sub: '1X2 · Hcp · O/U · CS · BTTS · HT/FT',
            active: Boolean(activePrediction),
          },
        ].map((step) => (
          <div
            key={step.num}
            className={`p-4 rounded-xl border transition-colors ${
              step.active
                ? 'bg-[#102016] border-emerald-500/45'
                : 'bg-[#0c1610] border-[#1c3423]'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono tabular-nums font-bold text-emerald-400">
                {step.num}
              </span>
              {step.active && <CheckCircle2 size={14} className="text-emerald-400" />}
            </div>
            <div className="text-sm font-semibold text-white">{step.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{step.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dual Input Mode + Engine Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Input Mode Segmented Switcher */}
          <div className="p-1.5 rounded-xl bg-[#0c1610] border border-[#1c3423] grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setInputMode('photo');
              }}
              className={`min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer ${
                inputMode === 'photo'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload size={15} />
              <span>Photo Match Scan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setInputMode('manual');
              }}
              className={`min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer ${
                inputMode === 'manual'
                  ? 'bg-emerald-500 text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search size={15} />
              <span>Matchup Search</span>
            </button>
          </div>

          {inputMode === 'photo' ? (
            <>
              {/* Photo Drag & Drop */}
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
                className={`p-6 rounded-2xl border-2 border-dashed transition-colors text-center space-y-3 ${
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
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Upload size={22} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">1. Upload Photos Match</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Drop PNG or JPG screenshots of football fixtures, odds lines, or live stats
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[44px] w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer"
                >
                  <ImageIcon size={16} />
                  <span>Select Match Photos</span>
                </button>
              </div>
            </>
          ) : (
            /* Manual Team Matchup Search Form */
            <div className="p-5 rounded-2xl bg-[#0c1610] border border-[#1c3423] space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white">1. Quick Matchup Search</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Enter any upcoming or live match to run Power AI across all 8 betting markets
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-2 items-end">
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1.5">
                    Home Team
                  </label>
                  <input
                    type="text"
                    value={homeInput}
                    onChange={(e) => setHomeInput(e.target.value)}
                    placeholder="e.g. Arsenal"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#070e09] border border-[#1f3d28] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={swapTeams}
                  title="Swap Home and Away teams"
                  className="min-h-[42px] px-2.5 rounded-xl bg-[#08100b] hover:bg-[#132619] border border-[#1f3d28] text-gray-300 hover:text-emerald-400 flex items-center justify-center transition cursor-pointer shrink-0"
                >
                  <ArrowLeftRight size={15} />
                </button>
                <div>
                  <label className="text-xs font-medium text-gray-300 block mb-1.5">
                    Away Team
                  </label>
                  <input
                    type="text"
                    value={awayInput}
                    onChange={(e) => setAwayInput(e.target.value)}
                    placeholder="e.g. Chelsea"
                    className="w-full min-h-[42px] px-3 rounded-xl bg-[#070e09] border border-[#1f3d28] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300 block">
                  Competition / League
                </label>
                <input
                  type="text"
                  value={leagueInput}
                  onChange={(e) => setLeagueInput(e.target.value)}
                  placeholder="e.g. Premier League"
                  className="w-full min-h-[42px] px-3 rounded-xl bg-[#070e09] border border-[#1f3d28] text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {LEAGUE_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLeagueInput(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition whitespace-nowrap cursor-pointer ${
                        leagueInput === preset
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-[#08100b] border-[#1c3423] text-gray-400 hover:text-white'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMatchTiming('Pre-Match')}
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold border transition whitespace-nowrap cursor-pointer ${
                    matchTiming === 'Pre-Match'
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#08100b] border-[#1c3423] text-gray-400 hover:text-white'
                  }`}
                >
                  Pre-Match
                </button>
                <button
                  type="button"
                  onClick={() => setMatchTiming('Live In-Play')}
                  className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold border transition whitespace-nowrap cursor-pointer ${
                    matchTiming === 'Live In-Play'
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                      : 'bg-[#08100b] border-[#1c3423] text-gray-400 hover:text-white'
                  }`}
                >
                  Live In-Play
                </button>
              </div>

              <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#08100b] border border-[#1a3322] cursor-pointer">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe size={15} className="text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white">Live Web Form Grounding</div>
                    <div className="text-[11px] text-gray-400 truncate">
                      Pull latest form, injuries &amp; H2H via Google Search
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={useWebGrounding}
                  onChange={(e) => setUseWebGrounding(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 shrink-0 cursor-pointer"
                />
              </label>
            </div>
          )}

          {/* Engine & Odds Note Controls */}
          <div className="p-4 rounded-2xl bg-[#0c1610] border border-[#1c3423] space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1.5">
                AI Vision &amp; Odds Engine
              </label>
              <select
                value={modelMode}
                onChange={(e) => setModelMode(e.target.value as VisionModelMode)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#070e09] border border-[#1f3d28] text-xs text-emerald-300 font-medium"
              >
                <option value="auto">Auto (Hydrogen + Flash-Lite Failover)</option>
                <option value="gemini-4-hydrogen">Gemini 4 Hydrogen (Deep)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash-Lite (Fast)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-300 block mb-1.5">
                Optional Odds, Line or Live Score Note
              </label>
              <input
                type="text"
                value={matchNote}
                onChange={(e) => setMatchNote(e.target.value)}
                placeholder="e.g. Asian Hcp -0.75, O/U 2.75 or Live 60' 1-1..."
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#070e09] border border-[#1f3d28] text-xs text-white placeholder:text-gray-500"
              />
            </div>

            {inputMode === 'photo' && photos.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={!selectedPhoto || selectedPhoto.status === 'scanning'}
                  onClick={() => selectedPhoto && void scanMatchPhoto(selectedPhoto)}
                  className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {selectedPhoto?.status === 'scanning' ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Analyzing All Markets...</span>
                    </>
                  ) : (
                    <>
                      <ScanLine size={16} />
                      <span>2. Power AI Scan Match</span>
                    </>
                  )}
                </button>
                {photos.length > 1 && (
                  <button
                    type="button"
                    disabled={isScanningAll}
                    onClick={() => void handleScanAll()}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#132619] hover:bg-[#1a3423] border border-emerald-500/35 text-emerald-300 font-semibold text-xs transition whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isScanningAll ? 'Scanning...' : `Scan All (${photos.length})`}
                  </button>
                )}
              </div>
            )}

            {inputMode === 'manual' && (
              <button
                type="button"
                disabled={isManualLoading}
                onClick={() => void handleManualPredict()}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isManualLoading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Running Power AI Matrix...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>2. Run Power AI All-Market Prediction</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Uploaded Match Queue (Photo Mode) */}
          {inputMode === 'photo' && photos.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#0c1610] border border-[#1c3423] space-y-3">
              <div className="text-xs font-semibold text-gray-200 flex items-center justify-between">
                <span>Match Queue ({photos.length})</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhotos([]);
                    setSelectedId(null);
                  }}
                  className="text-xs text-red-400 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="divide-y divide-[#172c1e] max-h-60 overflow-y-auto">
                {photos.map((photo) => {
                  const isSel = selectedPhoto?.id === photo.id;
                  return (
                    <div
                      key={photo.id}
                      onClick={() => setSelectedId(photo.id)}
                      className={`py-2.5 px-2 flex items-center gap-3 cursor-pointer rounded-lg transition-colors ${
                        isSel ? 'bg-emerald-500/10' : 'hover:bg-white/5'
                      }`}
                    >
                      <img
                        src={photo.dataUrl}
                        alt={photo.fileName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-white truncate">
                          {photo.prediction
                            ? `${photo.prediction.homeTeam} vs ${photo.prediction.awayTeam}`
                            : photo.fileName}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          {photo.status === 'pending' && (
                            <span className="text-gray-400">Ready to scan</span>
                          )}
                          {photo.status === 'scanning' && (
                            <span className="text-cyan-300 font-medium">
                              AI Working Match...
                            </span>
                          )}
                          {photo.status === 'done' && photo.prediction && (
                            <span className="text-emerald-400 font-mono tabular-nums truncate block">
                              {photo.prediction.topLockPick.selection} ·{' '}
                              {photo.prediction.correctScore.primaryScore}
                            </span>
                          )}
                          {photo.status === 'error' && (
                            <span className="text-red-400 font-medium">
                              Scan Error · Tap Retry
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
                            void scanMatchPhoto(photo);
                          }}
                          title="Retry match scan"
                          className="p-2 rounded-lg text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 cursor-pointer shrink-0"
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
                        title="Remove photo"
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Match Photo Preview */}
          {inputMode === 'photo' && selectedPhoto && (
            <div className="relative rounded-2xl overflow-hidden border border-[#1c3423] bg-black">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.fileName}
                referrerPolicy="no-referrer"
                className="w-full max-h-72 object-contain mx-auto"
              />
              {selectedPhoto.status === 'scanning' && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 px-4 text-center">
                  <RefreshCw size={28} className="text-emerald-400 animate-spin" />
                  <div className="text-xs font-bold text-white">
                    AI Working Match &amp; 8-Market Matrix...
                  </div>
                  <div className="text-[11px] text-gray-300">
                    Calculating Top Lock, 1X2, Handicap, O/U, Score, BTTS, HT/FT, Corners &amp; Cards
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Top Lock Spotlight + 8-Market Confidence Matrix + Tactical Working */}
        <div className="lg:col-span-7 space-y-4">
          {/* Error Banners */}
          {inputMode === 'photo' && selectedPhoto?.status === 'error' && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="font-bold text-red-300">Match Scan Error</div>
                  <p className="leading-relaxed">{selectedPhoto.errorMessage}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-8">
                <button
                  type="button"
                  onClick={() => void scanMatchPhoto(selectedPhoto)}
                  className="px-3.5 py-2 rounded-xl bg-red-500/25 hover:bg-red-500/35 border border-red-400/50 text-white text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry Scan</span>
                </button>
                {selectedPhoto.retryable !== false && modelMode !== 'gemini-3.1-flash-lite' && (
                  <button
                    type="button"
                    onClick={() => {
                      setModelMode('gemini-3.1-flash-lite');
                      void scanMatchPhoto(selectedPhoto, 'gemini-3.1-flash-lite');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                  >
                    <Sparkles size={13} />
                    <span>Try Fast Flash-Lite Engine</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {inputMode === 'manual' && manualError && (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-200 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1 flex-1">
                  <div className="font-bold text-red-300">Matchup Analysis Error</div>
                  <p className="leading-relaxed">{manualError.message}</p>
                </div>
              </div>
              {manualError.retryable && (
                <div className="flex flex-wrap items-center gap-2 pl-8">
                  <button
                    type="button"
                    onClick={() => void handleManualPredict()}
                    className="px-3.5 py-2 rounded-xl bg-red-500/25 hover:bg-red-500/35 border border-red-400/50 text-white text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Retry Analysis</span>
                  </button>
                  {modelMode !== 'gemini-3.1-flash-lite' && (
                    <button
                      type="button"
                      onClick={() => {
                        setModelMode('gemini-3.1-flash-lite');
                        void handleManualPredict('gemini-3.1-flash-lite');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Try Fast Flash-Lite Engine</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {isManualLoading && inputMode === 'manual' ? (
            <div className="p-8 rounded-2xl bg-[#0c1610] border border-[#1c3423] text-center space-y-3">
              <RefreshCw size={30} className="mx-auto text-emerald-400 animate-spin" />
              <h3 className="text-base font-bold text-white">
                AI Working Match: {homeInput} vs {awayInput}
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                {useWebGrounding
                  ? 'Gathering live team form via Google Search and calibrating all 8 betting markets plus Top AI Lock Pick...'
                  : 'Calibrating Winner, Asian Handicap, Over/Under, Correct Score, BTTS, HT/FT, Corners & Cards...'}
              </p>
            </div>
          ) : !activePrediction ? (
            <div className="p-8 rounded-2xl bg-[#0c1610] border border-[#1c3423] text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Trophy size={26} />
              </div>
              <h3 className="text-base font-bold text-white">
                Top AI Lock Pick &amp; 8-Market Confidence Matrix
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                Upload a match screenshot or switch to <strong className="text-emerald-400">Matchup Search</strong> on the left. Power AI delivers your{' '}
                <strong className="text-white">Top Lock Pick</strong> and full predictions for{' '}
                <strong className="text-white">1X2, Asian Handicap, Over/Under, Correct Score, BTTS, HT/FT, Corners &amp; Cards</strong>.
              </p>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1610] border border-[#1c3423] space-y-6">
              {/* Matchup Summary Header */}
              <div className="pb-5 border-b border-[#172c1e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                    <span className="text-emerald-400 font-semibold">{activePrediction.league}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activePrediction.matchStatus}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-gray-300">{activePrediction.model}</span>
                    {activePrediction.inputMode === 'manual' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>Matchup Search</span>
                      </>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {activePrediction.homeTeam}{' '}
                    <span className="text-gray-500 font-normal">vs</span>{' '}
                    {activePrediction.awayTeam}
                  </h3>
                  <p className="text-xs text-gray-400">{activePrediction.visibleOddsOrScore}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs text-gray-400 font-medium">AI Help Prediction</div>
                  <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
                    {activePrediction.overallConfidence.toFixed(2)}%
                  </div>
                </div>
              </div>

              {!activePrediction.isFootballMatchScreenshot ? (
                <div className="p-5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-amber-300">
                        Not a Football Match or Odds Screenshot
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {activePrediction.workingSummary}
                      </p>
                    </div>
                  </div>
                  <div className="pl-8 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setInputMode('manual')}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
                    >
                      <Search size={13} />
                      <span>Switch to Matchup Search</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
              {/* Top AI Lock Pick Spotlight */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#102418] border border-emerald-500/45 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Lock size={15} className="text-emerald-400 shrink-0" />
                    <span>Top AI Lock Pick</span>
                    <span aria-hidden="true" className="text-emerald-500/60">·</span>
                    <span className="text-gray-300 font-medium">
                      {activePrediction.topLockPick.market}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums text-sm font-bold text-emerald-400">
                    {activePrediction.topLockPick.confidence.toFixed(2)}% Confidence
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {activePrediction.topLockPick.selection}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {activePrediction.topLockPick.rationale}
                </p>
              </div>

              {/* Matrix Filter Tabs */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target size={16} className="text-emerald-400 shrink-0" />
                    <span>4. All-Market Confidence Matrix</span>
                  </h4>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#08100b] border border-[#1a3322] overflow-x-auto">
                    {(
                      [
                        { id: 'all', label: 'All (8)' },
                        { id: 'high', label: 'High ≥ 90%' },
                        { id: 'core', label: 'Core (4)' },
                        { id: 'props', label: 'Props (4)' },
                      ] as { id: MatrixFilter; label: string }[]
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setMatrixFilter(tab.id)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                          matrixFilter === tab.id
                            ? 'bg-emerald-500 text-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {visibleMarketCount === 0 ? (
                  <div className="p-6 rounded-xl bg-[#08100b] border border-[#1a3322] text-center space-y-2.5">
                    <p className="text-xs text-gray-400">
                      No markets in this match cleared the 90% filter threshold.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMatrixFilter('all')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer"
                    >
                      Show All 8 Markets
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Market 1: The Team of a Win (1X2) */}
                    {isMarketVisible('core', activePrediction.winningTeam.confidence) && (
                      <div className="p-4 rounded-xl bg-[#08100b] border border-[#1a3322] space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                          <span className="flex items-center gap-1.5">
                            <Trophy size={13} className="text-emerald-400 shrink-0" />
                            <span>Team to Win (1X2)</span>
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${tierDisplayLabel(activePrediction.winningTeam.tier).colorClass}`}>
                            {tierDisplayLabel(activePrediction.winningTeam.tier).text} · {activePrediction.winningTeam.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-base font-bold text-emerald-400">
                          {activePrediction.winningTeam.pick}
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-2 rounded-full bg-[#122418] overflow-hidden flex">
                            <div
                              style={{ width: `${activePrediction.winningTeam.homeWinProb}%` }}
                              className="h-full bg-emerald-500"
                            />
                            <div
                              style={{ width: `${activePrediction.winningTeam.drawProb}%` }}
                              className="h-full bg-amber-400"
                            />
                            <div
                              style={{ width: `${activePrediction.winningTeam.awayWinProb}%` }}
                              className="h-full bg-cyan-400"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-gray-400">
                            <span>H {activePrediction.winningTeam.homeWinProb}%</span>
                            <span>D {activePrediction.winningTeam.drawProb}%</span>
                            <span>A {activePrediction.winningTeam.awayWinProb}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {activePrediction.winningTeam.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Market 2: Asian Handicap */}
                    {isMarketVisible('core', activePrediction.asianHandicap.confidence) && (
                      <div className="p-4 rounded-xl bg-[#08100b] border border-[#1a3322] space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                          <span className="flex items-center gap-1.5">
                            <Scale size={13} className="text-amber-400 shrink-0" />
                            <span>Asian Handicap</span>
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${tierDisplayLabel(activePrediction.asianHandicap.tier).colorClass}`}>
                            {tierDisplayLabel(activePrediction.asianHandicap.tier).text} · {activePrediction.asianHandicap.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-base font-bold text-amber-300 font-mono tabular-nums">
                          {activePrediction.asianHandicap.pickLabel}
                        </div>
                        <div className="text-xs text-gray-300">
                          Line <span className="font-mono tabular-nums text-white">{activePrediction.asianHandicap.line}</span>
                          {' · '}
                          Side <span className="text-white">{activePrediction.asianHandicap.recommendedSide}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {activePrediction.asianHandicap.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Market 3: Over / Under Goals */}
                    {isMarketVisible('core', activePrediction.overUnder.confidence) && (
                      <div className="p-4 rounded-xl bg-[#08100b] border border-[#1a3322] space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                          <span className="flex items-center gap-1.5">
                            <BarChart3 size={13} className="text-cyan-400 shrink-0" />
                            <span>Over / Under Goals</span>
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${tierDisplayLabel(activePrediction.overUnder.tier).colorClass}`}>
                            {tierDisplayLabel(activePrediction.overUnder.tier).text} · {activePrediction.overUnder.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-base font-bold text-cyan-300 font-mono tabular-nums">
                          {activePrediction.overUnder.pickLabel}
                        </div>
                        <div className="text-xs text-gray-300">
                          Line <span className="font-mono tabular-nums text-white">{activePrediction.overUnder.goalLine}</span>
                          {' · '}
                          Est. Goals{' '}
                          <span className="font-mono tabular-nums text-white">
                            {activePrediction.overUnder.expectedTotalGoals.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {activePrediction.overUnder.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Market 4: Correct Score */}
                    {isMarketVisible('core', activePrediction.correctScore.confidence) && (
                      <div className="p-4 rounded-xl bg-[#08100b] border border-[#1a3322] space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                          <span className="flex items-center gap-1.5">
                            <Target size={13} className="text-emerald-400 shrink-0" />
                            <span>Correct Score</span>
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${tierDisplayLabel(activePrediction.correctScore.tier).colorClass}`}>
                            {tierDisplayLabel(activePrediction.correctScore.tier).text} · {activePrediction.correctScore.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-white font-mono tabular-nums tracking-wider">
                          {activePrediction.correctScore.primaryScore}
                        </div>
                        <div className="text-xs text-gray-300 font-mono tabular-nums">
                          Backup:{' '}
                          <span className="text-gray-200">
                            {activePrediction.correctScore.alternativeScores.join(' · ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {activePrediction.correctScore.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Market 5: Both Teams to Score (BTTS) */}
                    {isMarketVisible('props', activePrediction.btts.confidence) && (
                      <div className="p-4 rounded-xl bg-[#08100b] border border-[#1a3322] space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                          <span className="flex items-center gap-1.5">
                            <Layers size={13} className="text-emerald-400 shrink-0" />
                            <span>Both Teams to Score</span>
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${tierDisplayLabel(activePrediction.btts.tier).colorClass}`}>
                            {tierDisplayLabel(activePrediction.btts.tier).text} · {activePrediction.btts.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-base font-bold text-emerald-300">
                          {activePrediction.btts.pickLabel}
                        </div>
                        <div className="space-y-1">
                          <div className="w-full h-2 rounded-full bg-[#122418] overflow-hidden flex">
                            <div
                              style={{ width: `${activePrediction.btts.yesProb}%` }}
                              className="h-full bg-emerald-500"
                            />
                            <div
                              style={{ width: `${activePrediction.btts.noProb}%` }}
                              className="h-full bg-slate-500"
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-gray-400">
                            <span>Yes {activePrediction.btts.yesProb}%</span>
                            <span>No {activePrediction.btts.noProb}%</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {activePrediction.btts.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Market 6: Half-Time / Full-Time (HT/FT) */}
                    {isMarketVisible('props', activePrediction.halfTimeFullTime.confidence) && (
                      <div className="p-4 rounded-xl bg-[#08100b] border border-[#1a3322] space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-amber-400 shrink-0" />
                            <span>Half-Time / Full-Time</span>
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${tierDisplayLabel(activePrediction.halfTimeFullTime.tier).colorClass}`}>
                            {tierDisplayLabel(activePrediction.halfTimeFullTime.tier).text} · {activePrediction.halfTimeFullTime.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-base font-bold text-amber-300">
                          {activePrediction.halfTimeFullTime.primaryCombo}
                        </div>
                        <div className="text-xs text-gray-300">
                          Backup Combo:{' '}
                          <span className="text-white font-medium">
                            {activePrediction.halfTimeFullTime.backupCombo}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {activePrediction.halfTimeFullTime.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Market 7: Corners Over / Under */}
                    {isMarketVisible('props', activePrediction.corners.confidence) && (
                      <div className="p-4 rounded-xl bg-[#08100b] border border-[#1a3322] space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                          <span className="flex items-center gap-1.5">
                            <Flag size={13} className="text-cyan-400 shrink-0" />
                            <span>Corners Over / Under</span>
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${tierDisplayLabel(activePrediction.corners.tier).colorClass}`}>
                            {tierDisplayLabel(activePrediction.corners.tier).text} · {activePrediction.corners.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-base font-bold text-cyan-300 font-mono tabular-nums">
                          {activePrediction.corners.pickLabel}
                        </div>
                        <div className="text-xs text-gray-300">
                          Line <span className="font-mono tabular-nums text-white">{activePrediction.corners.line}</span>
                          {' · '}
                          Est. Corners{' '}
                          <span className="font-mono tabular-nums text-white">
                            {activePrediction.corners.expectedCorners.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {activePrediction.corners.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Market 8: Cards & Bookings */}
                    {isMarketVisible('props', activePrediction.cards.confidence) && (
                      <div className="p-4 rounded-xl bg-[#08100b] border border-[#1a3322] space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert size={13} className="text-amber-400 shrink-0" />
                            <span>Cards &amp; Bookings</span>
                          </span>
                          <span className={`font-mono tabular-nums font-semibold ${tierDisplayLabel(activePrediction.cards.tier).colorClass}`}>
                            {tierDisplayLabel(activePrediction.cards.tier).text} · {activePrediction.cards.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-base font-bold text-white font-mono tabular-nums">
                          {activePrediction.cards.pickLabel}
                        </div>
                        <div className="text-xs text-gray-300">
                          Est. Cards{' '}
                          <span className="font-mono tabular-nums text-white">
                            {activePrediction.cards.expectedCards.toFixed(1)}
                          </span>
                          {' · '}
                          Intensity{' '}
                          <span className="text-amber-300 font-medium">
                            {activePrediction.cards.intensityLevel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {activePrediction.cards.reasoning}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. AI Working Match Breakdown */}
              <div className="pt-4 border-t border-[#172c1e] space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles size={15} className="text-emerald-400" />
                  <span>3. AI Working Match • Tactical Evaluation</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {activePrediction.workingSummary}
                </p>
                <div className="divide-y divide-[#172c1e] rounded-xl bg-[#08100b] border border-[#1a3322] px-4">
                  {activePrediction.workingMatchSteps.map((step, idx) => (
                    <div key={`${step.stepTitle}_${idx}`} className="py-3 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-white">{step.stepTitle}</span>
                        <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                          {step.signalImpact}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{step.detail}</p>
                    </div>
                  ))}
                </div>

                {/* Live Web Grounding Citations */}
                {activePrediction.groundingSources && activePrediction.groundingSources.length > 0 && (
                  <div className="pt-2 space-y-1.5">
                    <div className="text-[11px] font-semibold text-gray-400 flex items-center gap-1.5">
                      <Globe size={12} className="text-emerald-400" />
                      <span>Verified Web Match Sources</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activePrediction.groundingSources.map((src, i) => (
                        <a
                          key={`${src.uri}_${i}`}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-300 hover:text-emerald-200 underline inline-flex items-center gap-1 max-w-[260px] truncate"
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {cloudMessage && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{cloudMessage}</span>
                </div>
              )}

              {/* Cloud Sync Action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  type="button"
                  disabled={isSavingCloud}
                  onClick={() => void handleSaveCloud(activePrediction)}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  <Cloud size={15} />
                  <span>
                    {!firebaseUser
                      ? 'Sign In & Save Prediction to Cloud'
                      : isSavingCloud
                      ? 'Saving to Firebase & Cloud SQL...'
                      : 'Save Prediction to Firebase & Cloud SQL'}
                  </span>
                </button>
              </div>
                </>
              )}
            </div>
          )}

          {/* Synced Football Predictions History */}
          {firebaseUser && savedPredictions.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0c1610] border border-[#1c3423] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Cloud size={14} className="text-emerald-400" />
                  <span>Saved Football Match Predictions ({savedPredictions.length})</span>
                </h4>
              </div>
              <div className="divide-y divide-[#172c1e]">
                {savedPredictions.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-xs font-bold text-white truncate">
                        {item.matchTitle}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono tabular-nums flex items-center gap-2 flex-wrap">
                        {item.topLockPick && (
                          <>
                            <span className="text-emerald-300 font-semibold">
                              Lock: {item.topLockPick}
                            </span>
                            <span aria-hidden="true">·</span>
                          </>
                        )}
                        <span className="text-emerald-400">{item.winningTeamPick}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.handicapPick}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.overUnderPick}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-white font-semibold">{item.correctScorePick}</span>
                        {item.bttsPick && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.bttsPick}</span>
                          </>
                        )}
                        {item.cornersPick && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>{item.cornersPick}</span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        <span>{Number(item.confidence).toFixed(2)}%</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteFootballPredictionFromFirestore(item.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 shrink-0 cursor-pointer"
                      title="Delete saved prediction"
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
