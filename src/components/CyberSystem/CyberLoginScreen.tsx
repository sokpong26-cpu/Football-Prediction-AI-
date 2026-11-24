import React, { useState } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import { BettingPlatform } from '../../types';
import { Send, Zap, ShieldCheck } from 'lucide-react';

interface CyberLoginScreenProps {
  onSuccess?: () => void;
  onOpenAdmin?: () => void;
}

export const CyberLoginScreen: React.FC<CyberLoginScreenProps> = ({
  onSuccess,
  onOpenAdmin,
}) => {
  const [platform, setPlatform] = useState<BettingPlatform>('sokrizybet');
  const [accountId, setAccountId] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSokRizy = platform === 'sokrizybet';

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const id = accountId.trim();
    const key = keyInput.trim();

    if (!id || id.length < 5) {
      setErrorMsg(
        isSokRizy
          ? 'Please enter a valid SokRizyBet ID Account (min 5 characters)'
          : 'Please enter a valid 1xBet ID Account (min 5 digits)'
      );
      sound.playError();
      return;
    }

    if (!isSokRizy && !key) {
      setErrorMsg('Please enter an Activation Key for 1xBet login');
      sound.playError();
      return;
    }

    setIsLoading(true);
    sound.playClick();

    setTimeout(() => {
      appState.loginCyber(id, key, platform);
      setIsLoading(false);
      if (onSuccess) onSuccess();
    }, 360);
  };

  return (
    <div className="relative min-h-[92vh] w-full flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Digital Code / Matrix Stream Simulation */}
      <div className="absolute inset-0 bg-[#040810] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-25 font-mono text-[10px] text-cyan-400/40 leading-4 overflow-hidden select-none flex justify-around">
          {[...Array(14)].map((_, col) => (
            <div
              key={col}
              className="flex flex-col tracking-widest animate-pulse"
              style={{ animationDelay: `${(col * 230) % 1800}ms` }}
            >
              {'SOKRIZYBET POWER MAX SCAN AI 60FPS 1XBET 185.195.234.19 REALTIME SMOOTH SOKPONG'
                .split('')
                .map((ch, idx) => (
                  <span key={idx} className={idx % 4 === 0 ? 'text-cyan-300 font-bold' : 'text-cyan-800'}>
                    {ch}
                  </span>
                ))}
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-emerald-600/15 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[380px] rounded-[32px] p-7 pt-8 pb-8 bg-[#07111a]/95 backdrop-blur-xl border border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.35)] flex flex-col items-center">
        {/* Top Glowing Brand Medallion */}
        <div className="relative mb-5">
          <div className="w-22 h-22 rounded-full p-[3px] bg-gradient-to-tr from-emerald-400 via-cyan-300 to-purple-500 shadow-[0_0_24px_rgba(6,182,212,0.75)]">
            <div className="w-full h-full rounded-full bg-[#0a0f1d] overflow-hidden flex items-center justify-center relative">
              <div className="relative text-center z-10 px-2">
                <span className="text-base font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-200 to-purple-300 font-sans">
                  {isSokRizy ? 'SOKRIZY' : 'DEXTER'}
                </span>
                <div className="text-[8px] font-mono font-bold tracking-widest text-cyan-400/90 mt-0.5">
                  POWER MAX AI
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Switcher: SokRizyBet / 1xBet */}
        <div className="w-full grid grid-cols-2 gap-1.5 p-1 mb-5 rounded-xl bg-[#050d14] border border-cyan-500/30">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setPlatform('sokrizybet');
              setErrorMsg(null);
            }}
            className={`min-h-[40px] rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              isSokRizy
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-400 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap size={13} fill={isSokRizy ? 'currentColor' : 'none'} />
            <span>SokRizyBet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setPlatform('1xbet');
              setErrorMsg(null);
            }}
            className={`min-h-[40px] rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center justify-center gap-1.5 ${
              !isSokRizy
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={13} />
            <span>1xBet</span>
          </button>
        </div>

        {/* Title */}
        <h2 className="text-xl font-black tracking-wide text-white mb-1 text-center">
          {isSokRizy ? 'SokRizyBet ID Login' : '1xBet System Login'}
        </h2>
        <p className="text-[11px] text-cyan-300/90 font-mono text-center mb-5">
          Need ID Account · Scan Signal Real Time Quick &amp; Smooth
        </p>

        {/* Form Inputs */}
        <form onSubmit={handleActivate} className="w-full space-y-3.5">
          {/* Input 1: ID Account */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-gray-300 pl-1">
              {isSokRizy ? 'SokRizyBet ID Account (Required)' : '1xBet ID Account (Required)'}
            </label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder={isSokRizy ? 'Enter SokRizyBet ID (min 5 chars)' : 'Enter 1xBet ID (min 5 digits)'}
              className="w-full min-h-[46px] px-4 rounded-xl bg-[#06121c] border border-cyan-500/40 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/25 text-white font-mono text-center tracking-wider placeholder:text-cyan-700/80 transition shadow-inner text-sm"
              required
            />
          </div>

          {/* Input 2: KEY (Optional for SokRizyBet) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-gray-400 pl-1">
              {isSokRizy ? 'Activation Key (Optional)' : 'Activation Key (Required)'}
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder={isSokRizy ? 'KEY (Optional)' : 'KEY'}
              className="w-full min-h-[46px] px-4 rounded-xl bg-[#06121c] border border-cyan-500/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25 text-white font-mono text-center tracking-wider placeholder:text-cyan-700/80 transition shadow-inner text-sm"
              required={!isSokRizy}
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="text-xs text-rose-400 text-center font-medium bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30 animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Button: Activate */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[46px] mt-1 rounded-xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 hover:brightness-110 active:scale-[0.98] text-black font-black text-sm tracking-wide transition shadow-[0_0_24px_rgba(16,185,129,0.5)] cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </span>
            ) : (
              <>
                <Zap size={16} fill="currentColor" />
                <span>{isSokRizy ? 'Connect SokRizyBet ID' : 'Activate'}</span>
              </>
            )}
          </button>
        </form>

        {/* Telegram Support */}
        <div className="mt-5 flex items-center justify-center">
          <a
            href="https://t.me/Sokpong168"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="w-11 h-11 rounded-full bg-[#05111b] border-2 border-cyan-400 hover:border-emerald-300 flex items-center justify-center text-cyan-400 hover:text-emerald-300 shadow-[0_0_16px_rgba(6,182,212,0.45)] transition-all cursor-pointer group"
            title="Telegram @Sokpong168"
          >
            <Send size={18} className="translate-x-[-1px] translate-y-[1px] group-hover:scale-110 transition-transform" />
          </a>
        </div>

        {/* Footer Admin Switch */}
        {onOpenAdmin && (
          <div className="mt-5 pt-4 border-t border-cyan-900/30 w-full flex items-center justify-center text-xs text-gray-500">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hover:text-cyan-400 underline font-mono cursor-pointer transition"
            >
              Admin Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
