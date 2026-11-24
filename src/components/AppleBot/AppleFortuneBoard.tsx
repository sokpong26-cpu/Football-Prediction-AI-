import React from 'react';
import { MULTIPLIERS } from '../../services/store';
import { SignalSession } from '../../types';
import { Lock, Sparkles, Radio } from 'lucide-react';

interface AppleFortuneBoardProps {
  session: SignalSession;
  currentStep: number;
  isVip: boolean;
  requireVipAfterStep?: number;
  aiModeEnabled?: boolean;
}

export const AppleFortuneBoard: React.FC<AppleFortuneBoardProps> = ({
  session,
  currentStep,
  isVip,
  requireVipAfterStep = 4,
  aiModeEnabled = true,
}) => {
  return (
    <div className="px-4 py-2 flex flex-col gap-1.5 select-none relative">
      {[...MULTIPLIERS].reverse().map((row) => {
        const rowIndex = row.index; // 0 to 9
        const stepNum = rowIndex + 1; // 1 to 10
        const isRevealed = currentStep >= stepNum;
        const prediction = session.steps[rowIndex];
        const isCurrentActiveStep = currentStep === rowIndex;
        const isLockedForFree = !isVip && rowIndex >= requireVipAfterStep;

        return (
          <div key={row.index} className="flex items-center gap-2 group">
            {/* Left Multiplier Label (e.g. ×349.48, ×1.23) */}
            <div className="w-12 text-right">
              <span
                className={`text-[11px] font-mono tracking-tight transition-colors ${
                  isRevealed
                    ? 'text-emerald-400 font-bold scale-105 inline-block'
                    : isCurrentActiveStep
                    ? 'text-yellow-400 font-semibold'
                    : 'text-gray-500'
                }`}
              >
                {row.label}
              </span>
            </div>

            {/* 5 Rounded Cells */}
            <div className="flex-1 grid grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map((colIndex) => {
                const isAppleSafe = prediction && prediction.safeColumn === colIndex;
                const showApple = isRevealed && isAppleSafe;

                // Subtle breathing/pulse animation applied to active signal cards when AI mode is enabled
                const isCardActiveLiveScanning =
                  aiModeEnabled && (isCurrentActiveStep || (isRevealed && isAppleSafe));

                return (
                  <div
                    key={colIndex}
                    className={`h-11 rounded-xl transition-all duration-500 flex items-center justify-center relative overflow-hidden ${
                      showApple
                        ? `bg-[#22c55e] border border-[#4ade80] shadow-[0_0_16px_rgba(34,197,94,0.6)] scale-102 ring-1 ring-emerald-300 ${
                            aiModeEnabled
                              ? 'animate-[pulse_1.8s_cubic-bezier(0.4,0,0.6,1)_infinite]'
                              : ''
                          }`
                        : isRevealed
                        ? 'bg-[#18271c] border border-[#203726] opacity-60'
                        : isCurrentActiveStep
                        ? `bg-[#223828] border border-[#2f4f37] hover:border-emerald-600/50 ${
                            aiModeEnabled
                              ? 'animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] shadow-[0_0_12px_rgba(34,197,94,0.25)] ring-1 ring-emerald-500/30'
                              : 'animate-pulse'
                          }`
                        : 'bg-[#1a2b1f] border border-[#233a29] hover:bg-[#203527]'
                    }`}
                  >
                    {/* Breathing / Pulse Glow Ring Overlay when AI scanning is active */}
                    {isCardActiveLiveScanning && (
                      <span className="absolute inset-0 rounded-xl bg-radial from-emerald-400/20 to-transparent pointer-events-none animate-ping opacity-25" />
                    )}

                    {/* Revealed Apple Icon */}
                    {showApple && (
                      <div className="animate-in zoom-in-75 duration-300 flex items-center justify-center relative">
                        <span className="text-2xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] select-none transform hover:scale-110 transition-transform">
                          🍎
                        </span>
                        {aiModeEnabled && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-80" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                          </span>
                        )}
                      </div>
                    )}

                    {/* Subtle step lock indicator for free users */}
                    {!showApple && isLockedForFree && colIndex === 2 && !isRevealed && (
                      <Lock size={12} className="text-gray-600/60" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
