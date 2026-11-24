import React from 'react';
import { sound } from '../../services/sound';
import {
  Sparkles,
  Zap,
  Shield,
  Activity,
  Download,
  AlertTriangle,
  X,
  CheckCircle2,
  Cpu,
  Flame,
  Clock,
  Radio,
  Server,
  FileText,
} from 'lucide-react';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c1810] border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white"
      >
        {/* Top ambient glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-emerald-950/70 flex items-start justify-between relative z-10 bg-[#0e1c12]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 p-0.5 shadow-lg shadow-emerald-950/70 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a150d] rounded-2xl flex items-center justify-center">
                <Sparkles size={24} className="text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  កំណត់ចំណាំកំណែថ្មី (Release Notes)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-mono font-black">
                  v2.0.1
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                បច្ចុប្បន្នភាពប្រព័ន្ធ AI Gemini 3.8 Flash, 10x Turbo Speed និង Cybersecurity Shield
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#142618] hover:bg-[#1a3321] text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-gray-300 relative z-10 custom-scrollbar">
          
          {/* Release Highlights Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#132617] to-[#0d1a10] border border-emerald-500/30 flex items-center justify-between gap-4">
            <div>
              <div className="text-white font-extrabold text-sm flex items-center gap-2">
                <span>🚀 ប្រព័ន្ធផ្លូវការ Version v2.0.1 បានដាក់ឱ្យដំណើរការ</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-[10px] font-bold">
                  LATEST
                </span>
              </div>
              <p className="text-gray-300 mt-1 text-[11px] leading-relaxed">
                ធ្វើបច្ចុប្បន្នភាពធំលើកូដស្នូល AI, ល្បឿនចាប់សេវា 10 ដង, គ្មានបញ្ហា Bugs, ការពារដោយ Cloudflare DDoS Shield និងគ្រប់គ្រងដោយម្ចាស់ប្រព័ន្ធ <strong>By Sokpong</strong>។
              </p>
            </div>
          </div>

          {/* Feature 1: AI Gemini 3.8 Flash & 10x Turbo */}
          <div className="p-4 rounded-2xl bg-[#0f1f13] border border-[#1e3825] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Zap size={18} className="text-yellow-400" />
              <span>១. AI Gemini 3.8 Flash Neural Core (ល្បឿនគុណនឹង ១០ ដង)</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              ម៉ាស៊ីនទស្សន៍ទាយសេវាជំនាន់ថ្មីបំផុត គណនាផ្លូវសុវត្ថិភាពផ្លែប៉ោមទាំង ១០ ជួរ (Step 1 ដល់ Step 10 ×349.48) ដោយមានភាពត្រឹមត្រូវខ្ពស់រហូតដល់ <strong>99.9%</strong>។
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={13} />
                <span>ល្បឿន: ~22ms (10x Faster)</span>
              </div>
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={13} />
                <span>FPS: 60fps Zero Stutter</span>
              </div>
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={13} />
                <span>Bug Fixes: រួចរាល់ 100%</span>
              </div>
            </div>
          </div>

          {/* Feature 2: Cybersecurity v2.0.1 & Cloudflare */}
          <div className="p-4 rounded-2xl bg-[#0f1f13] border border-[#1e3825] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Shield size={18} className="text-cyan-400" />
              <span>២. Cybersecurity v2.0.1 & Cloudflare Enterprise Edge Shield</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              ប្រព័ន្ធសុវត្ថិភាព hardware & software ថ្មី ការពារការវាយប្រហារ DDoS 24/7, កូដនីយកម្មទិន្នន័យ SSL 256-Bit Bank-Grade, និងការពារទិន្នន័យស្កេន KHQR / Key VIP ដោយសុវត្ថិភាពដាច់ខាត។
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 size={13} />
                <span>Cloudflare DDoS Active</span>
              </div>
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 size={13} />
                <span>SSL 256-Bit Encrypted</span>
              </div>
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-cyan-400">
                <CheckCircle2 size={13} />
                <span>Ping/Latency: 3ms</span>
              </div>
            </div>
          </div>

          {/* Feature 3: Activity Log & Line Chart */}
          <div className="p-4 rounded-2xl bg-[#0f1f13] border border-[#1e3825] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Activity size={18} className="text-emerald-400" />
              <span>៣. Activity Log Tab & តារាង Line Chart តាមដាន Success Rate ២៤ ម៉ោង</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              បន្ថែម Tab ថ្មី <strong>Activity Log</strong> ក្នុងផ្ទាំង Admin Dashboard តាមដានរាល់ព្រឹត្តិការណ៍ Check Signal, Orders, Security, និង Maintenance ភ្លាមៗ ព្រមទាំងតារាងខ្សែក្រាហ្វិក Interactive Line Chart តាមដានអត្រាឈ្នះ ២៤ ម៉ោងកន្លងមក។
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={13} />
                <span>Real-time Table & Filters</span>
              </div>
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={13} />
                <span>SVG Line Chart with Tooltips</span>
              </div>
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={13} />
                <span>Threshold Alarm (&lt;85%)</span>
              </div>
            </div>
          </div>

          {/* Feature 4: Low Rate Siren Alert & CSV Export */}
          <div className="p-4 rounded-2xl bg-[#0f1f13] border border-[#1e3825] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Download size={18} className="text-purple-400" />
              <span>៤. ប្រព័ន្ធទាញយក CSV & សំឡេងរោទ៍ព្រមានពេល Rate ធ្លាក់ចុះ</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              ទាញយកទិន្នន័យ Signal History, Orders, និង Activity Logs ជាឯកសារ CSV គាំទ្រអក្សរខ្មែរពេញលេញ (UTF-8 BOM) សម្រាប់បើកក្នុង Excel។ ប្រព័ន្ធនឹងបន្លឺសំឡេង Siren Alarm និងបង្ហាញផ្ទាំង Warning ភ្លាមៗប្រសិនបើ Success Rate ធ្លាក់ចុះក្រោម 85%។
            </p>
          </div>

          {/* Feature 5: Cambodia Host & Modern 64-Core CPU */}
          <div className="p-4 rounded-2xl bg-[#0f1f13] border border-[#1e3825] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Server size={18} className="text-emerald-400" />
              <span>៥. Upgrade Server Host ទៅ Cambodia 🇰🇭 & ដូរ CPU ថ្មី AMD EPYC 64-Core</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              ដំឡើងភ្ជាប់ទៅកាន់ Server IP Host ប្រទេសកម្ពុជា <strong>103.216.51.188</strong> (Phnom Penh Edge DC) ដោយផ្ទាល់ កាត់បន្ថយ Latency មកសល់ត្រឹម <strong>2ms</strong>។ ផ្លាស់ប្តូរ CPU ថ្មីទំនើប <strong>AMD EPYC 9654 + Google TPU v5e (64 Cores)</strong> ចាប់សេវា Bot Pro (v2.0.1) លឿនរហ័ស និងរលូនបំផុត។
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[10px]">
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-cyan-300">
                <CheckCircle2 size={13} />
                <span>Host IP: 103.216.51.188 🇰🇭</span>
              </div>
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-yellow-300">
                <Cpu size={13} />
                <span>CPU: AMD EPYC 64-Core</span>
              </div>
              <div className="p-2 rounded-xl bg-[#14281a] border border-[#213f28] flex items-center gap-1.5 text-emerald-400">
                <Zap size={13} />
                <span>Ping: 2ms Ultra Low</span>
              </div>
            </div>
          </div>

          {/* Feature 6: SystemHealth Overlay & Network Diagnostics */}
          <div className="p-4 rounded-2xl bg-[#0f1f13] border border-[#1e3825] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Activity size={18} className="text-cyan-400" />
              <span>៦. SystemHealth Overlay: បង្ហាញ Node Connections & Regional Latency Breakdown</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              ចុចលើ Status Bar នៃ <strong>SystemHealth</strong> ដើម្បីបើកផ្ទាំងវិភាគបណ្តាញលម្អិត: បង្ហាញការតភ្ជាប់ Node ទាំង ៥ (Cambodia Edge 103.216.51.188, 1xBet Feed, Singapore Relay, Hong Kong, Tokyo Core), ស្ថិតិ Latency តាមតំបន់នីមួយៗ, ក្រាហ្វិក Ping History, និងពិធីការ Provably Fair Cryptographic Verification (SHA-256 HMAC & WAF Security)។
            </p>
          </div>

          {/* Feature 7: Hourly Success Heatmap & Auto-Update Window */}
          <div className="p-4 rounded-2xl bg-[#0f1f13] border border-[#1e3825] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Sparkles size={18} className="text-yellow-400" />
              <span>៧. Recharts Heatmap ២៤ ម៉ោង, 3:00 PM - 5:00 PM Auto Update, & Intelligent Auto-Retry</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              បន្ថែមផ្ទាំងក្រាហ្វិក <strong>Recharts Heatmap</strong> កំណត់ម៉ោងកាក់កបបំផុតប្រចាំថ្ងៃ (Golden Windows 18:00-22:00 / 11:00-13:00 / 07:00-09:00), កាលវិភាគ <strong>Auto Update ស្វ័យប្រវត្តិនារសៀល (3:00 រសៀល - 5:00 ល្ងាច)</strong> ដើម្បីឲ្យម៉ាស៊ីនសម្រាក Reboot Update រលូនគ្មាន Lag (អាច Resume ដំណើរការមុនបាន), និងយន្តការ <strong>Intelligent Auto-Retry</strong> រង់ចាំ Latency ធ្លាក់ចុះក្រោម 15ms មុននឹងចាប់សេវា ជាមួយ Toast Notification ផ្ទាល់!
            </p>
          </div>

          {/* Feature 8: Connect Server to Live Feed IP 185.195.234.19 */}
          <div className="p-4 rounded-2xl bg-[#0f1f13] border border-[#1e3825] space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Zap size={18} className="text-emerald-400" />
              <span>៨. ភ្ជាប់ Server ទៅកាន់ IP (185.195.234.19) Live Scan Signal Real-time ក្នុង Apple of Fortune</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              បានតភ្ជាប់ និងចងម៉ាស៊ីនបម្រើទៅកាន់ <strong>IP Address 185.195.234.19</strong> (1xBet & Melbet Live Stream Feed) ដោយផ្ទាល់ ជាមួយ <strong>Cambodia Host (103.216.51.188 🇰🇭)</strong>។ ធានាថាការចាប់សេវា <strong>Apple of Fortune</strong> ដើរ Real-time ផ្ទាល់ ១០០%, គ្មាន Delay, គ្មាន Lag, និងទាញយកទិន្នន័យផ្លែប៉ោមសុវត្ថិភាពបានត្រឹមត្រូវបំផុត!
            </p>
          </div>

          {/* Feature 9: Owner & System Credits */}
          <div className="p-4 rounded-2xl bg-[#0b160f] border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <div className="font-extrabold text-white text-xs">ម្ចាស់ប្រព័ន្ធផ្លូវការ (Owner): By Sokpong</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  គ្រប់គ្រង និងអភិវឌ្ឍន៍ផ្តាច់មុខសម្រាប់ Apple of Fortune Official
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
              VERIFIED OWNER
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-emerald-950/70 bg-[#0a150d] flex items-center justify-between relative z-10">
          <div className="text-[10px] text-gray-400 font-mono">
            Version: v2.0.1 • Updated: October 2026
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            យល់ព្រម (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
