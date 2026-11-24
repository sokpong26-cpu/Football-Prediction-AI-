import React, { useState, useMemo } from 'react';
import {
  ApkBuildArtifact,
  ApkBuildConfig,
  ApkLoadingMode,
  buildAndroidStudioProjectZip,
  buildApkPackageBundle,
  createDefaultApkConfig,
  triggerBlobDownload,
  validateApkConfig,
} from '../../services/apkBuilder';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import {
  Smartphone,
  Package,
  Download,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  FolderArchive,
  ShieldCheck,
  Zap,
  Globe,
} from 'lucide-react';

interface ApkBuilderStudioProps {
  isPwaInstallable?: boolean;
  onTriggerPwaInstall?: () => void;
}

export const ApkBuilderStudio: React.FC<ApkBuilderStudioProps> = ({
  isPwaInstallable = false,
  onTriggerPwaInstall,
}) => {
  const [config, setConfig] = useState<ApkBuildConfig>(() => createDefaultApkConfig());
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [apkArtifact, setApkArtifact] = useState<ApkBuildArtifact | null>(null);
  const [projectZipArtifact, setProjectZipArtifact] = useState<ApkBuildArtifact | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);

  const validation = useMemo(() => validateApkConfig(config), [config]);

  const appendLog = (line: string) => {
    const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setBuildLogs((prev) => [...prev, `[${time}] ${line}`]);
  };

  const handleResetDefaults = () => {
    sound.playClick();
    setConfig(createDefaultApkConfig());
    setApkArtifact(null);
    setProjectZipArtifact(null);
    setBuildLogs([]);
    setBuildProgress(0);
    setBuildError(null);
  };

  const handleBuildAll = async () => {
    if (isBuilding) return;
    sound.playClick();
    setBuildError(null);

    if (!validation.valid) {
      sound.playError();
      setBuildError(validation.errors[0]);
      return;
    }

    setIsBuilding(true);
    setApkArtifact(null);
    setProjectZipArtifact(null);
    setBuildLogs([]);
    setBuildProgress(10);

    try {
      appendLog(`Starting build for ${config.appName.trim()} (${config.packageId.trim()}) v${config.versionName}`);
      await new Promise((r) => setTimeout(r, 220));

      setBuildProgress(30);
      appendLog(`Target SDK ${config.targetSdk} · Min SDK ${config.minSdk} · Mode: ${config.loadingMode}`);
      const projectZip = await buildAndroidStudioProjectZip(config, appendLog);
      setProjectZipArtifact(projectZip);

      setBuildProgress(72);
      const apkBundle = await buildApkPackageBundle(config, appendLog);
      setApkArtifact(apkBundle);

      setBuildProgress(95);
      appState.addActivityLog({
        type: 'system',
        titleKh: `📱 AI Build APK & Android Studio Project ជោគជ័យ (${config.versionName})`,
        titleEn: `APK Studio Built ${apkBundle.filename} & ${projectZip.filename}`,
        details: `Package: ${config.packageId} • Mode: ${config.loadingMode} • SHA256: ${apkBundle.sha256.slice(0, 16)}...`,
        status: 'success',
        userOrSource: 'AI APK Builder Studio',
      });

      setBuildProgress(100);
      appendLog(`Build verified. Ready to download .APK bundle and Android Studio .ZIP.`);
      sound.playCompleteFanfare();
    } catch (err) {
      sound.playError();
      const message = err instanceof Error ? err.message : 'Unexpected build failure';
      setBuildError(message);
      appendLog(`ERROR: ${message}`);
    } finally {
      setIsBuilding(false);
    }
  };

  const modeOptions: { id: ApkLoadingMode; label: string; desc: string }[] = [
    {
      id: 'hybrid',
      label: 'Hybrid Offline + Live Sync',
      desc: 'Boots offline assets and syncs live feeds',
    },
    {
      id: 'online',
      label: 'Live Server WebView',
      desc: 'Streams directly from your web URL',
    },
    {
      id: 'offline',
      label: 'Offline Asset Shell',
      desc: 'Self-contained bundled shell only',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Identity & Build Target Summary */}
      <div className="p-4 rounded-2xl bg-[#111f15] border border-[#1f3a25] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                AI APK Builder Studio
              </h3>
              <p className="text-xs text-gray-400 font-mono tabular-nums mt-0.5">
                {config.packageId} · v{config.versionName} ({config.versionCode}) · SDK {config.minSdk}–{config.targetSdk}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isBuilding}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#0c160f] hover:bg-[#162a1c] text-gray-300 hover:text-white border border-[#224129] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-300">App Name</span>
            <input
              type="text"
              value={config.appName}
              disabled={isBuilding}
              onChange={(e) => setConfig((c) => ({ ...c, appName: e.target.value }))}
              placeholder="Apple of Fortune AI"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#0c160f] border border-[#224129] focus:border-emerald-400 focus:outline-none text-xs text-white font-medium"
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-300">Android Package ID</span>
            <input
              type="text"
              value={config.packageId}
              disabled={isBuilding}
              onChange={(e) => setConfig((c) => ({ ...c, packageId: e.target.value.toLowerCase() }))}
              placeholder="com.bitsgap.applefortune"
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#0c160f] border border-[#224129] focus:border-emerald-400 focus:outline-none text-xs text-white font-mono"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block space-y-1">
              <span className="text-xs font-medium text-gray-300">Version Name</span>
              <input
                type="text"
                value={config.versionName}
                disabled={isBuilding}
                onChange={(e) => setConfig((c) => ({ ...c, versionName: e.target.value }))}
                placeholder="5.6.0"
                className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#0c160f] border border-[#224129] focus:border-emerald-400 focus:outline-none text-xs text-white font-mono tabular-nums"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-xs font-medium text-gray-300">Version Code</span>
              <input
                type="number"
                min={1}
                value={config.versionCode}
                disabled={isBuilding}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, versionCode: Math.max(1, Number(e.target.value) || 1) }))
                }
                className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#0c160f] border border-[#224129] focus:border-emerald-400 focus:outline-none text-xs text-white font-mono tabular-nums"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <Globe size={12} className="text-cyan-400" />
              <span>Live Sync Server URL</span>
            </span>
            <input
              type="url"
              value={config.serverUrl}
              disabled={isBuilding || config.loadingMode === 'offline'}
              onChange={(e) => setConfig((c) => ({ ...c, serverUrl: e.target.value }))}
              placeholder="https://..."
              className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-[#0c160f] border border-[#224129] focus:border-emerald-400 focus:outline-none text-xs text-cyan-200 font-mono disabled:opacity-50"
            />
          </label>
        </div>

        {/* Loading Mode Selector */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-medium text-gray-300 block">Android Shell Loading Mode</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {modeOptions.map((mode) => {
              const selected = config.loadingMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  disabled={isBuilding}
                  onClick={() => {
                    sound.playClick();
                    setConfig((c) => ({ ...c, loadingMode: mode.id }));
                  }}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    selected
                      ? 'bg-emerald-500/15 border-emerald-400 text-white'
                      : 'bg-[#0c160f] border-[#203a27] text-gray-300 hover:border-[#2e5438]'
                  }`}
                >
                  <div className="text-xs font-bold leading-snug">{mode.label}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">{mode.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { key: 'enableBitsGap' as const, label: 'BitsGap Bot AI v6.0 (99.99%)' },
            { key: 'enableCyderShield' as const, label: 'CyderShield V4.0 Enterprise' },
            { key: 'enableAutoSync' as const, label: '10s Auto-Sync Bridge' },
          ].map((item) => {
            const active = config[item.key];
            return (
              <button
                key={item.key}
                type="button"
                disabled={isBuilding}
                onClick={() => {
                  sound.playClick();
                  setConfig((c) => ({ ...c, [item.key]: !c[item.key] }));
                }}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0c160f] border-[#203a27] text-gray-400 hover:text-gray-200'
                }`}
              >
                <CheckCircle2 size={13} className={active ? 'text-emerald-400' : 'text-gray-600'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Validation Warning */}
        {(!validation.valid || buildError) && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{buildError || validation.errors[0]}</span>
          </div>
        )}

        {/* Primary Build CTA */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={handleBuildAll}
            disabled={isBuilding || !validation.valid}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md cursor-pointer whitespace-nowrap"
          >
            {isBuilding ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Building Android Package ({buildProgress}%)...</span>
              </>
            ) : (
              <>
                <Play size={15} fill="currentColor" />
                <span>Build Android APK &amp; Studio Project</span>
              </>
            )}
          </button>

          {isPwaInstallable && onTriggerPwaInstall && (
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onTriggerPwaInstall();
              }}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Zap size={14} />
              <span>Install WebAPK</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Build Progress & Logs */}
      {(isBuilding || buildLogs.length > 0) && (
        <div className="p-4 rounded-2xl bg-[#09120c] border border-[#1f3a25] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Terminal size={14} className="text-emerald-400" />
              <span>Build Output Log</span>
            </span>
            <span className="font-mono tabular-nums text-emerald-400 font-bold">
              {buildProgress}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#132619] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${buildProgress}%` }}
            />
          </div>

          <div className="max-h-36 overflow-y-auto rounded-xl bg-black/50 border border-[#1a3120] p-2.5 font-mono tabular-nums text-[11px] text-emerald-300 space-y-1">
            {buildLogs.map((line, idx) => (
              <div key={idx} className="break-words leading-relaxed">
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Built Artifacts Download Cards */}
      {(apkArtifact || projectZipArtifact) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {projectZipArtifact && (
            <div className="p-4 rounded-2xl bg-[#111f15] border border-emerald-500/40 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <FolderArchive size={16} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{projectZipArtifact.filename}</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Complete Android Studio Gradle project ready to compile signed debug or release APKs.
                </p>
                <div className="text-[10px] text-gray-400 font-mono tabular-nums">
                  {(projectZipArtifact.sizeBytes / 1024).toFixed(1)} KB · SHA-256 {projectZipArtifact.sha256.slice(0, 12)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  triggerBlobDownload(projectZipArtifact.blob, projectZipArtifact.filename);
                  sound.playCompleteFanfare();
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <Download size={14} />
                <span>Download Android Project (.ZIP)</span>
              </button>
            </div>
          )}

          {apkArtifact && (
            <div className="p-4 rounded-2xl bg-[#111f15] border border-cyan-500/40 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Package size={16} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{apkArtifact.filename}</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Packaged Android app bundle with customized AndroidManifest, WebView shell, and BitsGap config.
                </p>
                <div className="text-[10px] text-gray-400 font-mono tabular-nums">
                  {(apkArtifact.sizeBytes / 1024).toFixed(1)} KB · SHA-256 {apkArtifact.sha256.slice(0, 12)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  triggerBlobDownload(apkArtifact.blob, apkArtifact.filename);
                  sound.playCompleteFanfare();
                }}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
              >
                <Download size={14} />
                <span>Download App Bundle (.APK)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Native Compilation Guidance */}
      <div className="p-3.5 rounded-2xl bg-[#0c160f] border border-[#1f3a25] text-[11px] text-gray-300 flex items-start gap-2.5 leading-relaxed">
        <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white block mb-0.5">
            Native Signed APK Compilation Note
          </span>
          Browsers cannot execute the Android SDK toolchain directly. Use the exported{' '}
          <span className="text-emerald-300 font-mono">AndroidProject.zip</span> in Android Studio (or run the included GitHub Actions Gradle workflow with{' '}
          <span className="text-cyan-300 font-mono">npm run apk:sync</span>) to output a native installable{' '}
          <span className="text-white font-mono">app-debug.apk</span> binary.
        </div>
      </div>
    </div>
  );
};
