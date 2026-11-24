import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import {
  Cloud,
  Flame,
  Shield,
  Download,
  CheckCircle2,
  Rocket,
  Lock,
  LogOut,
  Plus,
  Layers,
  Globe,
} from 'lucide-react';
import { firebaseConfig } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  FirestoreCloudflareConfigDoc,
  FirestorePhotoScanDoc,
  FirestoreSignalDoc,
  saveCloudflareConfigToFirestore,
  saveSignalToFirestore,
  subscribeToCloudflareConfigs,
  subscribeToUserPhotoScans,
  subscribeToUserSignals,
} from '../../services/firestoreService';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';

export const CloudflareFirebaseHub: React.FC = () => {
  const { firebaseUser, signInGoogle, signOutAll } = useAuth();

  const [projectName, setProjectName] = useState('apple-of-fortune-edge');
  const [workerName, setWorkerName] = useState('aof-ai-signal-worker');
  const [customDomain, setCustomDomain] = useState('signals.sokrizybet.example');
  const [wafLevel, setWafLevel] = useState<'high' | 'under_attack' | 'medium'>('high');
  const [edgeCacheTtl, setEdgeCacheTtl] = useState(300);

  const [photoScans, setPhotoScans] = useState<FirestorePhotoScanDoc[]>([]);
  const [signals, setSignals] = useState<FirestoreSignalDoc[]>([]);
  const [cfConfigs, setCfConfigs] = useState<FirestoreCloudflareConfigDoc[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isBuildingZip, setIsBuildingZip] = useState(false);

  useEffect(() => {
    if (!firebaseUser) {
      setPhotoScans([]);
      setSignals([]);
      setCfConfigs([]);
      return;
    }

    const u1 = subscribeToUserPhotoScans(firebaseUser.uid, setPhotoScans);
    const u2 = subscribeToUserSignals(firebaseUser.uid, setSignals);
    const u3 = subscribeToCloudflareConfigs(firebaseUser.uid, setCfConfigs);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [firebaseUser]);

  const handleSaveCloudflareProfile = async () => {
    if (!firebaseUser) {
      await signInGoogle();
      return;
    }
    sound.playClick();
    try {
      await saveCloudflareConfigToFirestore(firebaseUser.uid, {
        projectName: projectName.trim() || 'apple-of-fortune-edge',
        workerName: workerName.trim() || 'aof-ai-signal-worker',
        customDomain: customDomain.trim(),
        wafLevel,
        edgeCacheTtl,
      });
      sound.playCompleteFanfare();
      setStatusMsg('Cloudflare Edge configuration synced to Firebase.');
    } catch (err: unknown) {
      setStatusMsg(err instanceof Error ? err.message : 'Failed to save Cloudflare Edge profile.');
    }
  };

  const handleSyncActiveBotSignal = async () => {
    if (!firebaseUser) {
      await signInGoogle();
      return;
    }
    const session = appState.activeSignalSession;
    const platform = appState.cyberAuth.platform === '1xbet' ? '1xbet' : 'sokrizybet';
    const safeCols = session?.steps?.slice(0, 10).map((s) => s.safeColumn + 1) || [1, 3, 2, 4, 2];

    try {
      await saveSignalToFirestore(firebaseUser.uid, {
        platform,
        accountId: appState.cyberAuth.accountId || 'SRB-MASTER',
        gameId: session?.gameId || `AOF-${Date.now().toString().slice(-5)}`,
        strategy: session?.strategy || 'power_max',
        accuracy: session?.accuracy || 99.99,
        safeColumns: safeCols,
      });
      sound.playCompleteFanfare();
      setStatusMsg('Current Live Bot Signal synced to Firebase collection.');
    } catch (err: unknown) {
      setStatusMsg(err instanceof Error ? err.message : 'Failed to sync signal to Firebase.');
    }
  };

  const handleBuildCloudflareBundle = async () => {
    sound.playClick();
    setIsBuildingZip(true);
    try {
      const zip = new JSZip();

      const wranglerToml = `name = "${projectName.trim() || 'apple-of-fortune-edge'}"
compatibility_date = "2026-10-01"
pages_build_output_dir = "dist"

[vars]
FIREBASE_PROJECT_ID = "${firebaseConfig.projectId}"
CLOUDFLARE_WAF_LEVEL = "${wafLevel}"
EDGE_CACHE_TTL = "${edgeCacheTtl}"

# Set secret in Cloudflare Pages/Workers before deploying:
# npx wrangler pages secret put GEMINI_API_KEY
`;

      const workerScanFn = `const MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'];

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY secret missing in Cloudflare env' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const imageBase64 = String(body.imageBase64 || '').replace(/^data:[^;]+;base64,/, '');
    let lastStatus = 503;
    let lastData = { error: 'AI Vision service temporarily unavailable.' };

    for (const model of MODELS) {
      const geminiRes = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inlineData: { mimeType: body.mimeType || 'image/jpeg', data: imageBase64 } },
                { text: 'Analyze this Apple of Fortune board and return active row, recommendedColumn (1-5), confidence, and answerExplanation in JSON.' }
              ]
            }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        }
      );
      lastStatus = geminiRes.status;
      lastData = await geminiRes.json();
      if (geminiRes.ok) {
        return new Response(JSON.stringify({ model, ...lastData }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (geminiRes.status !== 503 && geminiRes.status !== 429) {
        break;
      }
    }

    const cleanErr = lastData?.error?.message || 'AI Vision model is experiencing high demand. Please retry.';
    return new Response(JSON.stringify({ error: cleanErr, code: lastStatus }), {
      status: lastStatus,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
`;

      const headersFile = `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Cache-Control: public, max-age=${edgeCacheTtl}

/assets/*
  Cache-Control: public, max-age=31536000, immutable
`;

      const redirectsFile = `/api/* /api/:splat 200
/* /index.html 200
`;

      const guideMd = `# Cloudflare + Firebase Deployment Guide

1. Install Wrangler CLI: \`npm install -g wrangler\`
2. Build web bundle: \`npm run build\`
3. Set Gemini secret: \`npx wrangler pages secret put GEMINI_API_KEY\`
4. Deploy to Cloudflare Pages: \`npx wrangler pages deploy dist --project-name=${projectName}\`
5. Firebase Project: \`${firebaseConfig.projectId}\` (Database: \`${firebaseConfig.firestoreDatabaseId}\`)
`;

      zip.file('wrangler.toml', wranglerToml);
      zip.file('functions/api/ai/scan-photo.ts', workerScanFn);
      zip.file('public/_headers', headersFile);
      zip.file('public/_redirects', redirectsFile);
      zip.file('DEPLOY_CLOUDFLARE_FIREBASE.md', guideMd);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.trim() || 'cloudflare-firebase'}-edge-bundle.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      sound.playCompleteFanfare();
      setStatusMsg('Cloudflare Pages + Workers Edge bundle downloaded (.ZIP).');
    } finally {
      setIsBuildingZip(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121622] via-[#0d1713] to-[#0a120d] border border-orange-500/30 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-400 to-cyan-400 p-0.5 shadow-lg">
            <div className="w-full h-full rounded-2xl bg-[#0b120e] flex items-center justify-center text-orange-400">
              <Cloud size={24} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                AI Build • Cloudflare & Firebase Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-black uppercase">
                Edge + Cloud Sync
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Manage Firebase cloud collections, sync live Bot signals, and export Cloudflare Pages & Workers bundles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!firebaseUser ? (
            <button
              type="button"
              onClick={() => void signInGoogle()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-black font-black text-xs flex items-center gap-2 cursor-pointer"
            >
              <Lock size={15} />
              <span>Sign In with Google</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void signOutAll()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 font-bold text-xs flex items-center gap-2 cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign Out ({firebaseUser.email})</span>
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Firebase & Cloud Collections */}
        <div className="p-5 rounded-3xl bg-[#0c1610] border border-[#1d3624] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Flame size={18} className="text-amber-400" />
              <span>Firebase Cloud Sync</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
              {firebaseConfig.projectId}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-[#08100b] border border-[#172c1e]">
              <div className="text-[10px] text-gray-400">Photo Scans</div>
              <div className="text-xl font-black text-cyan-300 font-mono">{photoScans.length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#08100b] border border-[#172c1e]">
              <div className="text-[10px] text-gray-400">Synced Signals</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{signals.length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#08100b] border border-[#172c1e]">
              <div className="text-[10px] text-gray-400">CF Profiles</div>
              <div className="text-xl font-black text-orange-300 font-mono">{cfConfigs.length}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSyncActiveBotSignal()}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#132619] hover:bg-[#1a3423] border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Sync Active Live Bot Signal to Firebase</span>
          </button>

          <div className="space-y-2">
            <div className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
              <Layers size={13} />
              <span>Recent Synced Signals</span>
            </div>
            {signals.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#08100b] border border-[#172c1e] text-xs text-gray-500 text-center">
                {firebaseUser
                  ? 'No signals synced yet. Tap above to sync your active bot session.'
                  : 'Sign in with Google to access your synced cloud records.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-3 rounded-2xl bg-[#08100b] border border-[#193020] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {sig.platform.toUpperCase()} • {sig.gameId}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        Account: {sig.accountId} • {sig.strategy}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono font-bold text-[11px]">
                      {sig.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: AI Build Cloudflare Edge & Worker Generator */}
        <div className="p-5 rounded-3xl bg-[#0c1610] border border-[#1d3624] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Globe size={18} className="text-orange-400" />
              <span>Cloudflare Pages & Workers Builder</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/30 text-[10px] font-bold">
              WAF + Edge
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Pages Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Worker Route Name
              </label>
              <input
                type="text"
                value={workerName}
                onChange={(e) => setWorkerName(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Custom Domain
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="w-full min-h-[42px] px-3 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">
                  WAF Level
                </label>
                <select
                  value={wafLevel}
                  onChange={(e) => setWafLevel(e.target.value as typeof wafLevel)}
                  className="w-full min-h-[42px] px-2.5 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white"
                >
                  <option value="high">High</option>
                  <option value="under_attack">Under Attack</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 block mb-1">
                  Cache TTL (s)
                </label>
                <input
                  type="number"
                  min={0}
                  max={86400}
                  value={edgeCacheTtl}
                  onChange={(e) => setEdgeCacheTtl(Number(e.target.value) || 0)}
                  className="w-full min-h-[42px] px-2.5 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => void handleSaveCloudflareProfile()}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#132619] hover:bg-[#1a3423] border border-orange-500/40 text-orange-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Shield size={15} />
              <span>Save Edge Profile</span>
            </button>

            <button
              type="button"
              disabled={isBuildingZip}
              onClick={() => void handleBuildCloudflareBundle()}
              className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isBuildingZip ? <Rocket size={15} className="animate-bounce" /> : <Download size={15} />}
              <span>{isBuildingZip ? 'Building...' : 'Build Cloudflare Bundle (.ZIP)'}</span>
            </button>
          </div>

          {cfConfigs.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-gray-400">Saved Cloudflare Profiles</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {cfConfigs.map((cfg) => (
                  <div
                    key={cfg.id}
                    className="p-2.5 rounded-xl bg-[#08100b] border border-[#193020] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{cfg.projectName}</span>
                      <span className="text-gray-500 font-mono ml-2">({cfg.workerName})</span>
                    </div>
                    <span className="text-[10px] font-mono text-orange-300 uppercase">
                      {cfg.wafLevel} • {cfg.edgeCacheTtl}s
                    </span>
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
