import React, { useState, useEffect } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import { Clock, ShieldCheck, Zap, Info } from 'lucide-react';

export const OperatingHoursBanner: React.FC = () => {
  const [scheduleInfo, setScheduleInfo] = useState(() => appState.getOperatingScheduleInfo());

  useEffect(() => {
    const timer = setInterval(() => {
      setScheduleInfo(appState.getOperatingScheduleInfo());
    }, 5000);

    const unsub = appState.subscribe(() => {
      setScheduleInfo(appState.getOperatingScheduleInfo());
    });

    return () => {
      clearInterval(timer);
      unsub();
    };
  }, []);

  if (!scheduleInfo.scheduleEnabled) {
    return null;
  }

  return (
    <div className="w-full bg-[#0a150e] border-b border-[#142618] px-3 py-1.5 text-xs text-gray-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>កាលវិភាគស្វ័យប្រវត្តិ:</span>
          </span>
          <span className="text-[11px] text-gray-300 font-mono">
            07:00 ព្រឹក - 22:00 យប់ (7:00 AM - 10:00 PM)
          </span>
          <span className="hidden sm:inline text-gray-600">•</span>
          <span className="hidden sm:inline text-[11px] text-gray-400 font-mono">
            {scheduleInfo.isOpen ? (
              <span className="text-emerald-300 font-semibold">
                កំពុងដំណើរការ (នៅសល់ {scheduleInfo.countdownHours}h {scheduleInfo.countdownMinutes}m ទៀត)
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">
                បិទសម្រាកពេលយប់ (បើកវិញម៉ោង 7:00 ព្រឹក)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="text-gray-400 hidden md:inline">
            ម៉ោងបច្ចុប្បន្ន: <strong className="text-white">{scheduleInfo.currentTime}</strong>
          </span>
          <span className="text-cyan-300 font-bold hidden sm:inline">
            🇰🇭 Cambodia Edge
          </span>
        </div>
      </div>
    </div>
  );
};
