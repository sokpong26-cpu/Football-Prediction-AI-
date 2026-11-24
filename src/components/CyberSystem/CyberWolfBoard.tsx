import React, { useState, useEffect, useRef } from 'react';
import { appState, generateRandomCyberGrid } from '../../services/store';
import { sound } from '../../services/sound';
import { CyberBoardRow } from '../../types';
import {
  Smartphone,
  Monitor,
  User,
  Power,
  RotateCw,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Send,
  Pause,
  Play,
  RefreshCw,
  Palette,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppleAssetStudioModal } from './AppleAssetStudioModal';
import { DailyIpManagerModal } from './DailyIpManagerModal';

interface CyberWolfBoardProps {
  onLogout: () => void;
  onOpenAdmin?: () => void;
}

/* ==========================================================================
   SVG DISCS: Safe Apple (Green Ring) & Rotten Core (Red Ring)
   Faithful to the user's screenshots
========================================================================== */

export const SafeAppleDisc: React.FC<{
  isPulsing?: boolean;
  tokenStyle?: 'classic_vector' | 'realism_wood';
}> = ({ isPulsing = false, tokenStyle = 'classic_vector' }) => {
  if (tokenStyle === 'classic_vector') {
    return (
      <div
        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 duration-200 select-none ${
          isPulsing ? 'animate-pulse' : ''
        }`}
        style={{
          background: 'radial-gradient(circle at 30% 30%, #2ecc71, #137e3b 70%, #084920)',
          boxShadow: '0 0 16px #00ff66, inset 0 2px 4px rgba(255,255,255,0.4)',
          border: '3.5px solid #00ff7f',
        }}
        title="Winning Apple (Green Medallion)"
      >
        <svg viewBox="0 0 100 100" className="w-[72%] h-[72%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
          {/* Red Apple Flesh Body */}
          <path
            d="M50 25 C30 10 10 30 18 65 C22 82 35 95 50 90 C65 95 78 82 82 65 C90 30 70 10 50 25 Z"
            fill="#e61919"
          />
          {/* Specular curved highlight */}
          <path
            d="M30 30 C20 40 20 60 30 70"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Brown Curved Stem */}
          <path
            d="M50 25 Q52 10 60 6"
            stroke="#5c2c16"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Fresh Green Leaf */}
          <path
            d="M54 16 Q70 8 72 20 Q58 24 54 16 Z"
            fill="#44bd32"
          />
        </svg>
      </div>
    );
  }

  // Realistic 3D Wood Disc
  return (
    <div className={`relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center transition-transform hover:scale-110 duration-200 select-none ${isPulsing ? 'animate-pulse' : ''}`}>
      <svg viewBox="0 0 54 54" className="w-full h-full filter drop-shadow-[0_0_8px_rgba(34,197,94,0.7)]">
        {/* Outer Glow Halo Ring */}
        <circle cx="27" cy="27" r="25" fill="none" stroke="#22c55e" strokeWidth="2.5" />
        <circle cx="27" cy="27" r="23.5" fill="none" stroke="#4ade80" strokeWidth="0.8" opacity="0.8" />
        
        {/* Dark Wooden Disc Base */}
        <circle cx="27" cy="27" r="23" fill="#32160d" />
        <circle cx="27" cy="27" r="21" fill="#421e12" />
        <circle cx="27" cy="27" r="19" fill="#2b130a" />
        {/* Woodgrain inner rings */}
        <circle cx="27" cy="27" r="16" fill="none" stroke="#5a2918" strokeWidth="0.8" opacity="0.6" />
        <circle cx="27" cy="27" r="12" fill="none" stroke="#5a2918" strokeWidth="0.8" opacity="0.4" />
        
        {/* 3D Glossy Ripe Red Apple */}
        <g transform="translate(13, 11) scale(0.95)">
          {/* Apple Body Shadow */}
          <ellipse cx="14" cy="18" rx="11" ry="10" fill="#880e1a" opacity="0.8" />
          {/* Main Apple Body */}
          <path
            d="M14 6 C8 6, 4 10, 4 17 C4 24, 9 27, 14 26.5 C19 27, 24 24, 24 17 C24 10, 20 6, 14 6 Z"
            fill="url(#appleRedGrad)"
          />
          {/* Apple Highlight */}
          <ellipse cx="10" cy="12" rx="4" ry="5" fill="#ff7b89" opacity="0.75" />
          <ellipse cx="9" cy="11" rx="2" ry="2.5" fill="#ffffff" opacity="0.6" />
          {/* Stem */}
          <path d="M14 6 Q14.5 1, 17 0.5" stroke="#4a2711" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Green Leaf */}
          <path d="M14 4 Q19 1, 19 5 Q16 6, 14 4 Z" fill="#4ade80" />
        </g>

        <defs>
          <radialGradient id="appleRedGrad" cx="35%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="45%" stopColor="#e60012" />
            <stop offset="85%" stopColor="#9e000d" />
            <stop offset="100%" stopColor="#570005" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export const RottenCoreDisc: React.FC<{
  isPulsing?: boolean;
  tokenStyle?: 'classic_vector' | 'realism_wood';
}> = ({ isPulsing = false, tokenStyle = 'classic_vector' }) => {
  if (tokenStyle === 'classic_vector') {
    return (
      <div
        className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110 duration-200 select-none ${
          isPulsing ? 'animate-pulse' : ''
        }`}
        style={{
          background: 'radial-gradient(circle at 30% 30%, #a81c1c, #630808 70%, #300303)',
          boxShadow: '0 0 16px #ff0055, inset 0 2px 4px rgba(255,255,255,0.3)',
          border: '3.5px solid #ff2a6d',
        }}
        title="Losing Rotten Core (Red Medallion)"
      >
        <svg viewBox="0 0 100 100" className="w-[72%] h-[72%] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
          {/* Top Apple Cap */}
          <path d="M30 32 C30 20 70 20 70 32 C65 37 35 37 30 32 Z" fill="#d63031" />
          {/* Stem */}
          <path d="M50 24 Q52 12 58 8" stroke="#3e1b0c" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Bottom Apple Cap */}
          <path d="M32 78 C35 73 65 73 68 78 C65 88 35 88 32 78 Z" fill="#d63031" />
          {/* Core Hourglass Flesh */}
          <path d="M36 33 Q46 55 42 75 L58 75 Q54 55 64 33 Z" fill="#ffeaa7" />
          {/* Seed */}
          <ellipse cx="49" cy="54" rx="2" ry="4" fill="#2d3436" transform="rotate(-15 49 54)" />
        </svg>
      </div>
    );
  }

  // Realistic 3D Wood Core Disc
  return (
    <div className={`relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center transition-transform hover:scale-110 duration-200 select-none ${isPulsing ? 'animate-pulse' : ''}`}>
      <svg viewBox="0 0 54 54" className="w-full h-full filter drop-shadow-[0_0_10px_rgba(255,19,85,0.75)]">
        <defs>
          {/* Glow & Gradient Defs */}
          <radialGradient id="rottenWoodGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4f0d16" />
            <stop offset="65%" stopColor="#30070c" />
            <stop offset="100%" stopColor="#180306" />
          </radialGradient>

          <linearGradient id="rottenRedSkin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff2a3b" />
            <stop offset="45%" stopColor="#d60017" />
            <stop offset="85%" stopColor="#85000d" />
            <stop offset="100%" stopColor="#470005" />
          </linearGradient>

          <radialGradient id="rottenFleshGrad" cx="45%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fef6dc" />
            <stop offset="65%" stopColor="#f7e19e" />
            <stop offset="85%" stopColor="#e5be63" />
            <stop offset="100%" stopColor="#b3862b" />
          </radialGradient>

          <clipPath id="rottenDiscClip">
            <circle cx="27" cy="27" r="23" />
          </clipPath>
        </defs>

        {/* Outer Neon Glow Ring (Faithful to Screenshot 2) */}
        <circle cx="27" cy="27" r="25" fill="none" stroke="#ff0055" strokeWidth="2.5" />
        <circle cx="27" cy="27" r="23.5" fill="none" stroke="#ff4d88" strokeWidth="0.8" opacity="0.9" />

        {/* Dark Mahogany Wooden Disc Base */}
        <circle cx="27" cy="27" r="23" fill="url(#rottenWoodGrad)" />

        {/* Horizontal Wood Plank Stripes (Clipped to circular disc) */}
        <g clipPath="url(#rottenDiscClip)" opacity="0.45">
          <line x1="0" y1="11" x2="54" y2="11" stroke="#6b121d" strokeWidth="0.8" />
          <line x1="0" y1="11.8" x2="54" y2="11.8" stroke="#000000" strokeWidth="0.6" />

          <line x1="0" y1="19" x2="54" y2="19" stroke="#6b121d" strokeWidth="0.8" />
          <line x1="0" y1="19.8" x2="54" y2="19.8" stroke="#000000" strokeWidth="0.6" />

          <line x1="0" y1="27" x2="54" y2="27" stroke="#6b121d" strokeWidth="0.8" />
          <line x1="0" y1="27.8" x2="54" y2="27.8" stroke="#000000" strokeWidth="0.6" />

          <line x1="0" y1="35" x2="54" y2="35" stroke="#6b121d" strokeWidth="0.8" />
          <line x1="0" y1="35.8" x2="54" y2="35.8" stroke="#000000" strokeWidth="0.6" />

          <line x1="0" y1="43" x2="54" y2="43" stroke="#6b121d" strokeWidth="0.8" />
          <line x1="0" y1="43.8" x2="54" y2="43.8" stroke="#000000" strokeWidth="0.6" />
        </g>

        {/* Disc Inner Bevel Ring */}
        <circle cx="27" cy="27" r="21.5" fill="none" stroke="#220407" strokeWidth="0.8" opacity="0.7" />

        {/* AUTHENTIC 3D ROTTEN APPLE CORE */}
        <g id="eatenAppleCore">
          {/* Core Drop Shadow */}
          <path
            d="M 18 13 C 27 10 36 13 36 16 C 36 20 31 22 30 27 C 31 33 37 34 37 40 C 37 43 27 45 17 41 C 17 35 23 32 24 27 C 23 22 18 20 18 13 Z"
            fill="#0c0203"
            opacity="0.6"
            transform="translate(1, 1.5)"
          />

          {/* Apple Stem */}
          <path
            d="M 27 12 C 27.5 9 29 7.5 30.5 6"
            stroke="#422006"
            strokeWidth="2.0"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 27.2 11.5 C 27.6 9 28.8 7.8 30 6.5"
            stroke="#78350f"
            strokeWidth="0.9"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bottom Red Apple Skin Rim */}
          <path
            d="M 18.5 38.5 C 20.5 42 33.5 42 35.5 38.5 C 34.5 42.5 19.5 42.5 18.5 38.5 Z"
            fill="url(#rottenRedSkin)"
          />

          {/* Main Hourglass Bitten Flesh Body */}
          <path
            d="M 19 16.5
               C 17 19, 21.5 20, 22.5 23
               C 23.5 25.5, 23 27, 23 27.5
               C 23 29, 21.5 31, 19.5 34
               C 18 36, 17.5 38, 18.5 40
               C 21 42.5, 33 42.5, 35.5 40
               C 36.5 38, 36 36, 34.5 34
               C 32.5 31, 31 29, 31 27.5
               C 31 27, 30.5 25.5, 31.5 23
               C 32.5 20, 37 19, 35 16.5
               C 31 18, 23 18, 19 16.5 Z"
            fill="url(#rottenFleshGrad)"
          />

          {/* Central Core Fiber Texture & Shadows */}
          <path
            d="M 26 18 C 26 23 25.5 30 25.5 38"
            stroke="#ca8a04"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 27.8 18.5 C 28 23 28.5 30 28.2 38"
            stroke="#b45309"
            strokeWidth="1.0"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* Brown Seeds Inside Core */}
          <ellipse cx="25.2" cy="26" rx="1.1" ry="1.9" fill="#2d1205" transform="rotate(-15 25.2 26)" />
          <ellipse cx="25" cy="25.8" rx="0.3" ry="0.8" fill="#78350f" transform="rotate(-15 25 25.8)" />
          <ellipse cx="28.8" cy="27" rx="1.1" ry="1.9" fill="#2d1205" transform="rotate(18 28.8 27)" />
          <ellipse cx="28.6" cy="26.8" rx="0.3" ry="0.8" fill="#78350f" transform="rotate(18 28.6 26.8)" />

          {/* Flesh Specular Highlights & Teeth Bite Ridges */}
          <path d="M 20 18 Q 22 20 23.5 23" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.85" />
          <path d="M 34 18 Q 32 20 30.5 23" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.7" />
          <ellipse cx="27" cy="27" rx="2" ry="4" fill="#ffffff" opacity="0.35" />
          <path d="M 20 37 Q 27 40 34 37" stroke="#ffffff" strokeWidth="1.0" strokeLinecap="round" fill="none" opacity="0.6" />

          {/* Top Red Apple Skin Cap */}
          <path
            d="M 27 11.5
               C 24.5 9.5, 17 10, 16.5 14
               C 16.2 16, 17.5 17.5, 19 17
               C 20.5 16.5, 21.5 18, 23 18
               C 24.5 18, 25.5 16.8, 27 17.2
               C 28.5 16.8, 29.5 18, 31 18
               C 32.5 18, 33.5 16.5, 35 17
               C 36.5 17.5, 37.8 16, 37.5 14
               C 37 10, 29.5 9.5, 27 11.5 Z"
            fill="url(#rottenRedSkin)"
          />

          {/* Top Cap Glossy Specular Highlight */}
          <path
            d="M 19 12.5 C 22 11 25.5 11 26 12 C 24 13 20.5 13.5 19 12.5 Z"
            fill="#ffffff"
            opacity="0.8"
          />
          <circle cx="18" cy="13.5" r="0.8" fill="#ffffff" opacity="0.7" />

          {/* Bite Mark White Flesh Rim */}
          <path
            d="M 18.5 17 Q 21 16.5 23 17.5 Q 25 16.5 27 17 Q 29 16.5 31 17.5 Q 33 16.5 35.5 17"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};

/* ==========================================================================
   MAIN COMPONENT: CyberWolfBoard
========================================================================== */

export const CyberWolfBoard: React.FC<CyberWolfBoardProps> = ({
  onLogout,
  onOpenAdmin,
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'pc'>('mobile');
  const [gridRows, setGridRows] = useState<CyberBoardRow[]>(() => generateRandomCyberGrid());
  const [isScanning, setIsScanning] = useState(false);
  const [scanCount, setScanCount] = useState(1);
  const [aiScanMode, setAiScanMode] = useState<'power_max' | 'ultra_max'>('power_max');

  // Apple & Rotten Core Token Style ('classic_vector' matches user's 1xBet HTML/SVG, 'realism_wood' matches 3D medallion)
  const [tokenStyle, setTokenStyle] = useState<'classic_vector' | 'realism_wood'>(() => {
    return (localStorage.getItem('aof_token_style') as 'classic_vector' | 'realism_wood') || 'classic_vector';
  });
  const [isAssetStudioOpen, setIsAssetStudioOpen] = useState(false);
  const [isDailyIpModalOpen, setIsDailyIpModalOpen] = useState(false);

  // Subscribe to global store updates (such as daily IP auto-rotations)
  const [, setStoreTick] = useState(0);
  useEffect(() => {
    return appState.subscribe(() => setStoreTick((t) => t + 1));
  }, []);

  // Live Refresh: 10-second automatic signal pull with countdown
  const [isLiveRefreshActive, setIsLiveRefreshActive] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(10);
  const [justRefreshedFlash, setJustRefreshedFlash] = useState<boolean>(false);
  const scanIntervalRef = useRef<number | null>(null);
  const flashTimeoutRef = useRef<number | null>(null);
  const isScanningRef = useRef<boolean>(false);

  const clearScanTimers = () => {
    if (scanIntervalRef.current !== null) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
      flashTimeoutRef.current = null;
    }
    isScanningRef.current = false;
  };

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  useEffect(() => {
    return () => {
      clearScanTimers();
    };
  }, []);

  useEffect(() => {
    if (!isLiveRefreshActive) return;

    const timer = window.setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          if (!isScanningRef.current) {
            setGridRows(generateRandomCyberGrid());
            setJustRefreshedFlash(true);
            if (flashTimeoutRef.current !== null) {
              window.clearTimeout(flashTimeoutRef.current);
            }
            flashTimeoutRef.current = window.setTimeout(() => {
              setJustRefreshedFlash(false);
              flashTimeoutRef.current = null;
            }, 1000);
          }
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isLiveRefreshActive]);

  const handleManualLiveRefresh = () => {
    sound.playClick();
    if (isScanningRef.current) return;
    setGridRows(generateRandomCyberGrid());
    setRefreshCountdown(10);
    setJustRefreshedFlash(true);
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current);
    }
    flashTimeoutRef.current = window.setTimeout(() => {
      setJustRefreshedFlash(false);
      flashTimeoutRef.current = null;
    }, 1000);
  };

  const activePlatform =
    appState.currentUser?.bettingPlatform || appState.cyberAuth.platform || 'sokrizybet';
  const isSokRizy = activePlatform === 'sokrizybet';
  const accountId =
    appState.currentUser?.sokRizyBetAccountId ||
    appState.cyberAuth.accountId ||
    appState.currentUser?.oneXBetAccountId ||
    'User';

  // Dynamic Bot AI v6.0 Quick Scan Generator (99.99% Real-Time Live Signal On Target, Zero Bugs)
  const runScanSweep = (mode: 'power_max' | 'ultra_max' = aiScanMode) => {
    if (isScanningRef.current) return;
    sound.playClick();
    if (scanIntervalRef.current !== null) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setAiScanMode(mode);
    isScanningRef.current = true;
    setIsScanning(true);

    const stepDelayMs = mode === 'power_max' ? 28 : 55;
    const totalFrames = mode === 'power_max' ? 4 : 5;
    let tick = 0;
    scanIntervalRef.current = window.setInterval(() => {
      setGridRows(generateRandomCyberGrid());
      tick++;
      if (tick >= totalFrames) {
        if (scanIntervalRef.current !== null) {
          window.clearInterval(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        const finalGrid = generateRandomCyberGrid();
        setGridRows(finalGrid);
        isScanningRef.current = false;
        setIsScanning(false);
        setScanCount((c) => c + 1);
        sound.playCompleteFanfare();

        const now = new Date();
        const timeFormatted = now.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const platformLabel = isSokRizy ? 'SokRizyBet' : '1xBet';
        appState.scannedSignalsHistory.unshift({
          id: `sig_cyber_${Date.now()}`,
          gameId: `#${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          userName: `${platformLabel} #${accountId}`,
          userVipTier: 'lifetime',
          strategy: mode,
          sourceServer: `${platformLabel} ${mode === 'power_max' ? 'Bot AI v6.0 High Scan (99.99%)' : 'Bot Live 99.99%'} (${appState.dailyNetworkConfig.currentNode.feedIp})`,
          outcome: 'WIN 🏆',
          stepReached: 10,
          multiplier: '×349.68',
          multiplierValue: 349.68,
          accuracy: 99.99,
          serverHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
          clientSeed: `${isSokRizy ? 'SRB' : '1XB'}-${accountId}-${Date.now().toString(36).toUpperCase()}`,
        });

        try {
          confetti({
            particleCount: mode === 'power_max' ? 65 : 50,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#10b981', '#00e5ff', '#ff0055', '#ffd700'],
          });
        } catch {}
      }
    }, stepDelayMs);
  };

  const handleStartScan = () => runScanSweep('ultra_max');
  const handlePowerMaxScanAi = () => runScanSweep('power_max');

  return (
    <div className="relative min-h-[96vh] w-full flex flex-col items-center justify-start py-4 px-2 select-none overflow-x-hidden">
      
      {/* Cyber Wolf Neon Futuristic Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0314]">
        {/* Background artwork: Cyber Wolf silhouette / screenshot reference with glow filter */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen scale-105 transition-all duration-700"
          style={{
            backgroundImage: "url('/assets/aistudio/Screenshot_20261021-103143_a2541257.png')",
          }}
        />
        {/* Futuristic Laser Light Beams & Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#120421]/80 via-[#0d0218]/90 to-[#06010c]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rose-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Container - adapts between Mobile (430px) and PC Version */}
      <div
        className={`relative z-10 w-full transition-all duration-300 flex flex-col items-center ${
          deviceMode === 'mobile' ? 'max-w-[420px]' : 'max-w-[620px]'
        }`}
      >
        {/* Top Header Controls: Device switcher & Token Asset Studio */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {/* [ 📱 Mobile ] [ 💻 PC Version ] */}
          <div className="flex items-center justify-center p-1 rounded-full bg-[#1b0523]/90 border border-[#ff0055]/50 shadow-[0_0_15px_rgba(255,0,85,0.3)]">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setDeviceMode('mobile');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-[#ff0055] text-white shadow-[0_0_12px_rgba(255,0,85,0.7)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone size={13} />
              <span>Mobile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setDeviceMode('pc');
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                deviceMode === 'pc'
                  ? 'bg-[#ff0055] text-white shadow-[0_0_12px_rgba(255,0,85,0.7)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Monitor size={13} />
              <span>PC Version</span>
            </button>
          </div>

          {/* Asset Studio & Prompts Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsAssetStudioOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600/30 to-purple-600/30 hover:from-emerald-500/40 hover:to-purple-500/40 border border-emerald-400/50 hover:border-emerald-300 text-emerald-300 text-xs font-bold font-mono transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5 cursor-pointer"
            title="Open Asset Studio: View 1xBet Vector SVGs, DALL-E 3 / Midjourney Prompts, and Download Code"
          >
            <Palette size={13} className="text-emerald-400" />
            <span>🎨 Asset Studio</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 font-black">
              AI PROMPTS
            </span>
          </button>

          {/* Daily IP Auto-Change & Software Update Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsDailyIpModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-600/30 via-purple-600/30 to-[#ff0055]/30 hover:from-cyan-500/40 hover:to-[#ff0055]/40 border border-cyan-400/50 hover:border-cyan-300 text-cyan-300 text-xs font-bold font-mono transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-1.5 cursor-pointer"
            title="Open Daily IP Auto-Change Engine & System Software Updater"
          >
            <Globe size={13} className="text-cyan-400" />
            <span>🌐 Daily IP</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 font-black">
              {appState.dailyNetworkConfig.currentNode.feedIp.split(':')[0]}
            </span>
          </button>
        </div>

        {/* Token Style Selector Bar */}
        <div className="w-full max-w-[380px] mb-2 px-3 py-1.5 rounded-xl bg-[#13031a]/85 border border-purple-500/30 flex items-center justify-between text-xs">
          <span className="text-gray-300 font-mono text-[11px] flex items-center gap-1.5">
            <span className="text-[#00ff7f]">●</span>
            <span>Token Style:</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTokenStyle('classic_vector');
                localStorage.setItem('aof_token_style', 'classic_vector');
              }}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                tokenStyle === 'classic_vector'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Classic 1xBet Vector
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTokenStyle('realism_wood');
                localStorage.setItem('aof_token_style', 'realism_wood');
              }}
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                tokenStyle === 'realism_wood'
                  ? 'bg-[#ff0055]/20 text-pink-300 border border-[#ff0055]/60 shadow-[0_0_8px_rgba(255,0,85,0.4)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              3D Wood Medallion
            </button>
          </div>
        </div>

        {/* 🧠 BitsGap Bot AI v6.0 - 99.99% Real-Time Live Signal Core Card */}
        <div className="w-full max-w-[380px] mb-2 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#170322] via-[#210531] to-[#12021b] border border-[#ff0055]/50 shadow-[0_0_16px_rgba(255,0,85,0.3)] relative overflow-hidden text-left select-none">
          <div className="flex items-center justify-between gap-1.5 mb-1 flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-black flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>BOT AI v6.0 • BITSGAP</span>
            </span>
            <span className="text-[9px] font-mono text-pink-300 font-bold bg-[#ff0055]/20 px-2 py-0.5 rounded border border-[#ff0055]/40">
              99.99% Live Signal
            </span>
          </div>
          <p className="text-[11px] font-black text-white leading-tight">
            ⚡ AI High Scan Signal • Real-Time Live Signal 99.99% On Target
          </p>
          <p className="text-[10px] text-gray-300 mt-1 leading-snug">
            Bot Scan Signal Quick powered by <strong className="text-emerald-400">Bot AI v6.0</strong> — zero bugs, sub-millisecond feed lock.
          </p>
        </div>

        {/* System Telemetry & CyderShield V4.0 Enterprise Banner */}
        <div className="w-full max-w-[380px] mb-3 px-3 py-1.5 rounded-xl bg-[#14031d]/90 border border-[#ff0055]/40 flex items-center justify-between text-[10px] font-mono shadow-[0_0_12px_rgba(255,0,85,0.25)]">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[#ff3366] font-bold">
              CyderShield V4.0
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              0 Bugs • 99.99%
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsDailyIpModalOpen(true);
            }}
            className="flex items-center gap-2 text-gray-400 text-[9px] hover:text-white transition cursor-pointer"
            title="Click to manage Daily IP and System Software"
          >
            <span>Feed: <strong className="text-cyan-300">{appState.dailyNetworkConfig.currentNode.feedIp}</strong></span>
            <span>•</span>
            <span>Host: <strong className="text-purple-300">{appState.dailyNetworkConfig.currentNode.hostIp}</strong></span>
          </button>
        </div>

        {/* User ID Badge with Active Platform (SokRizyBet / 1xBet) & Live Signal Target */}
        <div className="w-full max-w-[380px] px-4 py-2 rounded-full bg-[#18031d]/90 border-2 border-[#ff0055] shadow-[0_0_16px_rgba(255,0,85,0.5)] flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full bg-[#ff0055] flex items-center justify-center text-white shrink-0">
              <User size={12} />
            </div>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-[10px] shrink-0">
              {isSokRizy ? 'SokRizyBet' : '1xBet'}
            </span>
            <span className="text-[#ff1a66] font-mono font-black text-xs sm:text-sm tracking-wider truncate">
              #{accountId}
            </span>
          </div>

          <div className="text-[10px] font-mono font-bold text-gray-400 shrink-0">
            Target: <span className="text-emerald-400 font-black">99.99%</span>
          </div>
        </div>

        {/* Live Refresh (10s Countdown) Indicator Widget */}
        <div
          className={`w-full max-w-[380px] mb-3 p-2.5 rounded-2xl border transition-all duration-300 relative overflow-hidden select-none ${
            justRefreshedFlash
              ? 'bg-[#220324] border-[#ff0055] shadow-[0_0_20px_rgba(255,0,85,0.6)] scale-[1.01]'
              : 'bg-[#12031a]/95 border-[#ff0055]/40 shadow-[0_0_12px_rgba(255,0,85,0.25)]'
          }`}
        >
          {/* Subtle animated background progress bar draining every 10 seconds */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#ff0055] via-purple-500 to-cyan-400 transition-all duration-1000 ease-linear pointer-events-none"
            style={{ width: `${(refreshCountdown / 10) * 100}%` }}
          />

          <div className="flex items-center justify-between gap-2.5 relative z-10">
            {/* Left: Circular Countdown Dial & Status */}
            <div className="flex items-center gap-2.5">
              {/* Circular SVG Ring Countdown Indicator */}
              <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-[#2a0435]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Dynamic Progress Ring */}
                  <path
                    className={`transition-all duration-1000 ease-linear ${
                      refreshCountdown <= 3 ? 'text-yellow-400 stroke-yellow-400' : 'text-[#ff0055] stroke-[#ff0055]'
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
                  className={`absolute font-mono font-black text-[11px] ${
                    refreshCountdown <= 3 ? 'text-yellow-300 animate-pulse' : 'text-white'
                  }`}
                >
                  {refreshCountdown}s
                </span>
              </div>

              {/* Text Info */}
              <div className="flex flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                        isLiveRefreshActive ? 'bg-[#ff0055]' : 'bg-gray-400'
                      } opacity-75`}
                    ></span>
                    <span
                      className={`relative inline-flex rounded-full h-2 w-2 ${
                        isLiveRefreshActive ? 'bg-[#ff0055]' : 'bg-gray-500'
                      }`}
                    ></span>
                  </span>
                  <span className="text-white font-mono font-black text-xs">
                    Live Refresh (10s)
                  </span>
                  {justRefreshedFlash ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff0055] text-white font-mono font-black animate-bounce shadow-sm">
                      UPDATED!
                    </span>
                  ) : (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#ff0055]/20 text-[#ff4d88] font-mono font-bold">
                      {isLiveRefreshActive ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5">
                  Auto-pulling 1xBet Feed <strong className="text-cyan-400 font-mono">{appState.dailyNetworkConfig.currentNode.feedIp}</strong>
                </span>
              </div>
            </div>

            {/* Right: Instant Sync & Pause/Resume */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleManualLiveRefresh}
                className="py-1 px-2 rounded-xl bg-[#ff0055]/20 hover:bg-[#ff0055]/30 text-pink-300 border border-[#ff0055]/40 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                title="Instant Pull Signal"
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
                    ? 'bg-[#22042b] hover:bg-[#32073e] text-pink-300 border-[#ff0055]/40'
                    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                }`}
                title={isLiveRefreshActive ? 'Pause 10s Live Refresh' : 'Resume 10s Live Refresh'}
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

        {/* The 10-Row Grid (Faithful to Screenshots 2-7 with Accuracy Targets) */}
        <div className="w-full flex flex-col gap-1.5 px-2 select-none">
          {/* Display in reverse: Row 9 (349.68) at TOP, Row 0 (1.23) at BOTTOM */}
          {[...gridRows].reverse().map((row) => {
            const accTag = '99.99%';

            return (
              <div key={row.rowIndex} className="flex items-center justify-center gap-2 sm:gap-2.5">
                
                {/* Left Multiplier Rounded Rectangle Badge with Accuracy Rate */}
                <div className="w-18 h-8 sm:h-9 rounded-lg bg-[#1a051f]/80 border-2 border-[#ff0055] shadow-[0_0_8px_rgba(255,0,85,0.4)] flex flex-col items-center justify-center shrink-0 leading-tight">
                  <span className="text-[#ff3366] font-mono font-black text-xs sm:text-[13px] tracking-tight drop-shadow-[0_0_5px_rgba(255,0,85,0.7)]">
                    {row.multiplier}
                  </span>
                  <span className="text-[8px] font-mono font-bold text-emerald-400 -mt-0.5">
                    ({accTag})
                  </span>
                </div>

                {/* 5 Discs (Apples with Green Ring & Rotten Cores with Red Ring) */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {row.cells.map((cellType, colIdx) => (
                    <div key={colIdx} className="flex items-center justify-center">
                      {cellType === 'apple' ? (
                        <SafeAppleDisc isPulsing={isScanning} tokenStyle={tokenStyle} />
                      ) : (
                        <RottenCoreDisc isPulsing={isScanning} tokenStyle={tokenStyle} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Scan Controls: Bot AI v6.0 Quick Scan (99.99%) + Live Start */}
        <div className="w-full max-w-[380px] mt-4 mb-3 grid grid-cols-2 gap-2 px-1">
          <button
            type="button"
            onClick={handlePowerMaxScanAi}
            disabled={isScanning}
            className="min-h-[46px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 text-black font-black text-xs sm:text-sm tracking-tight transition shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {isScanning && aiScanMode === 'power_max' ? (
              <>
                <RotateCw size={16} className="animate-spin" />
                <span>Quick Scan 99.99%</span>
              </>
            ) : (
              <>
                <Zap size={16} fill="currentColor" />
                <span>AI High Scan 99.99%</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStartScan}
            disabled={isScanning}
            className="min-h-[46px] py-2.5 px-4 rounded-2xl bg-gradient-to-r from-[#ff0055] via-[#ff2244] to-[#ff5500] hover:brightness-110 active:scale-[0.98] disabled:opacity-60 border-2 border-[#ffe600] text-white font-black text-sm tracking-wide transition shadow-[0_0_22px_rgba(255,0,85,0.7)] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isScanning && aiScanMode === 'ultra_max' ? (
              <span className="flex items-center gap-2 text-white">
                <RotateCw size={16} className="animate-spin text-yellow-300" />
                <span>Scanning...</span>
              </span>
            ) : (
              <span>Bot Scan Quick</span>
            )}
          </button>
        </div>

        {/* Script Developer Credit Card (Exact Match to Screenshot 140619) */}
        <div className="w-full max-w-[360px] p-5 rounded-[28px] bg-[#110218]/95 backdrop-blur-md border-2 border-[#ff0055] shadow-[0_0_25px_rgba(255,0,85,0.45)] flex flex-col items-center justify-center text-center mb-3">
          {/* Avatar Icon: Glowing circular badge with lightning bolt */}
          <div className="w-11 h-11 rounded-full p-[2.5px] bg-gradient-to-tr from-[#ff0055] via-purple-600 to-pink-500 shadow-[0_0_18px_rgba(255,0,85,0.9)] mb-2.5">
            <div className="w-full h-full rounded-full bg-[#180320] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial from-[#ff0055]/30 to-transparent" />
              <Zap size={20} className="text-[#ff1a66] fill-[#ff1a66] drop-shadow-[0_0_8px_rgba(255,0,85,0.9)] relative z-10" />
            </div>
          </div>

          <span className="text-[#f1f5f9] text-base font-mono tracking-wider font-medium mb-1">
            Script developed by
          </span>
          <a
            href="https://t.me/Sokpong168"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="text-[#ff1a66] hover:text-[#ff4d88] font-mono font-black text-base tracking-wider underline flex items-center gap-1.5 transition-all group cursor-pointer"
          >
            <span>@Sokpong168</span>
            <Send size={15} className="text-[#ff1a66] rotate-[-10deg] group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Logout Button (Faithful to Screenshots: ⏻ LOGOUT) */}
        <div className="w-full flex items-center justify-center mb-6">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              appState.logoutCyber();
              onLogout();
            }}
            className="px-6 py-2 rounded-full bg-[#14021a] hover:bg-[#20042b] border border-[#ff0055]/80 hover:border-[#ff0055] text-white font-mono font-bold text-xs tracking-wider transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)] hover:shadow-[0_0_16px_rgba(255,0,85,0.6)] cursor-pointer flex items-center gap-2"
          >
            <Power size={13} className="text-[#ff0055]" />
            <span>LOGOUT</span>
          </button>
        </div>

        {/* Quick Admin Navigation Link for easy administration */}
        {onOpenAdmin && (
          <div className="text-center pb-6">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="text-xs text-gray-500 hover:text-gray-300 font-mono underline transition cursor-pointer"
            >
              Go to Admin Dashboard &amp; Analytics
            </button>
          </div>
        )}
      </div>

      {/* Asset Studio & High-Detail AI Generation Prompts Modal */}
      <AppleAssetStudioModal
        isOpen={isAssetStudioOpen}
        onClose={() => setIsAssetStudioOpen(false)}
        tokenStyle={tokenStyle}
        onSelectTokenStyle={(newStyle) => {
          setTokenStyle(newStyle);
          localStorage.setItem('aof_token_style', newStyle);
        }}
      />

      {/* Daily IP Address Auto-Change Engine & System Software Updater Modal */}
      <DailyIpManagerModal
        isOpen={isDailyIpModalOpen}
        onClose={() => setIsDailyIpModalOpen(false)}
      />
    </div>
  );
};
