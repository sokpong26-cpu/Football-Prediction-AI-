import React, { useState, useEffect } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import {
  Wrench,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Cpu,
  Server,
  ShieldCheck,
  RefreshCw,
  Play,
  Lock,
  Unlock,
} from 'lucide-react';

interface AutoUpdateMaintenanceOverlayProps {
  onBypassLogin?: () => void;
}

export const AutoUpdateMaintenanceOverlay: React.FC<AutoUpdateMaintenanceOverlayProps> = ({
  onBypassLogin,
}) => {
  const [updateInfo, setUpdateInfo] = useState(() => appState.getAutoUpdateWindowInfo());
  const [currentProgress, setCurrentProgress] = useState(68);
  const [activeStepIndex, setActiveStepIndex] = useState(2);
  const [nowTime, setNowTime] = useState(new Date());

  const updateSteps = [
    { title: 'Neural Core Cache Clean & V8 Memory Heap Optimization', status: 'done', detail: 'Cleared 480MB stale buffers' },
    { title: 'AMD EPYC 9654 & Google TPU v5e Hardware Diagnostics', status: 'done', detail: '64-Core stress test: 100% Passed' },
    { title: '1xBet & Melbet Provably Fair Seed Synchronizer', status: 'active', detail: 'Syncing live seeds & algorithms...' },
    { title: 'Cloudflare Edge Firewall & Virus Shield Refresh', status: 'pending', detail: '0 Malware, 0 Bug Verified' },
    { title: 'Cambodia Host Edge Latency Recalibration (1.4ms)', status: 'pending', detail: 'Ping optimization: Phnom Penh Edge' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date());
      setUpdateInfo(appState.getAutoUpdateWindowInfo());
      // Animate progress smoothly
      setCurrentProgress((p) => {
        if (p >= 92) return 92;
        return p + 1;
      });
    }, 1000);

    const unsub = appState.subscribe(() => {
      setUpdateInfo(appState.getAutoUpdateWindowInfo());
    });

    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  const handleEarlyResume = () => {
    sound.playClick();
    appState.triggerEarlyResume();
  };

  const formattedHours = String(nowTime.getHours()).padStart(2, '0');
  const formattedMinutes = String(nowTime.getMinutes()).padStart(2, '0');
  const formattedSeconds = String(nowTime.getSeconds()).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 bg-[#040a06]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0a150e] border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.2)] flex flex-col items-center text-center relative overflow-hidden my-auto">
        
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="relative mb-3">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-emerald-600 to-green-400 p-0.5 shadow-xl shadow-emerald-950/60">
            <div className="w-full h-full bg-[#08120a] rounded-3xl flex items-center justify-center text-emerald-400">
              <RefreshCw size={36} className="animate-spin text-emerald-400" />
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
          </span>
        </div>

        {/* Badge status */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ដំណើរការ Auto Update ស្វ័យប្រវត្តិ (3:00 PM - 5:00 PM)</span>
        </div>

        {/* Main Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
          ប្រព័ន្ធកំពុងអាប់ដេតស្វ័យប្រវត្តិ (Auto-Updating)
        </h2>

        <p className="text-xs text-gray-300 max-w-md leading-relaxed mb-4">
          ម៉ាស៊ីនបម្រើកំពុងធ្វើការ <strong>Auto Update & Reboot សម្រាកបច្ចេកទេស</strong> ដើម្បីឲ្យដំណើរការកាន់តែរលូន គ្មានបញ្ហា និងលឿនបំផុត (3:00 រសៀល ដល់ 5:00 ល្ងាច)។
        </p>

        {/* Live Progress Bar */}
        <div className="w-full bg-[#0e1d12] border border-[#1b3824] rounded-2xl p-4 mb-4 text-left space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Zap size={14} className="text-yellow-400 animate-pulse" />
              <span>វឌ្ឍនភាពអាប់ដេត (Update Progress):</span>
            </span>
            <span className="text-emerald-400 font-mono font-black text-sm">{currentProgress}%</span>
          </div>

          <div className="w-full bg-[#14281a] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 via-green-400 to-cyan-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 font-mono">
            <span>ម៉ោងបច្ចុប្បន្ន: <strong className="text-white">{formattedHours}:{formattedMinutes}:{formattedSeconds}</strong></span>
            <span>បញ្ចប់នៅម៉ោង: <strong className="text-yellow-400">05:00 ល្ងាច (5:00 PM)</strong></span>
          </div>
        </div>

        {/* Step-by-Step Diagnostic Check List */}
        <div className="w-full bg-[#0a140d] border border-[#162c1d] rounded-2xl p-3 mb-4 text-left space-y-2">
          <div className="text-[11px] font-mono text-gray-400 flex items-center justify-between">
            <span>ដំណាក់កាលធ្វើបច្ចុប្បន្នភាព (Update Steps):</span>
            <span className="text-emerald-400 font-bold">Step 3 of 5</span>
          </div>
          <div className="space-y-1.5">
            {updateSteps.map((step, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-[#0e1c12] border border-[#1a3320]">
                <div className="flex items-center gap-2">
                  {step.status === 'done' ? (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  ) : step.status === 'active' ? (
                    <RefreshCw size={14} className="text-yellow-400 animate-spin shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-gray-600 shrink-0" />
                  )}
                  <span className={step.status === 'active' ? 'text-white font-bold' : 'text-gray-300'}>
                    {step.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-500 hidden sm:inline">{step.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Early Resume & VIP Bypass Action Bar (Matches user request: ចប់ម៉ោង 5:00 អាចដំណើរការឡើងវិញមុន) */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-2 mb-3">
          <button
            onClick={handleEarlyResume}
            className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            title="បញ្ចប់ការ Update និងបើកដំណើរការឡើងវិញមុនម៉ោង 5:00"
          >
            <Play size={14} fill="currentColor" />
            <span>បើកដំណើរការឡើងវិញមុនម៉ោង (Resume Early)</span>
          </button>

          {onBypassLogin && (
            <button
              onClick={onBypassLogin}
              className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#142618] hover:bg-[#1a3320] text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Unlock size={14} />
              <span>VIP / Owner Bypass</span>
            </button>
          )}
        </div>

        {/* Footer Meta */}
        <div className="w-full flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-[#132417] font-mono">
          <span>Cambodia Host: 103.216.51.188 🇰🇭</span>
          <span>Owner: <strong className="text-gray-300">By Sokpong</strong></span>
        </div>

      </div>
    </div>
  );
};
