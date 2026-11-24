import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  Clock,
  Sparkles,
  Flame,
  TrendingUp,
  DollarSign,
  Info,
  Calendar,
  Filter,
} from 'lucide-react';
import { appState, INITIAL_HOURLY_RATES } from '../../services/store';

interface HeatmapHourItem {
  hour: string;
  hourNumber: number;
  successRate: number;
  totalSignals: number;
  successfulSignals: number;
  profitScore: 'super' | 'high' | 'normal';
  profitMultiplierAvg: string;
  timeOfDay: 'night' | 'morning' | 'afternoon' | 'evening';
}

export const HourlySuccessHeatmap: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'peak' | 'day'>('all');
  const [selectedHour, setSelectedHour] = useState<HeatmapHourItem | null>(null);

  // Map 24-hour data from store or initial data
  const rawHourly = appState.hourlyRates.length > 0 ? appState.hourlyRates : INITIAL_HOURLY_RATES;

  const heatmapData: HeatmapHourItem[] = rawHourly.map((item, idx) => {
    const hourNum = parseInt(item.hour.split(':')[0], 10);
    const rate = item.successRate;
    
    // Determine profit categorization
    let profitScore: 'super' | 'high' | 'normal' = 'normal';
    let profitMultiplierAvg = '×4.02 - ×11.18';
    if (rate >= 99.8 && (hourNum >= 17 && hourNum <= 22)) {
      profitScore = 'super';
      profitMultiplierAvg = '×69.90 - ×349.48';
    } else if (rate >= 99.6) {
      profitScore = 'high';
      profitMultiplierAvg = '×11.18 - ×69.90';
    }

    let timeOfDay: 'night' | 'morning' | 'afternoon' | 'evening' = 'night';
    if (hourNum >= 6 && hourNum < 12) timeOfDay = 'morning';
    else if (hourNum >= 12 && hourNum < 17) timeOfDay = 'afternoon';
    else if (hourNum >= 17 && hourNum < 23) timeOfDay = 'evening';

    return {
      hour: item.hour,
      hourNumber: hourNum,
      successRate: rate,
      totalSignals: item.totalSignals,
      successfulSignals: item.successfulSignals,
      profitScore,
      profitMultiplierAvg,
      timeOfDay,
    };
  });

  const filteredData = heatmapData.filter((item) => {
    if (activeFilter === 'peak') return item.profitScore === 'super';
    if (activeFilter === 'day') return item.hourNumber >= 7 && item.hourNumber <= 22;
    return true;
  });

  // Color generator for heatmap & Recharts bars
  const getCellColor = (item: HeatmapHourItem) => {
    if (item.profitScore === 'super') return '#10b981'; // Emerald 500 (Peak Golden Window)
    if (item.profitScore === 'high') return '#059669'; // Emerald 600
    if (item.successRate >= 99.4) return '#047857'; // Emerald 700
    return '#15803d'; // Green 700
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as HeatmapHourItem;
      return (
        <div className="bg-[#0b160f] border border-emerald-500/40 p-3 rounded-2xl shadow-2xl text-xs font-mono">
          <div className="flex items-center justify-between gap-3 text-white font-bold mb-1">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-emerald-400" />
              <span>ម៉ោង {data.hour}</span>
            </span>
            <span className="text-emerald-400 font-black">{data.successRate}% Win Rate</span>
          </div>
          <div className="text-[11px] text-gray-300 space-y-0.5">
            <div className="flex justify-between gap-3">
              <span>សរុប Signals:</span>
              <span className="text-white font-bold">{data.totalSignals.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>ជោគជ័យ:</span>
              <span className="text-emerald-400 font-bold">{data.successfulSignals.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-3 pt-1 border-t border-[#1a3321]">
              <span>មេគុណរំពឹងទុក:</span>
              <span className="text-yellow-400 font-bold">{data.profitMultiplierAvg}</span>
            </div>
          </div>
          {data.profitScore === 'super' && (
            <div className="mt-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
              <Flame size={11} className="text-yellow-400" />
              <span>🔥 ម៉ោងកាក់កបបំផុត (Peak Golden Window)</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl space-y-4 select-none">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Heatmap អត្រាជោគជ័យតាមម៉ោង (Signal Success Heatmap by Hour)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Recharts Powered
              </span>
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            ផ្ទៀងផ្ទាត់ និងកំណត់ពេលវេលាដែលចំណេញកាក់កបបំផុតប្រចាំថ្ងៃ (Peak Profitable Time Windows)
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-[#122316] p-1 rounded-xl border border-[#213d28] text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition font-medium ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ២៤ ម៉ោង (All 24h)
          </button>
          <button
            onClick={() => setActiveFilter('peak')}
            className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 ${
              activeFilter === 'peak'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame size={12} className="text-yellow-300" />
            <span>Peak Hours (កំពូល)</span>
          </button>
          <button
            onClick={() => setActiveFilter('day')}
            className={`px-2.5 py-1 rounded-lg transition font-medium ${
              activeFilter === 'day'
                ? 'bg-emerald-600 text-white font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            07:00 - 22:00
          </button>
        </div>
      </div>

      {/* 3 Golden Profitable Windows Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0d2315] to-[#112d1b] border border-emerald-500/40 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-yellow-400 font-bold">
              <Flame size={13} /> Golden Window #1 (យប់)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
              99.9% Win Rate
            </span>
          </div>
          <div className="text-sm font-black text-white font-mono">18:00 - 22:00 (Evening Peak)</div>
          <div className="text-[10px] text-gray-300">
            Signal Volume: <strong>560/h</strong> • Multiplier Avg: <strong className="text-yellow-400">×349.48</strong>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0d2315] to-[#112d1b] border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Sparkles size={13} className="text-yellow-400" /> Golden Window #2 (ថ្ងៃត្រង់)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
              99.8% Win Rate
            </span>
          </div>
          <div className="text-sm font-black text-white font-mono">11:00 - 13:00 (Lunch Spike)</div>
          <div className="text-[10px] text-gray-300">
            Signal Volume: <strong>420/h</strong> • Multiplier Avg: <strong className="text-yellow-400">×69.90</strong>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0d2315] to-[#112d1b] border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
              <TrendingUp size={13} /> Golden Window #3 (ព្រឹក)
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-bold">
              99.8% Win Rate
            </span>
          </div>
          <div className="text-sm font-black text-white font-mono">07:00 - 09:00 (Morning Open)</div>
          <div className="text-[10px] text-gray-300">
            Signal Volume: <strong>340/h</strong> • Multiplier Avg: <strong className="text-yellow-400">×11.18</strong>
          </div>
        </div>
      </div>

      {/* Recharts Bar Chart Visualization */}
      <div className="w-full h-56 pt-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#162c1c" />
            <XAxis
              dataKey="hour"
              stroke="#6b7280"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
            />
            <YAxis
              domain={[98.5, 100.2]}
              stroke="#6b7280"
              fontSize={10}
              fontFamily="monospace"
              tickLine={false}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={99.5} stroke="#10b981" strokeDasharray="3 3" />
            <Bar dataKey="successRate" radius={[4, 4, 0, 0]}>
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCellColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 24-Hour Visual Heatmap Cells Grid */}
      <div className="space-y-2 pt-1 border-t border-[#182e1e]">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>ក្រឡា Heatmap ប្រចាំម៉ោងនីមួយៗ (ចុចដើម្បីមើលព័ត៌មានលម្អិត):</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> 99.8 - 100% (Peak)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-700" /> 99.5 - 99.7%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-green-800" /> &lt; 99.5%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
          {heatmapData.map((item) => {
            const isSelected = selectedHour?.hour === item.hour;
            const isSuper = item.profitScore === 'super';
            return (
              <button
                key={item.hour}
                type="button"
                onClick={() => setSelectedHour(item)}
                className={`p-2 rounded-xl transition-all flex flex-col items-center justify-center border font-mono cursor-pointer relative ${
                  isSelected
                    ? 'ring-2 ring-yellow-400 bg-emerald-600 border-white scale-105 z-10'
                    : isSuper
                    ? 'bg-[#10381e] hover:bg-[#164726] border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                    : 'bg-[#0f2315] hover:bg-[#142e1c] border-[#1d3d25]'
                }`}
              >
                {isSuper && (
                  <span className="absolute -top-1 -right-1 text-[9px]">🔥</span>
                )}
                <span className="text-[10px] text-gray-400 font-bold">{item.hour}</span>
                <span className={`text-[11px] font-black ${isSuper ? 'text-yellow-300' : 'text-emerald-300'}`}>
                  {item.successRate}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Hour Details Bar */}
        {selectedHour && (
          <div className="p-3 rounded-2xl bg-[#112316] border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-emerald-400" />
              <span className="text-white font-bold">ម៉ោង {selectedHour.hour}:</span>
              <span className="text-emerald-400 font-black font-mono">{selectedHour.successRate}% Win Rate</span>
              <span className="text-gray-400">• {selectedHour.totalSignals} Signals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-300 font-mono">មេគុណមធ្យម: <strong className="text-yellow-400">{selectedHour.profitMultiplierAvg}</strong></span>
              <button
                onClick={() => setSelectedHour(null)}
                className="px-2 py-0.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[10px]"
              >
                បិទ
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
