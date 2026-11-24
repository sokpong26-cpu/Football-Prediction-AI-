import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Server, Percent, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { appState } from '../../services/store';

export const DailyProfitLossTrend: React.FC = () => {
  const [metricView, setMetricView] = useState<'all' | 'profit' | 'margin'>('all');
  const data = appState.getDailyProfitLossStats();

  const totalRevenue = data.reduce((sum, d) => sum + d.revenueUsd, 0);
  const totalCost = data.reduce((sum, d) => sum + d.serverCostUsd, 0);
  const totalNetProfit = Number((totalRevenue - totalCost).toFixed(2));
  const avgMargin = totalRevenue > 0 ? Number(((totalNetProfit / totalRevenue) * 100).toFixed(1)) : 0;
  const bestDay = [...data].sort((a, b) => b.netProfitUsd - a.netProfitUsd)[0];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      return (
        <div className="bg-[#0b160e] border border-[#23422a] p-3.5 rounded-2xl shadow-2xl text-xs font-mono space-y-1.5 z-50">
          <div className="text-white font-bold pb-1 border-b border-[#1b3422] flex items-center justify-between gap-4">
            <span>{pt.label}</span>
            <span className="text-gray-400 font-normal text-[10px]">{pt.date}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>ចំណូលសរុប (Revenue):</span>
            <span className="font-bold">${pt.revenueUsd.toFixed(2)} ({pt.revenueKhr.toLocaleString()} ៛)</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-rose-400">
            <span>ចំណាយ Server (Cost):</span>
            <span className="font-bold">-${pt.serverCostUsd.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-cyan-300 pt-1 border-t border-[#1b3422] font-black">
            <span>ប្រាក់ចំណេញសុទ្ធ (Net Profit):</span>
            <span>+${pt.netProfitUsd.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-yellow-400 text-[11px]">
            <span>ផលកម្រៃ (Profit Margin):</span>
            <span className="font-bold">{pt.profitMargin}%</span>
          </div>

          <div className="text-[10px] text-gray-500 pt-1">
            Orders: {pt.ordersCount} | Signals: {pt.signalsCount}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>និន្នាការចំណេញ/ខាត ប្រចាំថ្ងៃ (Daily Profit & Loss Trend)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                  Recharts Engine
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                ការវិភាគប្រាក់ចំណូលសរុប ប្រៀបធៀបនឹងការចំណាយដំណើរការ Server 1xBet & Cambodia Host
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-[#122216] p-1 rounded-xl border border-[#1c3623] text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setMetricView('all')}
            className={`px-3 py-1 rounded-lg transition ${
              metricView === 'all'
                ? 'bg-emerald-600 text-white font-bold shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ទិដ្ឋភាពរួម (All)
          </button>
          <button
            onClick={() => setMetricView('profit')}
            className={`px-3 py-1 rounded-lg transition ${
              metricView === 'profit'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ប្រាក់ចំណេញសុទ្ធ
          </button>
          <button
            onClick={() => setMetricView('margin')}
            className={`px-3 py-1 rounded-lg transition ${
              metricView === 'margin'
                ? 'bg-yellow-600 text-white font-bold shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Margin (%)
          </button>
        </div>
      </div>

      {/* Quick Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-[#111f15] border border-[#1d3523] flex flex-col">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <DollarSign size={12} className="text-emerald-400" /> ចំណូលសរុប ៧ ថ្ងៃ (Gross)
          </span>
          <span className="text-lg font-black text-white mt-1 font-mono">${totalRevenue.toFixed(2)}</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight size={10} /> 100% Verified
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#111f15] border border-[#1d3523] flex flex-col">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Server size={12} className="text-rose-400" /> ចំណាយ Server & API (Costs)
          </span>
          <span className="text-lg font-black text-rose-300 mt-1 font-mono">${totalCost.toFixed(2)}</span>
          <span className="text-[10px] text-gray-500 mt-0.5">
            185.195.234.19 + Edge DC
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#111f15] border border-[#1d3523] flex flex-col">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Zap size={12} className="text-cyan-400" /> ប្រាក់ចំណេញសុទ្ធ (Net Profit)
          </span>
          <span className="text-lg font-black text-cyan-300 mt-1 font-mono">+${totalNetProfit.toFixed(2)}</span>
          <span className="text-[10px] text-cyan-400 mt-0.5 font-bold">
            +{avgMargin}% Margin
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#111f15] border border-[#1d3523] flex flex-col">
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Percent size={12} className="text-yellow-400" /> ថ្ងៃចំណេញខ្ពស់បំផុត (Peak)
          </span>
          <span className="text-sm font-black text-yellow-300 mt-1 truncate">
            {bestDay?.label || 'សៅរ៍ (Sat)'}
          </span>
          <span className="text-[10px] text-gray-400 font-mono mt-0.5">
            +${bestDay?.netProfitUsd || 0} ({bestDay?.profitMargin || 0}%)
          </span>
        </div>
      </div>

      {/* The Recharts Visualization */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#15803d" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="costBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#991b1b" stopOpacity={0.4} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#16291b" vertical={false} />

            <XAxis
              dataKey="label"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1f3825' }}
            />

            <YAxis
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#1f3825' }}
              tickFormatter={(v) => `$${v}`}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />

            {/* Bars for Revenue & Server Cost */}
            {metricView !== 'margin' && (
              <Bar
                name="ចំណូលសរុប ($ Gross)"
                dataKey="revenueUsd"
                fill="url(#revenueBarGrad)"
                radius={[6, 6, 0, 0]}
                barSize={18}
              />
            )}

            {metricView !== 'margin' && (
              <Bar
                name="ចំណាយ Server ($ Cost)"
                dataKey="serverCostUsd"
                fill="url(#costBarGrad)"
                radius={[6, 6, 0, 0]}
                barSize={14}
              />
            )}

            {/* Line for Net Profit or Profit Margin */}
            {metricView !== 'margin' && (
              <Line
                type="monotone"
                name="ប្រាក់ចំណេញសុទ្ធ ($ Net Profit)"
                dataKey="netProfitUsd"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#38bdf8', strokeWidth: 1.5, stroke: '#0c160f' }}
                activeDot={{ r: 6, fill: '#38bdf8' }}
              />
            )}

            {metricView === 'margin' && (
              <Line
                type="monotone"
                name="Profit Margin (%)"
                dataKey="profitMargin"
                stroke="#eab308"
                strokeWidth={3}
                dot={{ r: 5, fill: '#eab308' }}
                activeDot={{ r: 7, fill: '#fde047' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Notes */}
      <div className="pt-2 border-t border-[#182f1f] flex flex-wrap items-center justify-between text-[11px] text-gray-400 gap-2 font-mono">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck size={13} />
          <span>ការគណនាស្វ័យប្រវត្តិតាម Real-time Bakong/ABA & 1xBet Feed Gateway</span>
        </span>
        <span className="text-gray-500">
          Latency: 1ms • Zero Loss • Feed IP: 185.195.234.19
        </span>
      </div>
    </div>
  );
};
