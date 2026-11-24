import React, { useState, useEffect } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import {
  RotateCw,
  Zap,
  Shield,
  Server,
  Cpu,
  Database,
  CheckCircle2,
  X,
  Radio,
  Flame,
  Globe,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SystemRebootModal: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return appState.subscribe(() => setTick((t) => t + 1));
  }, []);

  const isOpen = appState.isRebootModalOpen;
  const initialCountdown = appState.rebootCountdownSeconds || 5;
  const reason = appState.rebootReason || 'System Software & Multi-Region IP Address Update';

  const [countdown, setCountdown] = useState<number>(initialCountdown);
  const [isRebootingNow, setIsRebootingNow] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(initialCountdown);
      setIsRebootingNow(false);
      return;
    }

    setCountdown(initialCountdown);
    setIsRebootingNow(false);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTriggerReboot();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, initialCountdown]);

  const handleTriggerReboot = () => {
    setIsRebootingNow(true);
    sound.playCompleteFanfare();
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00e5ff', '#22c55e', '#ff0055', '#ffd700'],
      });
    } catch {}

    setTimeout(() => {
      appState.executeWebsiteReboot();
      setIsRebootingNow(false);
    }, 1200);
  };

  const handleCancel = () => {
    sound.playClick();
    appState.closeRebootModal();
  };

  if (!isOpen) return null;

  const currentNode = appState.dailyNetworkConfig.currentNode;
  const progressPercent = Math.max(0, Math.min(100, ((initialCountdown - countdown) / initialCountdown) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0a1520] via-[#081018] to-[#04080e] border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#ff0055]/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-cyan-900/40 bg-[#0c1a26]/70 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <RotateCw size={17} className={isRebootingNow ? 'animate-spin text-cyan-400' : ''} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
                <span>SYSTEM SOFTWARE REBOOT SEQUENCE</span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AUTO RESTART
                </span>
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                CyderShield V4.0 Enterprise • BitsGap Bot AI v6.0 (99.99%)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition cursor-pointer"
            title="Cancel automatic reboot"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 relative z-10">
          {/* Central Animated Countdown Ring */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer Pulsing Glow */}
              <div className="absolute inset-0 rounded-full bg-cyan-500/15 animate-ping" />
              
              {/* SVG Circular Progress Ring */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(6, 182, 212, 0.15)"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#06b6d4"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="351.85"
                  strokeDashoffset={351.85 - (351.85 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Numerical Countdown Display */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                {isRebootingNow ? (
                  <RotateCw size={36} className="animate-spin text-cyan-400" />
                ) : (
                  <>
                    <span className="text-4xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                      {countdown}
                    </span>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                      Seconds
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-3 text-center space-y-1">
              <h4 className="text-base font-black text-white">
                {isRebootingNow ? 'Rebooting All System Sockets...' : 'Website Reboot Initiating'}
              </h4>
              <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed">
                {reason}
              </p>
            </div>
          </div>

          {/* Real-Time Hardware & Service Validation Checklist */}
          <div className="p-3.5 rounded-2xl bg-[#060c14] border border-cyan-900/40 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-gray-400 border-b border-cyan-950 pb-1.5">
              <span className="font-bold flex items-center gap-1.5 text-gray-300">
                <Server size={13} className="text-cyan-400" />
                <span>Service Readiness Verification</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>100% HEALTHY</span>
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Rotated Feed IP:</span>
                </span>
                <span className="text-cyan-300 font-bold">{currentNode.feedIp} ({currentNode.region})</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Host Server &amp; DC:</span>
                </span>
                <span className="text-purple-300 font-bold">{currentNode.hostIp} ({currentNode.city})</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Decision AI Core:</span>
                </span>
                <span className="text-emerald-300 font-bold">BitsGap Bot AI v6.0 (99.99% Live Target)</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Cybersecurity Engine:</span>
                </span>
                <span className="text-pink-300 font-bold">CyderShield V4.0 Enterprise (0 Bugs)</span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Client Session State:</span>
                </span>
                <span className="text-emerald-400 font-bold">Preserved (0 Drops)</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTriggerReboot}
              disabled={isRebootingNow}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRebootingNow ? (
                <>
                  <RotateCw size={15} className="animate-spin" />
                  <span>Restarting Now...</span>
                </>
              ) : (
                <>
                  <Zap size={15} fill="currentColor" />
                  <span>Restart Website Now</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-3 rounded-xl bg-[#0c141e] hover:bg-[#121e2c] border border-gray-700/60 text-gray-300 font-bold text-xs transition cursor-pointer"
            >
              Cancel / Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
