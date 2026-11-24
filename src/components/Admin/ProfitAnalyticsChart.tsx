import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Sparkles,
  Zap,
  BarChart3,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { appState } from '../../services/store';

export const ProfitAnalyticsChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'cumulative'>('daily');
  const [currencyView, setCurrencyView] = useState<'usd' | 'khr'>('usd');
  const [showGrowthLine, setShowGrowthLine] = useState<boolean>(true);

  const dailyData = appState.getDailyProfitLossStats();
  const weeklyData = appState.getWeeklySalesGrowthStats();

  // Aggregate metrics
  const totalDailyRevenueUsd = dailyData.reduce((sum, d) => sum + d.revenueUsd, 0);
  const totalDailyRevenueKhr = dailyData.reduce((sum, d) => sum + d.revenueKhr, 0);
  const totalDailyNetProfit = dailyData.reduce((sum, d) => sum + d.netProfitUsd, 0);
  const avgDailyRevenue = (totalDailyRevenueUsd / (dailyData.length || 1)).toFixed(1);

  const totalWeeklyRevenueUsd = weeklyData.reduce((sum, d) => sum + d.revenueUsd, 0);
  const latestWeek = weeklyData[weeklyData.length - 1];
  const prevWeek = weeklyData.length > 1 ? weeklyData[weeklyData.length - 2] : null;
  const currentWeekGrowth = latestWeek?.growthRate ?? 32.3;

  // Formatters
  const formatCurrency = (val: number) => {
    if (currencyView === 'khr') {
      return `${Math.round(val * 4000).toLocaleString()} ៛`;
    }
    return `$${val.toLocaleString()}`;
  };

  // Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isWeek = timeframe === 'weekly';

      return (
        <div className="bg-[#0b160e] border border-[#23422a] p-3.5 rounded-2xl shadow-2xl text-xs font-mono space-y-1.5 z-50 min-w-[240px]">
          <div className="text-white font-bold pb-1.5 border-b border-[#1b3422] flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Calendar size={13} />
              {dataPoint.label || dataPoint.week}
            </span>
            <span className="text-gray-400 font-normal text-[10px]">
              {isWeek ? `${dataPoint.startDate} → ${dataPoint.endDate}` : dataPoint.date}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>ចំណូលសរុប (Gross Earnings):</span>
            <span className="font-bold">
              ${dataPoint.revenueUsd.toLocaleString()} ({(dataPoint.revenueKhr || dataPoint.revenueUsd * 4000).toLocaleString()} ៛)
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 text-rose-400">
            <span>ចំណាយ Server (Cost):</span>
            <span className="font-bold">-${dataPoint.serverCostUsd.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-cyan-300 pt-1 border-t border-[#1b3422] font-black">
            <span>ប្រាក់ចំណេញសុទ្ធ (Net Profit):</span>
            <span>+${dataPoint.netProfitUsd.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between gap-4 text-yellow-400 text-[11px]">
            <span>កំណើន (Earnings Growth):</span>
            <span className="font-bold flex items-center gap-0.5">
              {dataPoint.growthRate >= 0 ? (
                <>
                  <ArrowUpRight size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">+{dataPoint.growthRate}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight size={13} className="text-rose-400" />
                  <span className="text-rose-400">{dataPoint.growthRate}%</span>
                </>
              )}
            </span>
          </div>

          <div className="text-[10px] text-gray-500 pt-1 border-t border-[#1b3422] flex items-center justify-between">
            <span>ការបញ្ជាទិញ: {dataPoint.ordersCount}</span>
            <span>Signals: {dataPoint.signalsCount}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl space-y-5">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  ការវិភាគប្រាក់ចំណេញ & កំណើនប្រព័ន្ធ (Profit Analytics)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  Recharts Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                  Growth Tracking
                </span>
              </div>
              <p className="text-xs text-gray-400">
                តាមដានការកើនឡើងនៃប្រាក់ចំណេញប្រចាំថ្ងៃ និងប្រចាំសប្តាហ៍ (Daily & Weekly Earnings Growth)
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center bg-[#112115] p-1 rounded-xl border border-[#1d3522] text-xs font-semibold">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                timeframe === 'daily'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Calendar size={13} />
              <span>ប្រចាំថ្ងៃ (Daily)</span>
            </button>

            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                timeframe === 'weekly'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 size={13} />
              <span>ប្រចាំសប្តាហ៍ (Weekly)</span>
            </button>

            <button
              onClick={() => setTimeframe('cumulative')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                timeframe === 'cumulative'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>កើនសរុប (Cumulative)</span>
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center bg-[#112115] p-1 rounded-xl border border-[#1d3522] text-xs font-bold">
            <button
              onClick={() => setCurrencyView('usd')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                currencyView === 'usd'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              $ USD
            </button>
            <button
              onClick={() => setCurrencyView('khr')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                currencyView === 'khr'
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ៛ KHR
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Total Revenue */}
        <div className="p-3.5 rounded-2xl bg-[#111f15] border border-[#1d3623] relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>ចំណូលសរុប (Gross Earnings)</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white font-mono">
            {currencyView === 'usd' ? `$${totalDailyRevenueUsd.toLocaleString()}` : `${totalDailyRevenueKhr.toLocaleString()} ៛`}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
            <ArrowUpRight size={12} />
            <span>+15.2% ធៀបនឹងម្សិលមិញ</span>
          </div>
        </div>

        {/* Card 2: Net Profit */}
        <div className="p-3.5 rounded-2xl bg-[#111f15] border border-[#1d3623] relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>ចំណេញសុទ្ធ (Net Profit)</span>
            <Sparkles size={14} className="text-cyan-400" />
          </div>
          <div className="text-lg font-black text-cyan-300 font-mono">
            {currencyView === 'usd' ? `$${totalDailyNetProfit.toFixed(0)}` : `${Math.round(totalDailyNetProfit * 4000).toLocaleString()} ៛`}
          </div>
          <div className="text-[10px] text-cyan-400 font-mono mt-1">
            ផលកម្រៃសុទ្ធ (Margin): <strong>87.8%</strong>
          </div>
        </div>

        {/* Card 3: Weekly Growth Rate */}
        <div className="p-3.5 rounded-2xl bg-[#111f15] border border-[#1d3623] relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>កំណើនសប្តាហ៍នេះ (WoW Growth)</span>
            <Percent size={14} className="text-yellow-400" />
          </div>
          <div className="text-lg font-black text-yellow-400 font-mono flex items-center gap-1">
            <ArrowUpRight size={18} />
            +{currentWeekGrowth}%
          </div>
          <div className="text-[10px] text-gray-400 font-mono mt-1">
            សប្តាហ៍ទី ៤១: ${latestWeek?.revenueUsd.toLocaleString() || '2,680'}
          </div>
        </div>

        {/* Card 4: Daily Run Rate */}
        <div className="p-3.5 rounded-2xl bg-[#111f15] border border-[#1d3623] relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
            <span>មធ្យមភាគប្រចាំថ្ងៃ (Daily Avg)</span>
            <Zap size={14} className="text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-300 font-mono">
            ${avgDailyRevenue}/day
          </div>
          <div className="text-[10px] text-gray-400 font-mono mt-1">
            Signal Volume: <strong>8,120/week</strong>
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization */}
      <div className="p-4 rounded-2xl bg-[#0e1911] border border-[#1b3422] relative">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-gray-300 font-medium">
              {timeframe === 'daily' && 'តារាងកំណើនប្រាក់ចំណេញប្រចាំថ្ងៃ (Daily Earnings & Profit Curve)'}
              {timeframe === 'weekly' && 'តារាងកំណើនប្រាក់ចំណេញប្រចាំសប្តាហ៍ (Weekly Earnings Growth & WoW %)'}
              {timeframe === 'cumulative' && 'ខ្សែកោងចំណូលសន្សំកើនឡើងសរុប (Cumulative Compounding Revenue Curve)'}
            </span>
          </div>

          <label className="flex items-center gap-1.5 text-gray-400 hover:text-white cursor-pointer select-none text-[11px]">
            <input
              type="checkbox"
              checked={showGrowthLine}
              onChange={(e) => setShowGrowthLine(e.target.checked)}
              className="rounded accent-emerald-500 cursor-pointer"
            />
            <span>បង្ហាញបន្ទាត់កំណើន (Growth Trendline)</span>
          </label>
        </div>

        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {timeframe === 'daily' ? (
              <ComposedChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#1b3422" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                {showGrowthLine && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#fbbf24"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                )}
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-gray-300 font-mono text-xs">{value}</span>
                  )}
                />

                <Bar
                  yAxisId="left"
                  dataKey="revenueUsd"
                  name="ចំណូលសរុប (Gross Revenue)"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="netProfitUsd"
                  name="ចំណេញសុទ្ធ (Net Profit)"
                  stroke="#22d3ee"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#22d3ee' }}
                />

                {showGrowthLine && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growthRate"
                    name="កំណើន % (Growth Rate)"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, fill: '#fbbf24' }}
                  />
                )}
              </ComposedChart>
            ) : timeframe === 'weekly' ? (
              <ComposedChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.6} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#1b3422" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                {showGrowthLine && (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#fbbf24"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                )}
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-gray-300 font-mono text-xs">{value}</span>
                  )}
                />

                <Bar
                  yAxisId="left"
                  dataKey="revenueUsd"
                  name="ចំណូលប្រចាំសប្តាហ៍ (Weekly Earnings)"
                  fill="url(#weekGrad)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={52}
                />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="netProfitUsd"
                  name="ចំណេញសុទ្ធ (Weekly Net Profit)"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#06b6d4' }}
                />

                {showGrowthLine && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="growthRate"
                    name="កំណើនសប្តាហ៍ % (WoW Growth %)"
                    stroke="#fbbf24"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#fbbf24' }}
                  />
                )}
              </ComposedChart>
            ) : (
              <AreaChart data={dailyData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="cumulRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="cumulProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#1b3422" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={45}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: 10, fontSize: 11 }}
                  formatter={(value) => (
                    <span className="text-gray-300 font-mono text-xs">{value}</span>
                  )}
                />

                <Area
                  type="monotone"
                  dataKey="cumulativeRevenue"
                  name="ចំណូលកើនសរុប (Cumulative Revenue)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cumulRevenue)"
                />

                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="ចំណេញសុទ្ធសរុប (Cumulative Net Profit)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cumulProfit)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer System Performance Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 pt-1 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>ប្រព័ន្ធដំណើរការស្ថិរភាព 100% គ្មានការរំខាន (Up-time: 99.99%)</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-emerald-400">
            សប្តាហ៍បច្ចុប្បន្ន: <strong>${latestWeek?.revenueUsd.toLocaleString() || '2,680'}</strong>
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-yellow-400">
            WoW Growth: <strong>+{currentWeekGrowth}%</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
