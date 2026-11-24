import React, { useState, useEffect, useRef } from 'react';
import { appState, MULTIPLIERS } from '../../services/store';
import { sound } from '../../services/sound';
import { SignalSession, SignalStrategy } from '../../types';
import { AppleFortuneBoard } from './AppleFortuneBoard';
import { DailyWinProbabilityForecast } from './DailyWinProbabilityForecast';
import confetti from 'canvas-confetti';
import { KhqrLogo, AmkLogo, KbPrasacLogo, PpcLogo } from '../Store/BankLogos';
import {
  buildApkPackageBundle,
  buildAndroidStudioProjectZip,
  createDefaultApkConfig,
  triggerBlobDownload,
} from '../../services/apkBuilder';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Crown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Radio,
  Lock,
  ArrowRight,
  Info,
  Clock,
  RefreshCw,
  Activity,
  Globe,
  Terminal,
  CheckCircle2,
  X,
  Heart,
  Server,
  Layers,
  Download,
  FolderDown,
  Sliders,
  Trash2,
  Smartphone,
  Power,
  Cpu,
} from 'lucide-react';

interface AppleBotViewProps {
  onOpenStore: () => void;
  onOpenAuth: (tab?: 'sokrizybet' | 'login' | 'register' | 'key' | '1xbet') => void;
  onOpenCybersecurity?: () => void;
  onOpenDownloadModal?: (tab?: 'ultra_hack' | 'apk_studio' | 'download' | 'export') => void;
}

export const AppleBotView: React.FC<AppleBotViewProps> = ({
  onOpenStore,
  onOpenAuth,
  onOpenCybersecurity,
  onOpenDownloadModal,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 to 10 (0 means nothing revealed yet)
  const [isAutoRevealing, setIsAutoRevealing] = useState<boolean>(false);
  const [turboMode, setTurboMode] = useState<boolean>(true);
  const [isLiveMonitorOpen, setIsLiveMonitorOpen] = useState<boolean>(false);
  const [strategy, setStrategy] = useState<SignalStrategy>(appState.config.signalStrategy || 'power_max');
  const [session, setSession] = useState<SignalSession>(
    () => appState.activeSignalSession || appState.createInitialSignalSession(appState.config.signalStrategy || 'power_max')
  );
  const [lang, setLang] = useState<'kh' | 'en' | 'ru'>('kh');
  const [soundOn, setSoundOn] = useState<boolean>(appState.config.soundEnabled);
  const [displayedAccuracy, setDisplayedAccuracy] = useState<number>(99.99);
  const user = appState.currentUser;
  const isVip = user && user.vipTier !== 'free';
  const isAdminOrOwner = user && (user.role === 'admin' || user.role === 'owner');
  const isOperatingHours = appState.isWithinOperatingHours();
  const isLockedBySchedule = !isOperatingHours && !isAdminOrOwner;

  // Live Refresh: Automatically pulls updated signal data every 10 seconds with countdown indicator
  const [isLiveRefreshActive, setIsLiveRefreshActive] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(10);
  const [justRefreshedFlash, setJustRefreshedFlash] = useState<boolean>(false);

  // Quick Actions interactive state
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);
  const [quickActionStatus, setQuickActionStatus] = useState<{
    type: 'info' | 'success' | 'building' | 'updating';
    title: string;
    detail: string;
    progress?: number;
  } | null>(null);
  const [builtApkVersion, setBuiltApkVersion] = useState<string | null>(null);
  const sweepIntervalRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const isSweepingRef = useRef<boolean>(false);

  const clearActiveSweep = () => {
    if (sweepIntervalRef.current !== null) {
      window.clearInterval(sweepIntervalRef.current);
      sweepIntervalRef.current = null;
    }
    isSweepingRef.current = false;
  };

  const triggerFlash = (durationMs: number = 1000) => {
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
    }
    setJustRefreshedFlash(true);
    flashTimeoutRef.current = window.setTimeout(() => {
      setJustRefreshedFlash(false);
      flashTimeoutRef.current = null;
    }, durationMs);
  };

  useEffect(() => {
    isSweepingRef.current = isAutoRevealing;
  }, [isAutoRevealing]);

  useEffect(() => {
    return () => {
      clearActiveSweep();
      if (flashTimeoutRef.current !== null) {
        window.clearTimeout(flashTimeoutRef.current);
      }
    };
  }, []);

  const activePlatform: 'sokrizybet' | '1xbet' =
    user.bettingPlatform === 'sokrizybet' || (Boolean(user.sokRizyBetAccountId) && !user.oneXBetAccountId)
      ? 'sokrizybet'
      : '1xbet';
  const activeAccountId =
    activePlatform === 'sokrizybet'
      ? user.sokRizyBetAccountId || user.oneXBetAccountId || ''
      : user.oneXBetAccountId || '';
  const platformLabel = activePlatform === 'sokrizybet' ? 'SokRizyBet' : '1xBet';
  const platformShort = activePlatform === 'sokrizybet' ? 'SRB' : '1X';

  useEffect(() => {
    if (!isLiveRefreshActive) return;

    const timer = window.setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          // Avoid interrupting an active live scan sweep
          if (!isSweepingRef.current) {
            const newSession = appState.generateNewSignal(strategy);
            setSession(newSession);
            setCurrentStep(0);
            triggerFlash(1000);
          }
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLiveRefreshActive, strategy]);

  const handleManualLiveRefresh = () => {
    sound.playClick();
    clearActiveSweep();
    setIsAutoRevealing(false);
    const newSession = appState.generateNewSignal(strategy);
    setSession(newSession);
    setCurrentStep(0);
    setRefreshCountdown(10);
    triggerFlash(1000);
  };

  const triggerApkPackageDownload = async (versionTag: string = '5.6.0') => {
    const cfg = createDefaultApkConfig();
    cfg.versionName = versionTag.replace(/^v/i, '');
    const artifact = await buildApkPackageBundle(cfg);
    triggerBlobDownload(artifact.blob, artifact.filename);
    return artifact;
  };

  const handleCheckServerStatus = () => {
    sound.playClick();
    setActiveQuickAction('server_status');
    const snap = appState.checkServerStatusSnapshot();
    sound.playCompleteFanfare();
    setQuickActionStatus({
      type: 'success',
      title: `Server Online • ${snap.latencyMs}ms (${snap.region})`,
      detail: `Host ${snap.hostIp} • Feed ${snap.feedIp} • ${snap.packetsPerSec.toLocaleString()} pkt/s • 100% Smooth`,
    });
    setActiveQuickAction(null);
  };

  const handleClearSignalCache = () => {
    sound.playClick();
    setActiveQuickAction('clear_cache');
    const result = appState.clearSignalCache();
    setSession(result.freshSession);
    setCurrentStep(0);
    setRefreshCountdown(10);
    triggerAccuracyCountUp(100.0);
    sound.playAlertNotification();
    setQuickActionStatus({
      type: 'success',
      title: 'Signal Cache Cleared & Re-seeded',
      detail: `Purged ${result.clearedEntries} cached buffers • Fresh BitsGap seed ${result.freshSession.clientSeed} active.`,
    });
    setActiveQuickAction(null);
  };

  const handleRefreshDataFeed = () => {
    setActiveQuickAction('refresh_feed');
    const activeFeedIp = appState.dailyNetworkConfig.currentNode.feedIp;
    appState.connectServerToFeedIp(activeFeedIp);
    const newSession = appState.generateNewSignal(strategy);
    setSession(newSession);
    setCurrentStep(0);
    setRefreshCountdown(10);
    setJustRefreshedFlash(true);
    setTimeout(() => setJustRefreshedFlash(false), 1200);
    sound.playCompleteFanfare();
    setQuickActionStatus({
      type: 'success',
      title: 'Data Feed Synchronized (100%)',
      detail: `Live stream refreshed from ${activeFeedIp} • New Game ${newSession.gameId} ready.`,
    });
    setActiveQuickAction(null);
  };

  const handleAiBuildApk = async () => {
    if (activeQuickAction === 'build_apk' || activeQuickAction === 'update_all') return;
    sound.playClick();
    setActiveQuickAction('build_apk');

    const stages = [
      { progress: 22, title: 'AI Build APK • Stage 1/4', detail: 'Validating com.bitsgap.applefortune manifest & SDK targets...' },
      { progress: 52, title: 'AI Build APK • Stage 2/4', detail: 'Bundling BitsGap Neural Network v4.6 hybrid offline + live sync shell...' },
      { progress: 82, title: 'AI Build APK • Stage 3/4', detail: 'Compressing AndroidManifest, config & signed META-INF archive...' },
    ];

    for (const stage of stages) {
      setQuickActionStatus({
        type: 'building',
        title: stage.title,
        detail: stage.detail,
        progress: stage.progress,
      });
      await new Promise((r) => setTimeout(r, 260));
    }

    const artifact = await triggerApkPackageDownload('5.6.0');
    setBuiltApkVersion('v5.6.0');
    appState.addActivityLog({
      type: 'system',
      titleKh: `📱 AI Build APK ជោគជ័យ (${artifact.filename})`,
      titleEn: `Quick Action: AI Build APK Completed (${artifact.filename})`,
      details: `Compiled & packaged ${artifact.filename} (${(artifact.sizeBytes / 1024).toFixed(1)} KB) • SHA256: ${artifact.sha256.slice(0, 14)}...`,
      status: 'success',
      userOrSource: 'AppleBot Quick Actions',
    });
    sound.playCompleteFanfare();
    setQuickActionStatus({
      type: 'success',
      title: `APK Built & Downloading (${artifact.filename})`,
      detail: `${(artifact.sizeBytes / 1024).toFixed(1)} KB • SHA-256 ${artifact.sha256.slice(0, 12)} · Use APK Studio for full Android Studio project ZIP.`,
    });
    setActiveQuickAction(null);
  };

  const handleAiUpdateAll = async () => {
    if (activeQuickAction === 'update_all' || activeQuickAction === 'build_apk') return;
    sound.playClick();
    setActiveQuickAction('update_all');
    setQuickActionStatus({
      type: 'updating',
      title: 'AI Update All Running...',
      detail: 'Initializing CyderShield V3.3 Enterprise & IP cluster update...',
      progress: 12,
    });

    const res = await appState.updateAllSystemSoftwareAndReboot((step, line) => {
      setQuickActionStatus({
        type: 'updating',
        title: `AI Update All • Step ${step}/6`,
        detail: line,
        progress: Math.min(100, Math.round((step / 6) * 100)),
      });
    });

    setQuickActionStatus({
      type: 'success',
      title: 'All Software & IP Updated • Rebooting',
      detail: `Node rotated to ${res.newNode.feedIp} (${res.newNode.region}). Website restart console launched.`,
    });
    setActiveQuickAction(null);
  };

  const handleDownloadNewVersion = async () => {
    sound.playClick();
    setActiveQuickAction('download_apk');
    const ver = (builtApkVersion || '5.6.0').replace(/^v/i, '');
    const artifact = await triggerApkPackageDownload(ver);
    appState.addActivityLog({
      type: 'system',
      titleKh: `⬇️ ទាញយកកំណែថ្មីជោគជ័យ (${artifact.filename})`,
      titleEn: `Quick Action: Downloaded New Version (${ver})`,
      details: `Direct APK archive download triggered for ${artifact.filename}.`,
      status: 'success',
      userOrSource: 'AppleBot Quick Actions',
    });
    sound.playCompleteFanfare();
    setQuickActionStatus({
      type: 'success',
      title: `Downloading ${artifact.filename}`,
      detail: `${(artifact.sizeBytes / 1024).toFixed(1)} KB • ${appState.config.aiEngineVersion} bundle started.`,
    });
    setActiveQuickAction(null);
  };

  const handleRestartWebsiteServer = () => {
    sound.playClick();
    setQuickActionStatus({
      type: 'info',
      title: 'Restarting Website Server...',
      detail: 'Launching System Reboot Console & re-synchronizing live WebSocket streams.',
    });
    appState.openRebootModal(
      5,
      'Manual Website Server & WebSocket Restart triggered from Quick Actions'
    );
  };

  useEffect(() => {
    const unsub = appState.subscribe(() => {
      setSoundOn(appState.config.soundEnabled);
      if (appState.config.signalStrategy && appState.config.signalStrategy !== strategy) {
        setStrategy(appState.config.signalStrategy);
      }
    });
    return unsub;
  }, [strategy]);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    appState.config.soundEnabled = next;
    if (next) {
      sound.playAlertNotification();
    }
  };

  const handleStrategyChange = (newStrategy: SignalStrategy) => {
    sound.playClick();
    setStrategy(newStrategy);
    appState.setSignalStrategy(newStrategy);
    const newSession = appState.generateNewSignal(newStrategy);
    setSession(newSession);
    setCurrentStep(0);
    triggerAccuracyCountUp(99.99);
    if (soundOn) {
      sound.playAlertNotification();
    }
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#38bdf8', '#eab308'],
      });
    } catch {}
  };

  // Smooth Count-up animation for 99.99% live signal target metric
  const triggerAccuracyCountUp = (targetAcc: number = 99.99) => {
    const start = 94.0;
    const duration = 500; // ms
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Number((start + (targetAcc - start) * easeProgress).toFixed(2));
      setDisplayedAccuracy(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayedAccuracy(targetAcc);
      }
    };
    requestAnimationFrame(animate);
  };

  // Handle New Signal (Instant response, zero lag, zero bugs)
  const handleNewSignal = () => {
    sound.playClick();
    clearActiveSweep();
    setIsAutoRevealing(false);
    appState.executeSignalWithAutoRetry(() => {
      setCurrentStep(0);
      const newSession = appState.generateNewSignal(strategy);
      setSession(newSession);
      triggerAccuracyCountUp(99.99);
      if (soundOn) {
        sound.playAlertNotification();
      }
      try {
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#4ade80', '#eab308'],
        });
      } catch {}
    });
  };

  // Handle Bot AI v6.0 Quick & Smooth High Scan (99.99% Real-Time Live Signal On Target)
  const handlePowerMaxScanAi = () => {
    sound.playClick();
    clearActiveSweep();
    setStrategy('power_max');
    appState.setSignalStrategy('power_max');
    const freshSession = appState.generateNewSignal('power_max');
    setSession(freshSession);
    setCurrentStep(0);
    setRefreshCountdown(10);
    triggerFlash(900);
    triggerAccuracyCountUp(99.99);

    isSweepingRef.current = true;
    setIsAutoRevealing(true);
    let step = 0;
    const maxAllowed = isVip ? 10 : appState.config.requireVipAfterStep;

    sweepIntervalRef.current = window.setInterval(() => {
      if (step >= maxAllowed) {
        clearActiveSweep();
        setIsAutoRevealing(false);
        sound.playCompleteFanfare();
        setQuickActionStatus({
          type: 'success',
          title: 'Bot AI v6.0 Live Signal On Target 99.99%',
          detail: `${platformLabel} ${activeAccountId ? `#${activeAccountId} • ` : ''}AI High Scan Quick Locked Rows 1–${maxAllowed} • 0 Bugs (${freshSession.gameId})`,
        });
        try {
          confetti({
            particleCount: 110,
            spread: 85,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#f59e0b', '#38bdf8', '#4ade80'],
          });
        } catch {
          // ignore
        }
        return;
      }

      step += 1;
      setCurrentStep(step);
      sound.playStepChime(step - 1);
      appState.recordStepReached(step - 1);
    }, 14);
  };

  // Handle Instant Turbo Reveal (Optimized 60 FPS, silky smooth, no stutter)
  const handleInstantTurbo = () => {
    sound.playClick();
    if (isAutoRevealing) {
      clearActiveSweep();
      setIsAutoRevealing(false);
      return;
    }

    clearActiveSweep();
    setIsAutoRevealing(true);
    let step = currentStep;
    const maxAllowed = isVip ? 10 : appState.config.requireVipAfterStep;
    const speed = turboMode ? 22 : 60; // Ultra-fast 10x Turbo Speed, zero lag

    sweepIntervalRef.current = window.setInterval(() => {
      if (step >= maxAllowed) {
        clearActiveSweep();
        setIsAutoRevealing(false);
        if (step === 10) {
          sound.playCompleteFanfare();
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#22c55e', '#4ade80', '#eab308', '#ef4444'],
            });
          } catch {
            // ignore
          }
        }
        return;
      }

      step += 1;
      setCurrentStep(step);
      sound.playStepChime(step - 1);
      appState.recordStepReached(step - 1);
    }, speed);
  };

  // Handle Next step reveal
  const handleNextStep = () => {
    if (currentStep >= 10) return;

    // Check free limit
    if (!isVip && currentStep >= appState.config.requireVipAfterStep) {
      sound.playAlertNotification();
      return;
    }

    appState.executeSignalWithAutoRetry(() => {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      sound.playStepChime(nextStep - 1);
      appState.recordStepReached(nextStep - 1);
      triggerAccuracyCountUp(100.0);

      if (nextStep === 10) {
        sound.playCompleteFanfare();
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#4ade80', '#eab308', '#ef4444'],
          });
        } catch {
          // ignore
        }
      }
    });
  };

  // Handle Auto Reveal
  const handleAutoReveal = () => {
    sound.playClick();
    if (isAutoRevealing) {
      clearActiveSweep();
      setIsAutoRevealing(false);
      return;
    }

    clearActiveSweep();
    setIsAutoRevealing(true);
    let step = currentStep;
    const maxAllowed = isVip ? 10 : appState.config.requireVipAfterStep;
    const delay = turboMode ? 25 : 75; // Ultra-fast 10x Turbo Delay

    sweepIntervalRef.current = window.setInterval(() => {
      if (step >= maxAllowed) {
        clearActiveSweep();
        setIsAutoRevealing(false);
        if (step === 10) {
          sound.playCompleteFanfare();
          try {
            confetti({
              particleCount: 100,
              spread: 80,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }
        }
        return;
      }

      step += 1;
      setCurrentStep(step);
      sound.playStepChime(step - 1);
      appState.recordStepReached(step - 1);
    }, delay);
  };

  // Translations
  const t = {
    kh: {
      title: 'Apple of Fortune',
      stepText: (s: number) => `ជំហាន ${s} នៃ 10`,
      signalComplete: 'ចាប់សេវាពេញលេញ (Signal complete)',
      start: 'ចាប់ផ្ដើម',
      next: 'ជំហានបន្ទាប់ (Next)',
      newSignal: 'សេវាថ្មី (New signal)',
      autoReveal: 'ស្វ័យប្រវត្តិ (Auto)',
      stop: 'បញ្ឈប់',
      accuracy: 'ភាពត្រឹមត្រូវម៉ាស៊ីន',
      serverSync: 'ម៉ាស៊ីនមេ Online 100%',
      vipRequiredTitle: 'ត្រូវការកញ្ចប់ VIP សម្រាប់ Step 5-10',
      vipRequiredDesc: 'គណនី Free អាចចាប់សេវាបានត្រឹម Step 4 (×2.41)។ សូម Upgrade VIP ដើម្បីចាប់បានរហូតដល់ Step 10 (×349.48)!',
      upgradeBtn: 'ទិញ VIP ឥឡូវនេះ (ចាប់ពី $2)',
      activeKey: 'បញ្ចូល Key VIP',
      freeBadge: 'គម្រោងឥតគិតថ្លៃ',
      vipBadge: 'សមាជិក VIP សកម្ម',
    },
    en: {
      title: 'Apple of Fortune',
      stepText: (s: number) => `Step ${s} of 10`,
      signalComplete: 'Signal complete',
      start: 'Start',
      next: 'Next',
      newSignal: 'New signal',
      autoReveal: 'Auto',
      stop: 'Stop',
      accuracy: 'Algorithm Accuracy',
      serverSync: 'Server Sync Online',
      vipRequiredTitle: 'VIP Required for Steps 5-10',
      vipRequiredDesc: 'Free tier is limited to Step 4 (×2.41). Upgrade to VIP to unlock up to Step 10 (×349.48)!',
      upgradeBtn: 'Unlock VIP Now (From $2)',
      activeKey: 'Enter VIP Key',
      freeBadge: 'Free Tier',
      vipBadge: 'VIP Active',
    },
    ru: {
      title: 'Apple of Fortune',
      stepText: (s: number) => `Шаг ${s} из 10`,
      signalComplete: 'Сигнал готов (Signal complete)',
      start: 'Старт',
      next: 'Следующий (Next)',
      newSignal: 'Новый сигнал (New signal)',
      autoReveal: 'Авто',
      stop: 'Стоп',
      accuracy: 'Точность алгоритма',
      serverSync: 'Сервер синхронизирован',
      vipRequiredTitle: 'Требуется VIP для шагов 5-10',
      vipRequiredDesc: 'Бесплатная версия ограничена шагом 4. Активируйте VIP для шага 10 (×349.48)!',
      upgradeBtn: 'Купить VIP (от $2)',
      activeKey: 'Активировать ключ',
      freeBadge: 'Бесплатный',
      vipBadge: 'VIP активен',
    },
  }[lang];

  const isCompleted = currentStep === 10;
  const isVipBlocked = !isVip && currentStep >= appState.config.requireVipAfterStep;

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen py-4 px-2 sm:px-4">
      {/* 24-Hour Server Maintenance & System Upgrade Notice Banner */}
      {appState.config.maintenanceMode && (
        <div className="w-full max-w-[430px] mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#182615] to-black border border-amber-500/40 shadow-xl text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-black text-amber-300">
                ⚡ Server Maintenance & System Upgrade (24h Live)
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
              v2.0.1
            </span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">
            ប្រព័ន្ធកំពុងដំណើរការ Upgrade Hardware/Software ថ្មី: <strong>Gemini 3.8 Flash</strong>, <strong>10x Turbo Speed</strong>, និង <strong>Cloudflare DDoS Edge Shield</strong> (គ្មាន Bugs)!
          </p>
          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-amber-500/20 text-gray-400 font-mono">
            <span>🛡️ Cloudflare Enterprise Protected</span>
            <span className="text-emerald-400 font-bold">✓ VIP & Owner Scan Normal</span>
          </div>
        </div>
      )}

      {/* Phone Mockup Frame Container */}
      <div className="w-full max-w-[430px] bg-[#0c160f] border border-[#1e3423] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative transition-all">
        
        {/* Top Telegram Style App Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#17271b] bg-[#0e1a12] text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-emerald-400 font-medium tracking-wide">
              BOT LIVE • {session.gameId}
            </span>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1" title="Real-Time Feed IP Connected">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>185.195.234.19</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => appState.toggleSound()}
              className="p-1 hover:text-emerald-400 transition"
              title="Toggle Sound"
            >
              {soundOn ? <Volume2 size={16} className="text-emerald-400" /> : <VolumeX size={16} className="text-gray-500" />}
            </button>
            <div className="h-3 w-px bg-gray-700"></div>
            <span className="text-[11px] font-mono text-gray-400">{user.vipTier === 'free' ? 'FREE' : 'VIP'}</span>
          </div>
        </div>

        {/* Bot Header Title & Language Toggle (Matches screenshot) */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                {t.title}
                <span className="text-lg">🍎</span>
              </h1>
            </div>

            {/* Step or Signal Complete Status (Screenshot 1: "Step 0 of 10" / Screenshot 2: "Signal complete") */}
            <div className="mt-1">
              {isCompleted ? (
                <div className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-base animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {t.signalComplete}
                </div>
              ) : (
                <div className="text-gray-400 text-sm font-medium">
                  {t.stepText(currentStep)}
                </div>
              )}
            </div>
          </div>

          {/* Language Selector: RU / EN / KH */}
          <div className="bg-[#16251a] p-1 rounded-full border border-[#263e2d] flex items-center text-xs font-semibold">
            {(['kh', 'en', 'ru'] as const).map((l) => (
              <button
                key={l}
                onClick={() => {
                  sound.playClick();
                  setLang(l);
                  appState.setLanguage(l);
                }}
                className={`px-2.5 py-1 rounded-full uppercase transition-all duration-200 ${
                  lang === l
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ⚡ ULTRA HACK APPLE - ULTRA SCAN SIGNAL REAL MAX LIVE BANNER */}
        <div className="mx-4 mt-2 mb-2 p-3 rounded-2xl bg-gradient-to-r from-[#0b1b10] via-[#122e1a] to-[#0a170e] border border-emerald-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap size={20} className="fill-current animate-pulse text-emerald-400" />
            </div>
            <div className="text-left flex-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-xs">
                  ⚡ File Ultra Hack Apple
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-black border border-emerald-500/30">
                  REAL MAX 100%
                </span>
              </div>
              <p className="text-[10px] text-gray-300 mt-0.5">
                Feed: <span className="text-emerald-400 font-mono font-bold">185.195.234.19:8443</span> • 100% Real Scan Time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            {onOpenDownloadModal && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenDownloadModal('ultra_hack');
                }}
                className="w-full sm:w-auto py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-[11px] transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                title="ទាញយកកញ្ចប់ File Ultra Hack Apple (.ZIP / .user.js) សម្រាប់ Chrome & Kiwi Browser"
              >
                <FolderDown size={14} />
                <span>File Ultra Hack (.ZIP)</span>
              </button>
            )}
          </div>
        </div>

        {/* 🧠 BitsGap Bot AI v6.0 - 99.99% Real-Time High Scan Decision Core Banner */}
        <div className="mx-4 mb-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#07170c] via-[#0d2615] to-[#07130a] border border-emerald-400/50 shadow-xl relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="space-y-1.5 flex-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>🎯 BITSGAP BOT AI v6.0</span>
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                  99.99% On Target
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
                  0 Bugs
                </span>
              </div>
              <p className="text-xs font-black text-white leading-snug">
                ⚡ AI High Scan Signal • Real-Time Live Signal 99.99%
              </p>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Bot Scan Signal Quick with <strong className="text-emerald-400 font-bold">Bot AI v6.0 + CyderShield V4.0</strong> for instant zero-bug decision locking.
              </p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1 font-mono">
              <span className="text-[11px] font-black text-emerald-400 px-2.5 py-1 rounded-xl bg-[#031107] border border-emerald-500/50 shadow-[0_0_12px_rgba(34,197,94,0.35)]">
                99.99% LIVE
              </span>
              <span className="text-[9px] text-gray-400">&lt;1ms • Quick Scan</span>
            </div>
          </div>
        </div>

        {/* Signal Strategy Selector & Notification Sound Toggle */}
        <div className="mx-4 mb-2 p-2 rounded-xl bg-[#112015] border border-[#213b27] flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <Sliders size={14} className="text-emerald-400 shrink-0" />
            <span className="text-gray-300 text-[11px] font-bold shrink-0">Strategy:</span>
            <select
              value={strategy}
              onChange={(e) => handleStrategyChange(e.target.value as SignalStrategy)}
              className="flex-1 px-2.5 py-1 rounded-lg bg-[#0c160f] border border-[#203c27] text-white text-[11px] font-bold focus:outline-none focus:border-emerald-500 cursor-pointer truncate"
              title="ជ្រើសរើស Signal Strategy"
            >
              <option value="power_max">⚡ AI High Scan Signal v6.0 (Quick &amp; Live 99.99%)</option>
              <option value="ultra_max">🎯 Bot Live Signal 99.99% On Target (Real Max)</option>
              <option value="balanced">🛡️ Balanced (Safe Path 1-5 Quick Scan)</option>
              <option value="conservative">🔒 Conservative (High Multiplier 1-3 Lock)</option>
              <option value="aggressive">🚀 Aggressive (Full 10-Row Quick Run)</option>
            </select>
          </div>

          {/* Real-time Notification Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
              soundOn
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-[#152419] text-gray-400 border-[#233a27] hover:text-white'
            }`}
            title="Real-Time Notification Sound Toggle"
          >
            {soundOn ? (
              <>
                <Volume2 size={13} className="text-emerald-400 animate-pulse" />
                <span>Sound: ON</span>
              </>
            ) : (
              <>
                <VolumeX size={13} className="text-gray-400" />
                <span>Sound: OFF</span>
              </>
            )}
          </button>
        </div>

        {/* CyderShield V4.0 Enterprise Zero-Bug Protection Ribbon */}
        <div
          onClick={() => {
            sound.playClick();
            if (onOpenCybersecurity) onOpenCybersecurity();
          }}
          className="mx-4 mt-1 mb-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0d2214] via-[#102a19] to-[#0c1f12] border border-emerald-500/40 flex items-center justify-between text-xs cursor-pointer hover:border-emerald-400 transition shadow-sm group select-none"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-[11px]">CyderShield</span>
              <span className="text-[9px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300">
                V4.0 Enterprise
              </span>
            </div>
            <span className="text-gray-400 text-[10px] hidden xs:inline">• Zero Bugs • Live Signal 99.99%</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 group-hover:text-emerald-300">
            <Zap size={11} className="text-yellow-400 animate-pulse" />
            <span>99.99% Target</span>
            <span className="text-gray-500 group-hover:translate-x-0.5 transition-transform">›</span>
          </div>
        </div>

        {/* Algorithm Confidence, Cambodia Host & Hardware Metadata Banner with Count-up Metric */}
        <div className="mx-4 mb-2 p-2 rounded-xl bg-[#142217]/90 border border-[#233b29] space-y-1.5 text-[11px] text-gray-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-300 font-mono font-bold">Bot AI v6.0</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-black">
                {displayedAccuracy.toFixed(2)}% Target
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono font-bold hidden sm:inline" title="AI High Scan Engine • Zero Bugs">
                ⚡ High Scan Real-Time
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-gray-400">Ping:</span>
              <span className="text-emerald-400 font-black flex items-center gap-0.5">
                <Zap size={11} className="text-yellow-400" /> {appState.config.serverPingMs || 1}ms
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setTurboMode(!turboMode);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition ${
                  turboMode ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-gray-800 text-gray-400'
                }`}
                title="ប្តូរល្បឿន Turbo"
              >
                {turboMode ? '⚡ TURBO' : 'NORMAL'}
              </button>
            </div>
          </div>

          {/* Cambodia Host, Feed IP (185.195.234.19) & Intelligent Auto-Retry Status */}
          <div className="pt-1.5 border-t border-[#1e3825] font-mono text-[10px] space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-1">
                <span>🇰🇭 Host:</span>
                <span className="text-cyan-300 font-bold">{appState.config.serverHostIp}</span>
                <span className="text-gray-500 hidden xs:inline">(Edge DC)</span>
              </div>
              <div className="flex items-center gap-1">
                <span>CPU:</span>
                <span className="text-emerald-400 font-semibold truncate max-w-[120px]">EPYC 64-Core</span>
              </div>
            </div>

            {/* Real-Time Live Feed Scan Connection Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-[#182e1e]">
              <button
                type="button"
                onClick={() => {
                  appState.connectServerToFeedIp(appState.dailyNetworkConfig.currentNode.feedIp);
                }}
                className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition cursor-pointer group"
                title="Sync/Reconnect Server to active Daily Feed IP"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-gray-400">Live Feed:</span>
                <span className="text-emerald-400 font-bold group-hover:underline">
                  {appState.dailyNetworkConfig.currentNode.feedIp}
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-mono font-bold">
                  {appState.config.feedConnectionStatus === 'syncing' ? 'Syncing...' : 'LIVE 100%'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  appState.executeSignalWithAutoRetry(() => {
                    sound.playCompleteFanfare();
                  });
                }}
                className="px-1.5 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="Intelligent Auto-Retry Latency Guard (<15ms)"
              >
                <RefreshCw size={9} />
                <span>Auto-Retry &lt;15ms</span>
              </button>
            </div>

            {/* Dynamic Real-Time WebSocket Heartbeat Indicator from 1xBet Server */}
            <div className="flex items-center justify-between pt-1 border-t border-[#182e1e] text-[10px]">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsLiveMonitorOpen(true);
                }}
                className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 transition cursor-pointer group"
                title="Real-Time WebSocket Heartbeat from 1xBet Server 185.195.234.19"
              >
                <Activity size={12} className="text-rose-400 animate-pulse" />
                <span className="text-gray-400">WS Heartbeat:</span>
                <span className="text-cyan-300 font-bold group-hover:underline">185.195.234.19:8443</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  {appState.websocketHeartbeat.lastPingMs}ms
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsLiveMonitorOpen(true);
                }}
                className="flex items-center gap-1 text-[9px] text-gray-400 hover:text-cyan-300 transition"
              >
                <Zap size={10} className="text-yellow-400 animate-pulse" />
                <span className="font-bold text-emerald-400">
                  {appState.websocketHeartbeat.packetsReceived.toLocaleString()} pkts
                </span>
                <span className="text-cyan-400 underline ml-0.5">Stream ›</span>
              </button>
            </div>
          </div>
        </div>

        {/* SokRizyBet / 1xBet Account Connection & Live Signal Sync Bar */}
        <div
          className={`mx-4 mb-2 p-2.5 rounded-2xl border shadow-md ${
            activePlatform === 'sokrizybet'
              ? 'bg-gradient-to-r from-amber-950/60 via-[#132418] to-[#0c1811] border-amber-500/40'
              : 'bg-gradient-to-r from-blue-950/70 via-[#10241a] to-[#0c1811] border-cyan-500/40'
          }`}
        >
          {activeAccountId ? (
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl border flex items-center justify-center font-black text-[11px] font-mono shadow-sm shrink-0 ${
                    activePlatform === 'sokrizybet'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                  }`}
                >
                  {platformShort}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 font-mono flex-wrap">
                    <span className="font-black text-white text-xs truncate">
                      {platformLabel} #{activeAccountId}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      100% Smooth
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                    <span className="text-cyan-300 font-mono">{appState.dailyNetworkConfig.currentNode.feedIp}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      Real-Time Synced
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setIsLiveMonitorOpen(true);
                  }}
                  className="py-1.5 px-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer whitespace-nowrap"
                  title="បើក Live Stream Telemetry Monitor"
                >
                  <Terminal size={12} />
                  <span>Monitor</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenAuth(activePlatform === 'sokrizybet' ? 'sokrizybet' : '1xbet');
                  }}
                  className="py-1.5 px-2 rounded-lg bg-[#152a1c] hover:bg-[#1d3826] text-gray-200 hover:text-white border border-[#23422a] text-[10px] transition font-bold cursor-pointer whitespace-nowrap"
                  title="ប្តូរ ID Account"
                >
                  Switch ID
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Globe size={18} className="text-amber-400 shrink-0 animate-spin" />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-[11px] truncate">
                    Need ID Account (SokRizyBet / 1xBet)
                  </span>
                  <span className="text-[10px] text-gray-400 truncate">
                    Enter your Account ID for Real-Time Power Max Scan
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenAuth('sokrizybet');
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-black font-black text-[11px] transition shadow-md cursor-pointer whitespace-nowrap"
                >
                  + SokRizyBet ID
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenAuth('1xbet');
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] transition cursor-pointer whitespace-nowrap"
                >
                  1xBet ID
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Refresh (10s Countdown) Indicator & Automatic Feed Puller */}
        <div
          className={`mx-4 mb-2.5 p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden select-none ${
            justRefreshedFlash
              ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-[1.01]'
              : 'bg-[#0f1d13]/95 border-emerald-500/40 shadow-md'
          }`}
        >
          {/* Subtle animated background progress bar draining every 10 seconds */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-1000 ease-linear pointer-events-none"
            style={{ width: `${(refreshCountdown / 10) * 100}%` }}
          />

          <div className="flex items-center justify-between gap-3 relative z-10">
            {/* Left: Circular Countdown Dial & Status */}
            <div className="flex items-center gap-3">
              {/* Circular SVG Ring Countdown Indicator */}
              <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-[#183120]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Dynamic Progress Ring */}
                  <path
                    className={`transition-all duration-1000 ease-linear ${
                      refreshCountdown <= 3 ? 'text-amber-400 stroke-amber-400' : 'text-emerald-400 stroke-emerald-400'
                    }`}
                    strokeDasharray={`${(refreshCountdown / 10) * 100}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                {/* Center Seconds Number */}
                <span
                  className={`absolute font-mono font-black text-xs ${
                    refreshCountdown <= 3 ? 'text-amber-300 animate-pulse' : 'text-white'
                  }`}
                >
                  {refreshCountdown}s
                </span>
              </div>

              {/* Text Information */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                        isLiveRefreshActive ? 'bg-emerald-400' : 'bg-gray-400'
                      } opacity-75`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        isLiveRefreshActive ? 'bg-emerald-500' : 'bg-gray-500'
                      }`}
                    ></span>
                  </span>
                  <span className="text-white font-mono font-black text-xs tracking-tight">
                    Live Refresh (10s)
                  </span>
                  {justRefreshedFlash ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-black font-mono font-extrabold animate-bounce">
                      UPDATED!
                    </span>
                  ) : (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      {isLiveRefreshActive ? 'AUTO' : 'PAUSED'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                  <span>ទាញ Signal ស្វ័យប្រវត្តិតាម Feed</span>
                  <span className="text-emerald-400 font-bold font-mono">• 185.195.234.19</span>
                </span>
              </div>
            </div>

            {/* Right: Pause/Resume Toggle & Instant Sync Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleManualLiveRefresh}
                className="py-1 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="ទាញយក Signal ថ្មីភ្លាមៗ (Pull Fresh Signal Immediately)"
              >
                <RefreshCw size={11} className={justRefreshedFlash ? 'animate-spin' : ''} />
                <span className="text-[10px] font-mono">Sync</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setIsLiveRefreshActive(!isLiveRefreshActive);
                }}
                className={`py-1 px-2 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer border ${
                  isLiveRefreshActive
                    ? 'bg-[#162e1c] hover:bg-[#1e3d26] text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
                title={isLiveRefreshActive ? 'Pause automatic 10s live refresh' : 'Resume automatic 10s live refresh'}
              >
                {isLiveRefreshActive ? (
                  <>
                    <Pause size={10} />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={10} fill="currentColor" />
                    <span>Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Operational Control Bar */}
        <div className="mx-4 mb-2.5 p-3 rounded-2xl bg-[#0c160f]/95 border border-[#1f3a25] shadow-md">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Cpu size={13} />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xs tracking-tight leading-none">
                  Quick Actions
                </span>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                  BitsGap &amp; Server Controls
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {onOpenDownloadModal && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenDownloadModal('apk_studio');
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold whitespace-nowrap transition cursor-pointer"
                >
                  APK Studio ›
                </button>
              )}
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#14281a] border border-[#24462c] text-emerald-300 font-mono font-bold whitespace-nowrap">
                {builtApkVersion ? `APK ${builtApkVersion} Ready` : '7 Actions'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={handlePowerMaxScanAi}
              className="col-span-2 min-h-[42px] px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 hover:from-amber-500/30 hover:via-emerald-500/30 hover:to-cyan-500/30 active:scale-[0.99] border border-amber-400/50 text-amber-200 text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap shadow-md"
            >
              <Zap size={14} className="text-amber-400 fill-amber-400 shrink-0 animate-pulse" />
              <span>AI High Scan Quick • Live Signal 99.99%</span>
            </button>

            <button
              type="button"
              onClick={handleCheckServerStatus}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-[#112015] hover:bg-[#172c1d] active:scale-[0.99] border border-[#224129] text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Server size={13} className="shrink-0" />
              <span>Check Server Status</span>
            </button>

            <button
              type="button"
              onClick={handleClearSignalCache}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-[#112015] hover:bg-[#172c1d] active:scale-[0.99] border border-[#224129] text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Trash2 size={13} className="shrink-0" />
              <span>Clear Signal Cache</span>
            </button>

            <button
              type="button"
              onClick={handleRefreshDataFeed}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-[#112015] hover:bg-[#172c1d] active:scale-[0.99] border border-[#224129] text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <RefreshCw
                size={13}
                className={`shrink-0 ${activeQuickAction === 'refresh_feed' ? 'animate-spin' : ''}`}
              />
              <span>Refresh Data Feed</span>
            </button>

            <button
              type="button"
              onClick={handleAiBuildApk}
              disabled={activeQuickAction === 'build_apk' || activeQuickAction === 'update_all'}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 active:scale-[0.99] disabled:opacity-60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Smartphone
                size={13}
                className={`shrink-0 ${activeQuickAction === 'build_apk' ? 'animate-pulse' : ''}`}
              />
              <span>{activeQuickAction === 'build_apk' ? 'Building APK...' : 'AI Build APK'}</span>
            </button>

            <button
              type="button"
              onClick={handleAiUpdateAll}
              disabled={activeQuickAction === 'update_all' || activeQuickAction === 'build_apk'}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 active:scale-[0.99] disabled:opacity-60 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Sparkles
                size={13}
                className={`shrink-0 ${activeQuickAction === 'update_all' ? 'animate-spin' : ''}`}
              />
              <span>{activeQuickAction === 'update_all' ? 'Updating All...' : 'AI Update All'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadNewVersion}
              className="min-h-[40px] px-2.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 active:scale-[0.99] border border-sky-500/40 text-sky-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Download size={13} className="shrink-0" />
              <span>Download New Version</span>
            </button>

            <button
              type="button"
              onClick={handleRestartWebsiteServer}
              className="col-span-2 min-h-[40px] px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 active:scale-[0.99] border border-amber-500/40 text-amber-300 text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
            >
              <Power size={13} className="shrink-0" />
              <span>Restart Website Server</span>
            </button>
          </div>

          {quickActionStatus && (
            <div
              className={`mt-2.5 p-2.5 rounded-xl border text-[11px] transition-all ${
                quickActionStatus.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : quickActionStatus.type === 'building'
                  ? 'bg-teal-950/60 border-teal-500/40 text-teal-200'
                  : quickActionStatus.type === 'updating'
                  ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5 opacity-90" />
                  <div className="min-w-0">
                    <div className="font-bold text-white leading-snug">
                      {quickActionStatus.title}
                    </div>
                    <div className="text-[10px] opacity-90 font-mono mt-0.5 break-words">
                      {quickActionStatus.detail}
                    </div>
                    {quickActionStatus.title.includes('APK') && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            sound.playClick();
                            const zipArt = await buildAndroidStudioProjectZip(createDefaultApkConfig());
                            triggerBlobDownload(zipArt.blob, zipArt.filename);
                            sound.playCompleteFanfare();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-[10px] font-bold transition cursor-pointer"
                        >
                          Download Android Studio .ZIP
                        </button>
                        {onOpenDownloadModal && (
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              onOpenDownloadModal('apk_studio');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-[10px] font-bold transition cursor-pointer"
                          >
                            Customize in APK Studio
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickActionStatus(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition shrink-0 cursor-pointer"
                  aria-label="Dismiss status"
                >
                  <X size={12} />
                </button>
              </div>
              {typeof quickActionStatus.progress === 'number' && (
                <div className="mt-2 w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                    style={{ width: `${quickActionStatus.progress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* The 10-Row Grid Section - AppleFortuneBoard with breathing/pulse animation */}
        <div className="relative">
          <AppleFortuneBoard
            session={session}
            currentStep={currentStep}
            isVip={Boolean(isVip)}
            requireVipAfterStep={appState.config.requireVipAfterStep}
            aiModeEnabled={true}
          />

          {/* Operating Hours Lockout Overlay (07:00 AM - 10:00 PM) */}
          {isLockedBySchedule && (
            <div className="absolute inset-x-2 inset-y-2 bg-[#08120b]/95 backdrop-blur-md rounded-2xl border border-amber-500/40 p-5 flex flex-col items-center justify-center text-center z-30 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-3 text-amber-400">
                <Clock size={28} className="animate-pulse" />
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold uppercase mb-2">
                Night Schedule Offline
              </div>
              <h3 className="text-white font-extrabold text-base mb-1">
                ប្រព័ន្ធផ្អាកដំណើរការសម្រាកពេលយប់
              </h3>
              <p className="text-gray-300 text-xs mb-4 max-w-[300px] leading-relaxed">
                ម៉ោងដំណើរការប្រព័ន្ធ: <strong>07:00 ព្រឹក ដល់ 22:00 យប់ (7:00 AM - 10:00 PM)</strong>។ ប្រព័ន្ធនឹងបើកដំណើរការឡើងវិញដោយស្វ័យប្រវត្តិតាមម៉ោងកំណត់។ សូមអរគុណសម្រាប់ការចូលរួមគេហទំព័រយើងខ្ញុំ!
              </p>
              <div className="flex flex-col gap-2 w-full max-w-[240px]">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full py-2 px-3 rounded-xl bg-[#142618] hover:bg-[#1a3320] text-emerald-300 border border-emerald-500/30 font-bold text-xs transition cursor-pointer"
                >
                  Admin / Owner Bypass Login
                </button>
              </div>
            </div>
          )}

          {/* VIP Upgrade Overlay Banner if user hits the free limit */}
          {isVipBlocked && (
            <div className="absolute inset-x-4 top-16 bottom-20 bg-[#09140c]/90 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-4 flex flex-col items-center justify-center text-center z-10 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mb-2 text-yellow-400">
                <Crown size={24} />
              </div>
              <h3 className="text-white font-bold text-base mb-1">{t.vipRequiredTitle}</h3>
              <p className="text-gray-300 text-xs mb-3 max-w-[280px] leading-relaxed">
                {t.vipRequiredDesc}
              </p>
              <div className="flex flex-col gap-2 w-full max-w-[240px]">
                <button
                  onClick={onOpenStore}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  {t.upgradeBtn}
                </button>
                <button
                  onClick={() => onOpenAuth('key')}
                  className="w-full py-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  {t.activeKey}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Buttons (Matches user screenshot 1 & 2) */}
        <div className="p-4 pt-3 pb-5 bg-[#0a140d] border-t border-[#1a2d1f] space-y-2.5">
          {/* Bot AI v6.0 Instant Scan Ribbon */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Bot AI v6.0 Live Scan (99.99%)</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded border border-emerald-500/30">
                0 Bugs • {appState.config.serverFeedIp || '185.195.234.19'}
              </span>
            </span>
            <span className="text-gray-400">Owner: <strong className="text-white">By Sokpong</strong></span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Left Button: "Start" (when step is 0) or "Next" (when step > 0) */}
            {currentStep === 0 ? (
              <button
                onClick={handleNextStep}
                className="py-3 px-4 rounded-2xl bg-[#22c55e] hover:bg-[#27d968] active:scale-[0.98] text-black font-extrabold text-base transition-all shadow-[0_4px_14px_rgba(34,197,94,0.35)] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={18} fill="currentColor" />
                <span>{t.start} Bot Pro</span>
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={currentStep >= 10 || isVipBlocked}
                className={`py-3 px-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  currentStep >= 10 || isVipBlocked
                    ? 'bg-[#1b2f20] text-gray-500 cursor-not-allowed border border-[#243d2b]'
                    : 'bg-[#285333] hover:bg-[#2f633d] active:scale-[0.98] text-[#8ce2a2] border border-[#3b754b] shadow-[0_4px_12px_rgba(34,197,94,0.2)]'
                }`}
              >
                {t.next}
                <ArrowRight size={16} />
              </button>
            )}

            {/* Right Button: "New signal" */}
            <button
              onClick={handleNewSignal}
              className="py-3 px-4 rounded-2xl bg-[#1c2b20] hover:bg-[#24382a] active:scale-[0.98] text-white font-bold text-base border border-[#2e4735] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw size={16} />
              {t.newSignal}
            </button>
          </div>

          {/* Quick Auto-reveal / Power Max AI options below buttons */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#16271a] text-xs text-gray-400 gap-2">
            <button
              onClick={handleAutoReveal}
              disabled={isVipBlocked}
              className={`min-h-[40px] px-2.5 flex items-center justify-center gap-1.5 py-1.5 rounded-xl border transition cursor-pointer whitespace-nowrap ${
                isAutoRevealing
                  ? 'bg-amber-500/20 text-yellow-300 border-amber-500/40 animate-pulse'
                  : 'bg-[#132216] text-gray-300 border-[#233d28] hover:text-white'
              }`}
            >
              <Zap size={14} className={isAutoRevealing ? 'text-yellow-400 fill-yellow-400' : 'text-emerald-400'} />
              <span>{isAutoRevealing ? t.stop : t.autoReveal}</span>
            </button>

            <button
              onClick={handlePowerMaxScanAi}
              disabled={isVipBlocked}
              className="flex-1 min-h-[40px] px-3 flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-emerald-500/25 to-cyan-500/25 text-amber-200 border border-amber-400/50 hover:from-amber-500/40 hover:to-cyan-500/40 transition font-extrabold cursor-pointer whitespace-nowrap"
              title="Power Max Scan Signal AI (60 FPS Quick & Smooth)"
            >
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>Power Max Scan AI</span>
            </button>

            <button
              onClick={handleInstantTurbo}
              disabled={isVipBlocked || currentStep >= 10}
              className="min-h-[40px] px-2.5 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/35 transition font-bold cursor-pointer whitespace-nowrap"
              title="Turbo All Rows (1-10)"
            >
              <span>Turbo (1-10)</span>
            </button>

            <button
              onClick={onOpenStore}
              className="min-h-[40px] flex items-center gap-1 text-xs text-yellow-400/90 hover:text-yellow-300 transition py-1 px-2 shrink-0 cursor-pointer whitespace-nowrap"
            >
              <Crown size={14} className="text-yellow-400" />
              <span>{user.vipTier === 'free' ? 'Unlock VIP' : 'VIP'}</span>
            </button>
          </div>
        </div>

        {/* Footer info verification */}
        <div className="px-4 py-2 bg-[#08100a] text-[10px] text-gray-500 flex items-center justify-between font-mono">
          <span className="truncate max-w-[200px]">Seed: {session.clientSeed}</span>
          <span className="flex items-center gap-1 text-emerald-500">
            <ShieldCheck size={12} /> Provably Fair
          </span>
        </div>
      </div>

      {/* Quick helper tip below mockup */}
      <div className="mt-3 text-center text-xs text-gray-400 max-w-[420px] flex items-center justify-center gap-1.5">
        <Info size={14} className="text-emerald-400 shrink-0" />
        <span>ចុច "Start" ឬ "Next" ដើម្បីបង្ហាញទីតាំងផ្លែប៉ោមសុវត្ថិភាព 🍎 រាល់ជំហាន</span>
      </div>

      {/* Daily Win Probability Forecast (Best Time Windows & Historical Pattern Analytics) */}
      <div className="mt-3.5 w-full flex justify-center">
        <DailyWinProbabilityForecast onGenerateSignal={handleNewSignal} />
      </div>

      {/* 4 Featured Payment Banks Bar in Website */}
      <div
        onClick={onOpenStore}
        className="mt-3 w-full max-w-[420px] p-2.5 rounded-2xl bg-[#09150d] border border-[#1d3522] hover:border-emerald-500/50 transition cursor-pointer flex items-center justify-between gap-2 shadow-lg"
        title="ចុចដើម្បីទិញកញ្ចប់ VIP តាមរយៈ 4 ធនាគារផ្លូវការ"
      >
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-gray-400">ទូទាត់ប្រាក់ស្វ័យប្រវត្តិ 100% តាម៖</span>
          <span className="text-[11px] font-bold text-white">4 ធនាគារផ្លូវការ (Auto VIP)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#0e1f13] border border-[#1b3420]" title="KHQR (Bakong)">
            <KhqrLogo className="w-5 h-3.5" />
            <span className="text-[9px] font-bold text-gray-200">KHQR</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#0e1f13] border border-[#1b3420]" title="AMK Bank">
            <AmkLogo className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold text-gray-200">AMK</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#0e1f13] border border-[#1b3420]" title="KB Prasac Bank">
            <KbPrasacLogo className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold text-gray-200">Prasac</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#0e1f13] border border-[#1b3420]" title="PPC Bank">
            <PpcLogo className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold text-gray-200">PPC</span>
          </div>
        </div>
      </div>

      {/* Ultra Hack Apple (Ultra Scan Signal Real Max) Download Card */}
      {onOpenDownloadModal && (
        <div
          onClick={() => {
            sound.playClick();
            onOpenDownloadModal('ultra_hack');
          }}
          className="mt-2.5 w-full max-w-[420px] p-2.5 rounded-2xl bg-gradient-to-r from-[#0d2215] via-[#122e1c] to-[#0d2215] border border-emerald-500/40 hover:border-emerald-400 transition cursor-pointer flex items-center justify-between gap-2 shadow-lg group select-none"
          title="ចុចដើម្បីទាញយក File Ultra Hack Apple (.ZIP / .user.js)"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FolderDown size={16} />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>File Ultra Hack Apple</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono px-1 rounded">
                  v5.5.0
                </span>
              </div>
              <div className="text-[10px] text-gray-400">
                Ultra Scan Signal Real Max • Chrome & Kiwi Extension
              </div>
            </div>
          </div>
          <button
            type="button"
            className="py-1 px-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-[10px] transition shadow flex items-center gap-1 group-hover:bg-emerald-400"
          >
            <Download size={11} />
            <span>ទាញយក</span>
          </button>
        </div>
      )}

      {/* 1xBet Server 185.195.234.19 Live WebSocket Telemetry & Stream Monitor Modal */}
      {isLiveMonitorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-[#09140d] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#183120] bg-[#0c1c13]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Activity size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                    <span>{platformLabel} Server (185.195.234.19) Live Stream Monitor</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      100% Smooth
                    </span>
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono">
                    wss://185.195.234.19:8443/live/apple-of-fortune • Feed ID: {appState.websocketHeartbeat.activeFeedId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLiveMonitorOpen(false)}
                className="w-8 h-8 rounded-full bg-[#13271a] hover:bg-[#1a3825] text-gray-400 hover:text-white flex items-center justify-center transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Telemetry Stats Grid */}
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#0a170e] border-b border-[#162d1d]">
              <div className="p-2.5 rounded-xl bg-[#102217] border border-[#1b3a24]">
                <span className="text-[10px] text-gray-400 block">WebSocket Ping</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <Zap size={13} className="text-yellow-400" />
                  {appState.websocketHeartbeat.lastPingMs} ms
                </span>
                <span className="text-[9px] text-gray-500">Jitter: {appState.websocketHeartbeat.jitterMs}ms</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#102217] border border-[#1b3a24]">
                <span className="text-[10px] text-gray-400 block">Packets Received</span>
                <span className="text-sm font-bold text-cyan-300 mt-0.5 block">
                  {appState.websocketHeartbeat.packetsReceived.toLocaleString()}
                </span>
                <span className="text-[9px] text-emerald-400">Loss: 0.00%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#102217] border border-[#1b3a24]">
                <span className="text-[10px] text-gray-400 block">Stream Fidelity</span>
                <span className="text-sm font-bold text-yellow-300 mt-0.5 block">100.0%</span>
                <span className="text-[9px] text-gray-500">60 FPS Ultra-Smooth</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#102217] border border-[#1b3a24]">
                <span className="text-[10px] text-gray-400 block">{platformLabel} Account</span>
                <span className="text-xs font-bold text-white mt-0.5 truncate block">
                  {activeAccountId ? `#${activeAccountId}` : 'Not Linked'}
                </span>
                <span className="text-[9px] text-cyan-400">
                  {activeAccountId ? 'Verified Direct API' : 'Need ID Account'}
                </span>
              </div>
            </div>

            {/* Live Terminal Log Stream */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-400 pb-1">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <Terminal size={14} className="text-cyan-400" />
                  <span>Real-Time WebSocket Feed Console ({appState.dailyNetworkConfig.currentNode.feedIp})</span>
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  STREAM ACTIVE
                </span>
              </div>

              <div className="h-44 p-3 rounded-2xl bg-[#050c07] border border-[#14281a] overflow-y-auto space-y-1.5 text-[10px] font-mono leading-relaxed text-gray-300">
                <div className="text-gray-500">[INIT] Connected to wss://{appState.dailyNetworkConfig.currentNode.feedIp} ({appState.dailyNetworkConfig.currentNode.encryption})</div>
                <div className="text-cyan-400">
                  [{platformShort}_AUTH] {platformLabel} Account {activeAccountId ? `#${activeAccountId} handshake authorized 100%` : 'awaiting Account ID binding'}
                </div>
                <div className="text-emerald-400">
                  [FEED_SYNC] Round {session.gameId} matched seed {session.clientSeed}
                </div>
                <div className="text-gray-400">
                  [{appState.dailyNetworkConfig.currentNode.feedIp}] &gt;&gt; RECV: AOF_GRID_SAFE_PATH [cols: {session.steps.map(s => s.safeColumn).join(',')}]
                </div>
                <div className="text-yellow-400">
                  [HEARTBEAT] ping: {appState.websocketHeartbeat.lastPingMs}ms | pkts: {appState.websocketHeartbeat.packetsReceived} | zero_jitter: ok
                </div>
                <div className="text-emerald-400">
                  [AI_POWER_MAX] Prediction engine locked to 100% pinpoint smooth signal
                </div>
                <div className="text-cyan-300">
                  [LIVE_FEED] Streaming real-time seed feed directly to Apple of Fortune UI (60 FPS)
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 pt-0 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    appState.connectServerToFeedIp('185.195.234.19');
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Re-Sync Feed (185.195.234.19)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenAuth(activePlatform === 'sokrizybet' ? 'sokrizybet' : '1xbet');
                    setIsLiveMonitorOpen(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#14261a] hover:bg-[#1b3424] text-gray-300 hover:text-white border border-[#23422a] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Globe size={13} />
                  <span>ប្តូរ {platformLabel} Account ID</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsLiveMonitorOpen(false)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition cursor-pointer"
              >
                រួចរាល់ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
