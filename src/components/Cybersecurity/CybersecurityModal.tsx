import React, { useState, useEffect } from 'react';
import { cybersecurity, CybersecurityState } from '../../services/cybersecurity';
import { sound } from '../../services/sound';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  RefreshCw,
  CheckCircle2,
  X,
  Cpu,
  Flame,
  Gauge,
  Activity,
  BugOff,
} from 'lucide-react';

interface CybersecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CybersecurityModal: React.FC<CybersecurityModalProps> = ({ isOpen, onClose }) => {
  const [secState, setSecState] = useState<CybersecurityState>(cybersecurity.getState());
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const unsub = cybersecurity.subscribe(() => {
      setSecState(cybersecurity.getState());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleScanAndBoost = async () => {
    sound.playClick();
    setIsScanning(true);
    await cybersecurity.runDeepCleanAndOptimize();
    sound.playCompleteFanfare();
    setIsScanning(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0c1810] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden text-white"
      >
        {/* Top ambient glow */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-emerald-900/50 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 p-0.5 shadow-lg shadow-emerald-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a150d] rounded-2xl flex items-center justify-center">
                <ShieldCheck size={26} className="text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Cybersecurity System Guard
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-black font-mono">
                  {secState.version}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                ប្រព័ន្ធការពារមេរោគ ស្កេនសុវត្ថិភាព & បង្កើនល្បឿន Server ស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#142618] hover:bg-[#1a3321] text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Main Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 relative z-10">
          <div className="p-3 rounded-2xl bg-[#112215] border border-emerald-500/20 flex flex-col items-center text-center">
            <div className="text-[10px] text-gray-400 font-semibold mb-1">ស្ថានភាពសុវត្ថិភាព</div>
            <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>សុវត្ថិភាព 100%</span>
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">គ្មានមេរោគ</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#112215] border border-emerald-500/20 flex flex-col items-center text-center">
            <div className="text-[10px] text-gray-400 font-semibold mb-1">ល្បឿន System</div>
            <div className="text-xs font-black text-yellow-400 flex items-center gap-1">
              <Zap size={13} />
              <span>{secState.speedIndex}% Turbo</span>
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">រលូនឥតទាក់</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#112215] border border-emerald-500/20 flex flex-col items-center text-center">
            <div className="text-[10px] text-gray-400 font-semibold mb-1">Latency / Ping</div>
            <div className="text-xs font-black text-emerald-400 flex items-center gap-1">
              <Activity size={13} />
              <span>{secState.latencyMs}ms</span>
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">Ultra Fast</div>
          </div>

          <div className="p-3 rounded-2xl bg-[#112215] border border-emerald-500/20 flex flex-col items-center text-center">
            <div className="text-[10px] text-gray-400 font-semibold mb-1">មេរោគបានទប់ស្កាត់</div>
            <div className="text-xs font-black text-cyan-400 flex items-center gap-1">
              <BugOff size={13} />
              <span>{secState.threatsBlocked} Threats</span>
            </div>
            <div className="text-[9px] text-gray-500 mt-0.5">Blocked</div>
          </div>
        </div>

        {/* Security Modules Detailed List */}
        <div className="space-y-2 relative z-10 mb-4">
          <div className="p-3 rounded-xl bg-[#0f1f13] border border-[#1e3a24] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">ប្រព័ន្ធការពារមេរោគ (Anti-Malware Shield)</div>
                <div className="text-[10px] text-gray-400">ស្កេន និងទប់ស្កាត់ Script បំពានមិនឱ្យជ្រៀតចូលប្រព័ន្ធ</div>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0f1f13] border border-[#1e3a24] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-400">
                <Flame size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">បង្កើនល្បឿន 60 FPS (Zero Lag Accelerator)</div>
                <div className="text-[10px] text-gray-400">កម្ចាត់ការប្រអាក់រអួល ដំណើរការសេវាទាន់ចិត្ត ឥតគាំង</div>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              OPTIMIZED
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0f1f13] border border-[#1e3a24] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Lock size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">កូដនីយកម្ម SSL 256-bit (Bank-Grade Security)</div>
                <div className="text-[10px] text-gray-400">ការពារទិន្នន័យទូទាត់ប្រាក់ KHQR និងលេខកូដសម្ងាត់ Key VIP</div>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              ENCRYPTED
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0f1f13] border border-[#1e3a24] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Cloudflare Enterprise Edge & DDoS Guard</div>
                <div className="text-[10px] text-gray-400">ការពារការវាយប្រហារ DDoS និងការពារសុវត្ថិភាពគេហទំព័រ ២៤/៧</div>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              PROTECTED
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0b1c11] border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Cpu size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Cambodia Host 🇰🇭 & AMD EPYC CPU Hardware Shield</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">103.216.51.188</span>
                </div>
                <div className="text-[10px] text-gray-400">AMD EPYC 9654 64-Cores • Latency 2ms • Zero Viruses & Zero Bugs</div>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              HARDWARE OK
            </span>
          </div>
        </div>

        {/* Action Button: Deep Clean & Speed Boost */}
        <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            disabled={isScanning}
            onClick={handleScanAndBoost}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/80 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={15} className={isScanning ? 'animate-spin' : ''} />
            <span>
              {isScanning
                ? 'កំពុងស្កេនមេរោគ & បង្កើនល្បឿន...'
                : '⚡ ស្កេនសម្អាតមេរោគ & បង្កើនល្បឿន 10x ភ្លាមៗ (Boost Now)'}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-[#142618] hover:bg-[#1a3321] text-gray-300 hover:text-white text-xs font-bold transition border border-[#213d27] cursor-pointer"
          >
            បិទ
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-3 pt-2 border-t border-emerald-950/60 text-center text-[10px] text-gray-400 font-mono">
          Owned & Engineered by Sokpong • Cybersecurity Engine v2.0.1 Cloudflare Edge
        </div>
      </div>
    </div>
  );
};
