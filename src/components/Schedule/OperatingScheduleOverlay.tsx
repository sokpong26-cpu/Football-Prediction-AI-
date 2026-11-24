import React, { useState, useEffect } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import {
  Clock,
  ShieldCheck,
  Sparkles,
  Lock,
  Unlock,
  Radio,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  ChevronRight,
  Server,
} from 'lucide-react';

interface OperatingScheduleOverlayProps {
  onBypassLogin?: () => void;
}

export const OperatingScheduleOverlay: React.FC<OperatingScheduleOverlayProps> = ({
  onBypassLogin,
}) => {
  const [scheduleInfo, setScheduleInfo] = useState(() => appState.getOperatingScheduleInfo());
  const [nowTime, setNowTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(new Date());
      setScheduleInfo(appState.getOperatingScheduleInfo());
    }, 1000);

    const unsub = appState.subscribe(() => {
      setScheduleInfo(appState.getOperatingScheduleInfo());
    });

    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  const formattedHours = String(nowTime.getHours()).padStart(2, '0');
  const formattedMinutes = String(nowTime.getMinutes()).padStart(2, '0');
  const formattedSeconds = String(nowTime.getSeconds()).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 bg-[#050b07]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0a150e] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col items-center text-center relative overflow-hidden my-auto">
        
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Schedule Icon Header */}
        <div className="relative mb-4">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-xl shadow-amber-950/50">
            <div className="w-full h-full bg-[#0a140d] rounded-3xl flex items-center justify-center text-amber-400">
              <Clock size={34} className="animate-pulse" />
            </div>
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center text-[9px] font-bold text-black">
              !
            </span>
          </span>
        </div>

        {/* Badge Status */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase mb-3">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span>ប្រព័ន្ធបានបិទដំណើរការស្វ័យប្រវត្តិតាមកាលវិភាគ</span>
        </div>

        {/* Main Title */}
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
          ផ្អាកដំណើរការក្រៅម៉ោងកំណត់ (System Closed)
        </h2>

        {/* Schedule Notice Box */}
        <div className="w-full bg-[#102014] border border-[#1e3b26] rounded-2xl p-4 my-3 text-left space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-[#182f1f] pb-2">
            <span className="font-mono text-gray-300">⏰ ម៉ោងដំណើរការប្រចាំថ្ងៃ:</span>
            <span className="text-emerald-400 font-black font-mono">
              07:00 ព្រឹក - 22:00 យប់ (7:00 AM - 10:00 PM)
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono text-gray-300">🕒 ម៉ោងបច្ចុប្បន្ន (Current Time):</span>
            <span className="text-amber-400 font-mono font-bold text-sm">
              {formattedHours}:{formattedMinutes}:{formattedSeconds}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-[#182f1f]">
            <span className="font-mono text-gray-300">⏳ រាប់ថយក្រោយបើកវិញ:</span>
            <span className="text-white font-mono font-black bg-amber-500/20 px-2 py-0.5 rounded text-xs">
              {scheduleInfo.countdownHours} ម៉ោង {scheduleInfo.countdownMinutes} នាទីទៀត
            </span>
          </div>
        </div>

        {/* Explanation message in Khmer */}
        <p className="text-xs text-gray-300 leading-relaxed mb-4 max-w-md">
          ប្រព័ន្ធចាប់សេវា <strong>Apple of Fortune</strong> ត្រូវបានកំណត់ឱ្យដំណើរការស្វ័យប្រវត្តិតែក្នុងចន្លោះម៉ោង <strong>7:00 ព្រឹក ដល់ 10:00 យប់</strong> ប៉ុណ្ណោះ។ ផុតពីម៉ោងកំណត់នេះ ប្រព័ន្ធនឹងបិទដំណើរការជាបន្ទាន់ដើម្បីការពារសុវត្ថិភាព និង Sync AI Algorithm។ សូមអញ្ជើញចូលរួមគេហទំព័រយើងខ្ញុំម្ដងទៀតនៅវេលាម៉ោង <strong>07:00 ព្រឹក</strong> ស្អែកនេះ!
        </p>

        {/* Community / Join Us Section (User asked: ចូលរួមគេហទំព័រយើងខ្ញុំ) */}
        <div className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#0d2214] via-[#102717] to-[#0c1f13] border border-emerald-500/30 mb-4 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400 animate-pulse" />
              <span className="text-sm font-bold text-white">ចូលរួមគេហទំព័រយើងខ្ញុំ (Join Community)</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
              VIP Channel
            </span>
          </div>
          <p className="text-[11px] text-gray-300">
            ចូលរួម Channel ផ្លូវការ Telegram ដើម្បីទទួលព័ត៌មានថ្មីៗ កាលវិភាគបើកដំណើរការ និងជំនួយបច្ចេកទេស 24/7 ពីម្ចាស់ប្រព័ន្ធ <strong>Sokpong</strong>។
          </p>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              <MessageCircle size={14} />
              <span>ចូលរួម Telegram VIP</span>
            </a>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                appState.login('sokpong', 'owner');
                appState.setScheduleForceMode('force_open');
                sound.playCompleteFanfare();
              }}
              className="py-2 px-3 rounded-xl bg-[#14281a] hover:bg-[#1b3824] text-emerald-300 hover:text-white border border-emerald-500/40 font-medium text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Unlock size={13} className="text-emerald-400" />
              <span>Owner & Admin Unlock (No Pass)</span>
            </button>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="w-full flex items-center justify-between text-[11px] text-gray-500 pt-3 border-t border-[#132417] font-mono">
          <span>👑 Owner: <strong className="text-gray-300">By Sokpong</strong></span>
          <span className="text-emerald-400">🇰🇭 Cambodia Server Host</span>
        </div>

      </div>
    </div>
  );
};
