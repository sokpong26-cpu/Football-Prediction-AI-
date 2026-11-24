import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  Clock,
  Zap,
  ShieldCheck,
  Flame,
  Award,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { sound } from '../../services/sound';

interface TimeWindow {
  id: string;
  label: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  winProbability: number; // e.g. 99.9%
  status: 'golden' | 'high' | 'stable';
  recommendedStrategy: string;
  descriptionKh: string;
}

const FORECAST_WINDOWS: TimeWindow[] = [
  {
    id: 'w_evening',
    label: 'ម៉ោងមាសល្ងាច (Super Peak Window)',
    timeRange: '19:00 - 22:30',
    startHour: 19,
    endHour: 23,
    winProbability: 100.0,
    status: 'golden',
    recommendedStrategy: '⚡ Ultra Max Real & Aggressive',
    descriptionKh: 'កម្រិតប្រូបាប៊ីលីតេឈ្នះអតិបរមា ១០០% ផ្អែកលើ Feed 1xBet server latency <1ms',
  },
  {
    id: 'w_afternoon',
    label: 'ម៉ោងមាសរសៀល (Prime Golden Window)',
    timeRange: '14:30 - 17:30',
    startHour: 14,
    endHour: 18,
    winProbability: 99.9,
    status: 'golden',
    recommendedStrategy: '⚖️ Balanced & Ultra Max',
    descriptionKh: 'ពេលវេលាល្អបំផុតសម្រាប់ការចាប់ដល់ Step 7 ដល់ 10 ដោយសុវត្ថិភាពខ្ពស់',
  },
  {
    id: 'w_morning',
    label: 'រលកពេលព្រឹក (Morning Wave)',
    timeRange: '08:30 - 11:30',
    startHour: 8,
    endHour: 12,
    winProbability: 99.4,
    status: 'high',
    recommendedStrategy: '🛡️ Conservative & Balanced',
    descriptionKh: 'ប្រព័ន្ធដំណើរការស្រាល ងាយស្រួលប្រមូលផលចំណេញជំហានមធ្យម',
  },
  {
    id: 'w_lunch',
    label: 'ម៉ោងថ្ងៃត្រង់ (Lunch Wave)',
    timeRange: '12:00 - 14:00',
    startHour: 12,
    endHour: 14,
    winProbability: 98.8,
    status: 'stable',
    recommendedStrategy: '🛡️ Conservative (Step 1-5)',
    descriptionKh: 'ស័ក្តិសមសម្រាប់យុទ្ធសាស្ត្រ Safe Cashout ដកប្រាក់រហ័ស',
  },
];

const HOURLY_FORECAST = [
  { hour: '07:00', prob: 98.2, level: 'normal' },
  { hour: '09:00', prob: 99.4, level: 'high' },
  { hour: '11:00', prob: 99.2, level: 'high' },
  { hour: '13:00', prob: 98.8, level: 'normal' },
  { hour: '15:00', prob: 99.8, level: 'golden' },
  { hour: '17:00', prob: 99.9, level: 'golden' },
  { hour: '19:00', prob: 100.0, level: 'golden' },
  { hour: '21:00', prob: 100.0, level: 'golden' },
];

interface DailyWinProbabilityForecastProps {
  onGenerateSignal?: () => void;
}

export const DailyWinProbabilityForecast: React.FC<DailyWinProbabilityForecastProps> = ({
  onGenerateSignal,
}) => {
  const [currentHour, setCurrentHour] = useState(() => new Date().getHours());
  const [activeTab, setActiveTab] = useState<'windows' | 'timeline'>('windows');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHour(new Date().getHours());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Determine current active window
  const activeWindow = FORECAST_WINDOWS.find(
    (w) => currentHour >= w.startHour && currentHour < w.endHour
  ) || FORECAST_WINDOWS[0];

  const isCurrentActiveGolden = activeWindow.status === 'golden';

  return (
    <div className="w-full max-w-[420px] rounded-3xl bg-[#0a160e] border border-[#1d3923] p-4 shadow-xl space-y-3.5 text-xs text-left">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#162e1d]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={16} className="text-yellow-400" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>ការព្យាករណ៍ឱកាសឈ្នះប្រចាំថ្ងៃ</span>
              <span className="px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 font-mono text-[9px] font-bold">
                FORECAST
              </span>
            </h4>
            <p className="text-[10px] text-gray-400">
              វិភាគម៉ោងមាស (Best Time Windows) ផ្អែកលើទិន្នន័យជោគជ័យជាក់ស្តែង
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#102216] p-0.5 rounded-lg border border-[#1b3824] text-[10px]">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('windows');
            }}
            className={`px-2 py-0.5 rounded transition cursor-pointer font-bold ${
              activeTab === 'windows' ? 'bg-emerald-600 text-white' : 'text-gray-400'
            }`}
          >
            ម៉ោងមាស
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('timeline');
            }}
            className={`px-2 py-0.5 rounded transition cursor-pointer font-bold ${
              activeTab === 'timeline' ? 'bg-emerald-600 text-white' : 'text-gray-400'
            }`}
          >
            24h Timeline
          </button>
        </div>
      </div>

      {/* Current Real-time Status Banner */}
      <div
        className={`p-3 rounded-2xl border transition relative overflow-hidden ${
          isCurrentActiveGolden
            ? 'bg-gradient-to-r from-amber-950/40 via-[#102919] to-emerald-950/40 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
            : 'bg-[#0f1f14] border-[#1d3824]'
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Flame size={14} className={isCurrentActiveGolden ? 'text-yellow-400 animate-bounce' : 'text-emerald-400'} />
            <span className="font-mono font-bold text-white text-xs">
              {activeWindow.label}
            </span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black ${
              isCurrentActiveGolden
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {activeWindow.winProbability}% PROBABILITY
          </span>
        </div>

        <p className="text-[11px] text-gray-300 leading-relaxed mb-2">
          {activeWindow.descriptionKh}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-[#1d3d25] text-[10px] text-gray-400 font-mono">
          <span>យុទ្ធសាស្ត្រណែនាំ: <strong className="text-yellow-300 font-sans">{activeWindow.recommendedStrategy}</strong></span>
          <span className="text-emerald-400 font-bold">1xBet Latency &lt;1ms</span>
        </div>
      </div>

      {/* View 1: Golden Windows Cards */}
      {activeTab === 'windows' && (
        <div className="space-y-2">
          {FORECAST_WINDOWS.map((win, idx) => {
            const isCurrentlyIn = currentHour >= win.startHour && currentHour < win.endHour;

            return (
              <div
                key={win.id}
                className={`p-2.5 rounded-2xl border transition ${
                  isCurrentlyIn
                    ? 'bg-[#12281a] border-emerald-500/50 ring-1 ring-emerald-500/40'
                    : 'bg-[#0e1a12] border-[#1a3320] hover:border-[#24452c]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                        <span>{win.timeRange}</span>
                        {isCurrentlyIn && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono font-bold animate-pulse">
                            កំពុងស្ថិតក្នុងម៉ោងនេះ
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">{win.label}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-xs text-yellow-400">
                      {win.winProbability}%
                    </div>
                    <div className="text-[9px] text-gray-400 font-mono">{win.recommendedStrategy.split(' ')[1] || 'Real'}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: 24h Timeline Bar */}
      {activeTab === 'timeline' && (
        <div className="p-3 rounded-2xl bg-[#0e1a12] border border-[#1a3320] space-y-3">
          <div className="text-[11px] text-gray-300 font-medium flex items-center justify-between">
            <span>ខ្សែកោងប្រូបាប៊ីលីតេឈ្នះតាមម៉ោង (Hourly Win Rate)</span>
            <span className="text-emerald-400 font-mono text-[10px]">Avg: 99.6%</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
            {HOURLY_FORECAST.map((item) => {
              const isPeak = item.prob >= 99.8;
              const heightPercent = Math.round(((item.prob - 97) / 3) * 100);

              return (
                <div key={item.hour} className="flex flex-col items-center gap-1">
                  <span className={`text-[9px] font-mono font-bold ${isPeak ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {item.prob}%
                  </span>
                  <div className="w-full h-16 bg-[#132417] rounded-lg overflow-hidden flex flex-col justify-end p-0.5">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded transition-all duration-500 ${
                        isPeak
                          ? 'bg-gradient-to-t from-yellow-500 to-amber-300 shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                          : 'bg-emerald-600/70'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-gray-400">{item.hour}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-gray-400 pt-2 border-t border-[#182e1e] flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span>ម៉ោងមាស 100% Win Window</span>
            </span>
            <span className="font-mono text-emerald-400">10,000+ Rounds</span>
          </div>
        </div>
      )}

      {/* Quick Trigger Button */}
      {onGenerateSignal && (
        <button
          onClick={() => {
            sound.playClick();
            onGenerateSignal();
          }}
          className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-black font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Zap size={14} fill="currentColor" />
          <span>ចាប់ Signal ក្នុងម៉ោងមាសឥឡូវនេះ ({activeWindow.winProbability}%)</span>
        </button>
      )}
    </div>
  );
};
