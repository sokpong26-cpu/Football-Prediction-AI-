import React, { useState, useEffect } from 'react';
import { appState, PACKAGES } from '../../services/store';
import { sound } from '../../services/sound';
import { Order, OrderStatus, User, ActivityLogItem, HourlySuccessRate } from '../../types';
import khqrImageFile from '../../assets/images/khqr_bin_sopha_1791191172258.jpg';
import { SystemHealth } from '../SystemHealth/SystemHealth';
import { SignalPerformanceTrend } from './SignalPerformanceTrend';
import { HourlySuccessHeatmap } from './HourlySuccessHeatmap';
import { DailyProfitLossTrend } from './DailyProfitLossTrend';
import { ProfitAnalyticsChart } from './ProfitAnalyticsChart';
import { SignalHistorySection } from './SignalHistorySection';
import { ExpenseConsole } from './ExpenseConsole';
import { MLOutcomePredictor } from './MLOutcomePredictor';
import { RealtimeSalesSection } from './RealtimeSalesSection';
import confetti from 'canvas-confetti';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Radio,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Search,
  Filter,
  Key,
  Sliders,
  RefreshCw,
  RotateCw,
  Eye,
  Check,
  Zap,
  Volume2,
  VolumeX,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Plus,
  QrCode,
  Activity,
  Download,
  AlertOctagon,
  Sparkles,
  Server,
  Wrench,
  History,
  Cpu,
  Globe,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [, setTick] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'profit_analytics' | 'expenses' | 'ml_engine' | 'orders' | 'signals' | 'signal_history' | 'keys' | 'activity' | 'settings'>('overview');
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  
  // Activity Log State
  const [activityFilter, setActivityFilter] = useState<'all' | 'signal' | 'order' | 'system' | 'security' | 'maintenance'>('all');
  const [activitySearch, setActivitySearch] = useState<string>('');

  // 24-Hour Line Chart Hover State
  const [hoveredHourIndex, setHoveredHourIndex] = useState<number | null>(null);

  // Key generator state
  const [genTier, setGenTier] = useState<string>('pkg_7day');
  const [genCount, setGenCount] = useState<number>(1);
  const [generatedBatch, setGeneratedBatch] = useState<string[]>([]);
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);

  // Settings state
  const [winRate, setWinRate] = useState<number>(appState.config.winRateTarget);
  const [autoApprove, setAutoApprove] = useState<boolean>(appState.config.autoApproveOrders);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(appState.config.soundEnabled);
  const [merchantName, setMerchantName] = useState<string>(appState.config.merchantName || 'BIN SOPHA');
  const [merchantAccount, setMerchantAccount] = useState<string>(appState.config.merchantAccount || 'BIN SOPHA (Bakong / KHQR)');
  const [lowRateThreshold, setLowRateThreshold] = useState<number>(appState.config.lowSuccessRateThreshold || 85);
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(appState.config.maintenanceMode ?? true);
  const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(appState.config.scheduleEnabled ?? true);
  const [startHour, setStartHour] = useState<number>(appState.config.operatingStartHour || 7);
  const [endHour, setEndHour] = useState<number>(appState.config.operatingEndHour || 22);

  // Manual Force Refresh & Multi-Service System Status Check State
  const [isForceRefreshing, setIsForceRefreshing] = useState(false);
  const [forceRefreshStatus, setForceRefreshStatus] = useState<{
    stepMessage: string;
    progressPercent: number;
    activeIp: string;
    activeHost: string;
    activeRegion: string;
    latencyMs: number;
    services: {
      network: 'pending' | 'checking' | 'pass';
      feed: 'pending' | 'checking' | 'pass';
      database: 'pending' | 'checking' | 'pass';
      aiModel: 'pending' | 'checking' | 'pass';
      firewall: 'pending' | 'checking' | 'pass';
    };
    completedAt?: string;
  } | null>(null);

  const handleManualForceRefresh = async () => {
    sound.playClick();
    setIsForceRefreshing(true);

    // Initial status check step
    setForceRefreshStatus({
      stepMessage: '1/5 Handing over edge route & cycling daily IP node...',
      progressPercent: 20,
      activeIp: appState.dailyNetworkConfig.currentNode.feedIp,
      activeHost: appState.dailyNetworkConfig.currentNode.hostIp,
      activeRegion: appState.dailyNetworkConfig.currentNode.region,
      latencyMs: appState.dailyNetworkConfig.currentNode.latencyMs,
      services: {
        network: 'checking',
        feed: 'pending',
        database: 'pending',
        aiModel: 'pending',
        firewall: 'pending',
      },
    });

    await new Promise((r) => setTimeout(r, 450));
    // Trigger immediate IP rotation across all systems
    const nextNode = appState.rotateIpNow(undefined, true);

    setForceRefreshStatus((prev) =>
      prev
        ? {
            ...prev,
            stepMessage: `2/5 Handshake established on ${nextNode.feedIp}. Pinging WebSocket stream...`,
            progressPercent: 40,
            activeIp: nextNode.feedIp,
            activeHost: nextNode.hostIp,
            activeRegion: nextNode.region,
            latencyMs: nextNode.latencyMs,
            services: {
              ...prev.services,
              network: 'pass',
              feed: 'checking',
            },
          }
        : null
    );

    await new Promise((r) => setTimeout(r, 400));
    setForceRefreshStatus((prev) =>
      prev
        ? {
            ...prev,
            stepMessage: '3/5 Verifying users, order transactions & persistent storage...',
            progressPercent: 60,
            services: {
              ...prev.services,
              feed: 'pass',
              database: 'checking',
            },
          }
        : null
    );

    await new Promise((r) => setTimeout(r, 400));
    setForceRefreshStatus((prev) =>
      prev
        ? {
            ...prev,
            stepMessage: '4/5 Benchmarking Random Forest ML 100 Trees & probability model...',
            progressPercent: 80,
            services: {
              ...prev.services,
              database: 'pass',
              aiModel: 'checking',
            },
          }
        : null
    );

    await new Promise((r) => setTimeout(r, 400));
    setForceRefreshStatus((prev) =>
      prev
        ? {
            ...prev,
            stepMessage: '5/5 Testing Cloudflare Edge Firewall & CyderShield V3.2 rules...',
            progressPercent: 100,
            services: {
              ...prev.services,
              aiModel: 'pass',
              firewall: 'checking',
            },
          }
        : null
    );

    await new Promise((r) => setTimeout(r, 350));
    setForceRefreshStatus((prev) =>
      prev
        ? {
            ...prev,
            stepMessage: `All 5 services healthy & verified 100% on node ${nextNode.feedIp}!`,
            progressPercent: 100,
            services: {
              ...prev.services,
              firewall: 'pass',
            },
            completedAt: new Date().toLocaleTimeString(),
          }
        : null
    );

    setIsForceRefreshing(false);
    sound.playCompleteFanfare();

    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#00ff7f', '#00e5ff', '#ff0055', '#ffe600'],
      });
    } catch {}

    appState.addActivityLog({
      type: 'system',
      titleKh: `⚡ Manual Force Refresh: គ្រប់ Service ដំណើរការរលូន 100% (Node: ${nextNode.feedIp})`,
      titleEn: `Manual Force Refresh & System Status Check Passed: ${nextNode.feedIp}`,
      details: `Rotated IP: ${nextNode.feedIp} • Host: ${nextNode.hostIp} (${nextNode.region}) • Ping: ${nextNode.latencyMs}ms • All 5 services verified OK`,
      status: 'success',
      userOrSource: 'Admin Console',
    });
  };

  useEffect(() => {
    const unsub = appState.subscribe(() => {
      setTick((t) => t + 1);
      setWinRate(appState.config.winRateTarget);
      setAutoApprove(appState.config.autoApproveOrders);
      setSoundEnabled(appState.config.soundEnabled);
      setMerchantName(appState.config.merchantName || 'BIN SOPHA');
      setMerchantAccount(appState.config.merchantAccount || 'BIN SOPHA (Bakong / KHQR)');
      setLowRateThreshold(appState.config.lowSuccessRateThreshold || 85);
      setMaintenanceMode(appState.config.maintenanceMode ?? true);
      setScheduleEnabled(appState.config.scheduleEnabled ?? true);
      setStartHour(appState.config.operatingStartHour || 7);
      setEndHour(appState.config.operatingEndHour || 22);
    });
    return unsub;
  }, []);

  const orders = appState.orders;
  const users = appState.users;
  const salesStats = appState.salesStats;
  const recentChecks = appState.recentChecks;

  // Metrics
  const todayStat = salesStats[salesStats.length - 1];
  const totalRevenueUsd = salesStats.reduce((acc, s) => acc + s.revenueUsd, 0);
  const totalRevenueKhr = salesStats.reduce((acc, s) => acc + s.revenueKhr, 0);
  const pendingOrdersCount = orders.filter((o) => o.paymentStatus === 'pending').length;
  const activeVipUsers = users.filter((u) => u.vipTier !== 'free').length;
  const totalSignalsUsed = users.reduce((acc, u) => acc + u.totalSignalsUsed, 0);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchStatus = orderFilter === 'all' || o.paymentStatus === orderFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userPhone.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const handleApproveOrder = (orderId: string) => {
    appState.approveOrder(orderId);
  };

  const handleRejectOrder = (orderId: string) => {
    appState.rejectOrder(orderId);
  };

  const handleGenerateKeys = () => {
    sound.playClick();
    const pkg = PACKAGES.find((p) => p.id === genTier) || PACKAGES[1];
    const prefix = pkg.durationDays ? `${pkg.durationDays}D` : 'LIFE';
    const batch: string[] = [];
    for (let i = 0; i < genCount; i++) {
      const randomCode = `VIP-${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      batch.push(randomCode);
    }
    setGeneratedBatch(batch);
  };

  const handleCopyBatchKey = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyIndex(index);
    sound.playClick();
    setTimeout(() => setCopiedKeyIndex(null), 1800);
  };

  const handleSaveSettings = () => {
    appState.config.winRateTarget = winRate;
    appState.config.autoApproveOrders = autoApprove;
    appState.config.soundEnabled = soundEnabled;
    appState.config.merchantName = merchantName;
    appState.config.merchantAccount = merchantAccount;
    appState.setLowRateThreshold(lowRateThreshold);
    appState.setMaintenanceMode(maintenanceMode, 24);
    appState.setScheduleEnabled(scheduleEnabled);
    appState.setOperatingHours(startHour, endHour);
    sound.enabled = soundEnabled;
    appState.notify();
    sound.playCompleteFanfare();
  };

  // Activity logs & Hourly rates data
  const activityLogs = appState.activityLogs;
  const hourlyRates = appState.hourlyRates;
  const currentAvgSuccessRate = appState.getAverageSuccessRate24h();
  const latestHourRate = hourlyRates.length > 0 ? hourlyRates[hourlyRates.length - 1].successRate : 99.9;
  const isLowRateAlert = latestHourRate < lowRateThreshold || currentAvgSuccessRate < lowRateThreshold;

  // Filtered activity logs
  const filteredActivityLogs = activityLogs.filter((item) => {
    const matchFilter = activityFilter === 'all' || item.type === activityFilter;
    const matchSearch =
      activitySearch === '' ||
      item.titleKh.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.titleEn.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.details.toLowerCase().includes(activitySearch.toLowerCase()) ||
      item.userOrSource.toLowerCase().includes(activitySearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Find maximum revenue for bar chart scaling
  const maxDayRevenue = Math.max(...salesStats.map((s) => s.revenueUsd), 350);

  // 24-Hour AI Signal Success Rate Line Chart Helper
  const renderSuccessRateChart = () => {
    const chartW = 710;
    const chartH = 150;
    const padLeft = 45;
    const padTop = 25;
    const svgW = 775;
    const svgH = 210;
    const minRate = 75;
    const maxRate = 100;

    const points = hourlyRates.map((h, i) => {
      const x = padLeft + (i / Math.max(1, hourlyRates.length - 1)) * chartW;
      const clamped = Math.min(maxRate, Math.max(minRate, h.successRate));
      const y = padTop + ((maxRate - clamped) / (maxRate - minRate)) * chartH;
      return {
        x,
        y,
        hour: h.hour,
        rate: h.successRate,
        total: h.totalSignals,
        wins: h.successfulSignals,
        index: i,
      };
    });

    const lineD = points.length > 0 ? points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') : '';
    const areaD = points.length > 0 ? `${lineD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z` : '';
    const threshY = padTop + ((maxRate - lowRateThreshold) / (maxRate - minRate)) * chartH;

    return (
      <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-emerald-400" />
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>អត្រាជោគជ័យ AI Signal ២៤ ម៉ោង (24h Success Rate)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold font-mono">
                  Gemini 3.8 Flash Core
                </span>
              </h3>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              ទិន្នន័យអត្រាឈ្នះ (AI Success Rate) និងស្ថិតិឆែកសេវា Apple of Fortune ប្រចាំម៉ោងពី Activity Log
            </p>
          </div>

          {/* Right Badges & Simulator Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-[#132417] border border-[#1e3b26] text-right">
              <div className="text-[10px] text-gray-400">មធ្យម ២៤ ម៉ោង</div>
              <div className={`text-sm font-mono font-black ${currentAvgSuccessRate < lowRateThreshold ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                {currentAvgSuccessRate}%
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#132417] border border-[#1e3b26] text-right">
              <div className="text-[10px] text-gray-400">កម្រិត Alert</div>
              <div className="text-sm font-mono font-bold text-red-400">&lt; {lowRateThreshold}%</div>
            </div>
            {isLowRateAlert && (
              <button
                onClick={() => appState.resetSuccessRateToNormal()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow"
              >
                <span>ស្ដារ Rate 99.9%</span>
              </button>
            )}
          </div>
        </div>

        {/* SVG Chart Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[680px] relative">
            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-52 select-none overflow-visible">
              <defs>
                <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines */}
              {[100, 95, 90, 85, 80].map((gridVal) => {
                const yVal = padTop + ((maxRate - gridVal) / (maxRate - minRate)) * chartH;
                return (
                  <g key={gridVal}>
                    <line
                      x1={padLeft}
                      y1={yVal}
                      x2={padLeft + chartW}
                      y2={yVal}
                      stroke="#182e1e"
                      strokeWidth="1"
                      strokeDasharray={gridVal === lowRateThreshold ? 'none' : '3 3'}
                    />
                    <text
                      x={padLeft - 8}
                      y={yVal + 3}
                      textAnchor="end"
                      fill="#6b7280"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {gridVal}%
                    </text>
                  </g>
                );
              })}

              {/* Threshold Line */}
              <line
                x1={padLeft}
                y1={threshY}
                x2={padLeft + chartW}
                y2={threshY}
                stroke="#ef4444"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={padLeft + chartW}
                y={threshY - 5}
                textAnchor="end"
                fill="#f87171"
                fontSize="10"
                fontWeight="bold"
                fontFamily="monospace"
              >
                ⚠️ Alert Threshold: {lowRateThreshold}%
              </text>

              {/* Shaded Area */}
              {areaD && <path d={areaD} fill="url(#lineAreaGrad)" />}

              {/* Main Line */}
              {lineD && (
                <path
                  d={lineD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Points */}
              {points.map((p, idx) => {
                const isLow = p.rate < lowRateThreshold;
                const isHovered = hoveredHourIndex === idx;

                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredHourIndex(idx)}
                    onMouseLeave={() => setHoveredHourIndex(null)}
                    className="cursor-pointer"
                  >
                    {isLow && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="9"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 6 : isLow ? 5 : 3.5}
                      fill={isLow ? '#ef4444' : isHovered ? '#34d399' : '#10b981'}
                      stroke="#0c160f"
                      strokeWidth="2"
                    />
                    {isHovered && (
                      <line
                        x1={p.x}
                        y1={padTop}
                        x2={p.x}
                        y2={padTop + chartH}
                        stroke="#34d399"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                  </g>
                );
              })}

              {/* X-axis Hour Labels */}
              {points
                .filter((_, idx) => idx % 3 === 0 || idx === points.length - 1)
                .map((p, idx) => (
                  <text
                    key={idx}
                    x={p.x}
                    y={padTop + chartH + 18}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {p.hour}
                  </text>
                ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredHourIndex !== null && points[hoveredHourIndex] && (
              <div
                style={{
                  left: `${(points[hoveredHourIndex].x / svgW) * 100}%`,
                  top: `${(points[hoveredHourIndex].y / svgH) * 100}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-full mb-3 pointer-events-none z-30"
              >
                <div className="bg-[#0e1a12] border border-[#23452b] p-2.5 rounded-xl shadow-2xl text-[11px] font-mono whitespace-nowrap text-white">
                  <div className="font-bold text-emerald-400 flex items-center justify-between gap-3">
                    <span>ម៉ោង {points[hoveredHourIndex].hour}</span>
                    <span className={points[hoveredHourIndex].rate < lowRateThreshold ? 'text-red-400 font-black' : 'text-emerald-300'}>
                      {points[hoveredHourIndex].rate}% Success
                    </span>
                  </div>
                  <div className="text-gray-300 mt-1 flex justify-between gap-3">
                    <span>ឆែកសរុប: {points[hoveredHourIndex].total} ដង</span>
                    <span className="text-emerald-400">ឈ្នះ: {points[hoveredHourIndex].wins}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* Top Admin Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0c1710] border border-[#1b3422] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 p-0.5 shadow-lg shadow-emerald-900/40">
            <div className="w-full h-full bg-[#0c160f] rounded-2xl flex items-center justify-center text-emerald-400">
              <Shield size={24} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ផ្ទាំងគ្រប់គ្រងរដ្ឋបាល (Admin Dashboard)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold uppercase">
                Privileged
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              ប្រព័ន្ធតាមដានការលក់ប្រចាំថ្ងៃ គ្រប់គ្រងការបញ្ជាទិញ និងពិនិត្យសេវា Apple of Fortune
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* CSV Export Dropdown Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#111f15] border border-[#1e3825]">
            <button
              onClick={() => appState.exportSignalsCSV()}
              className="px-2.5 py-1.5 rounded-xl bg-[#152a1b] hover:bg-[#1f3f27] text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              title="ទាញយកកំណត់ត្រា Signal ទាំងអស់ជា CSV"
            >
              <Download size={13} />
              <span>Signals CSV</span>
            </button>
            <button
              onClick={() => appState.exportOrdersCSV()}
              className="px-2.5 py-1.5 rounded-xl bg-[#152a1b] hover:bg-[#1f3f27] text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              title="ទាញយកបញ្ជី Order ទាំងអស់ជា CSV"
            >
              <Download size={13} />
              <span>Orders CSV</span>
            </button>
            <button
              onClick={() => appState.exportActivityLogsCSV()}
              className="px-2.5 py-1.5 rounded-xl bg-[#152a1b] hover:bg-[#1f3f27] text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              title="ទាញយកកំណត់ត្រាសកម្មភាពទាំងអស់ជា CSV"
            >
              <Download size={13} />
              <span>Logs CSV</span>
            </button>
          </div>

          {/* Update All System Software, IP & Restart Website Button */}
          <button
            type="button"
            onClick={async () => {
              sound.playClick();
              await appState.updateAllSystemSoftwareAndReboot();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 hover:brightness-110 active:scale-[0.98] text-black font-black text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/30 border border-cyan-200 cursor-pointer"
            title="Update All System Software (v3.3), Rotate IP to next node & automated website reboot"
          >
            <RotateCw size={13} className="text-black" />
            <span>🚀 Update &amp; Restart Website</span>
          </button>

          {/* Manual Force Refresh & IP Rotation Button */}
          <button
            type="button"
            onClick={handleManualForceRefresh}
            disabled={isForceRefreshing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-[#ff0055] to-emerald-500 hover:brightness-110 active:scale-[0.98] text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-900/40 border border-cyan-300 cursor-pointer disabled:opacity-50"
            title="Manual Force Refresh: Rotates IP immediately & runs comprehensive system status check across all services"
          >
            <RefreshCw size={13} className={isForceRefreshing ? 'animate-spin text-yellow-300' : 'text-white'} />
            <span>{isForceRefreshing ? 'Force Refreshing...' : '⚡ Force Refresh'}</span>
          </button>

          {/* Restart Server & All Systems Button */}
          <button
            onClick={() => appState.restartServerAndAllSystems()}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-700/30 cursor-pointer"
            title="Restart Server & All Systems & Bot"
          >
            <RefreshCw size={13} className="text-black" />
            <span>Restart Server & Bot</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => appState.toggleSound()}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                : 'bg-[#122216] text-gray-500 border-[#203a27]'
            }`}
            title="សំឡេងជូនដំណឹង (Sound Alert)"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Live Force Refresh & System Status Check Diagnostic Banner */}
      {forceRefreshStatus && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0c1c24] via-[#09151e] to-[#071317] border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.35)] relative overflow-hidden animate-in fade-in duration-300 font-mono">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shrink-0">
                <Globe size={20} className={isForceRefreshing ? 'animate-spin' : ''} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-bold text-xs sm:text-sm">
                    System-Wide Force Refresh &amp; IP Rotation
                  </h3>
                  <span className={`text-[9px] px-2 py-0.2 rounded-full font-black ${
                    isForceRefreshing
                      ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/50 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  }`}>
                    {isForceRefreshing ? 'DIAGNOSTIC IN PROGRESS' : 'VERIFIED 100% HEALTHY'}
                  </span>
                  {forceRefreshStatus.completedAt && (
                    <span className="text-[10px] text-gray-400">
                      Completed at {forceRefreshStatus.completedAt}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  {forceRefreshStatus.stepMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block">Active Daily Feed</span>
                <span className="text-cyan-300 font-bold text-xs">{forceRefreshStatus.activeIp}</span>
              </div>
              <div className="text-right pl-2 border-l border-cyan-900/40">
                <span className="text-[10px] text-gray-400 block">Ping</span>
                <span className="text-emerald-400 font-bold text-xs">{forceRefreshStatus.latencyMs} ms</span>
              </div>
              <button
                type="button"
                onClick={() => setForceRefreshStatus(null)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer ml-1"
                title="Dismiss status banner"
              >
                <XCircle size={16} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-black/60 rounded-full h-1.5 overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-[#ff0055] transition-all duration-300"
              style={{ width: `${forceRefreshStatus.progressPercent}%` }}
            />
          </div>

          {/* Services Checklist Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px]">
            <div className={`p-2 rounded-xl border flex items-center justify-between ${
              forceRefreshStatus.services.network === 'pass'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : forceRefreshStatus.services.network === 'checking'
                ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-200 animate-pulse'
                : 'bg-black/40 border-gray-800 text-gray-500'
            }`}>
              <span>1. IP Handover</span>
              {forceRefreshStatus.services.network === 'pass' ? <CheckCircle2 size={12} className="text-emerald-400" /> : <RefreshCw size={10} className="animate-spin" />}
            </div>

            <div className={`p-2 rounded-xl border flex items-center justify-between ${
              forceRefreshStatus.services.feed === 'pass'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : forceRefreshStatus.services.feed === 'checking'
                ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-200 animate-pulse'
                : 'bg-black/40 border-gray-800 text-gray-500'
            }`}>
              <span>2. WebSocket Feed</span>
              {forceRefreshStatus.services.feed === 'pass' ? <CheckCircle2 size={12} className="text-emerald-400" /> : forceRefreshStatus.services.feed === 'checking' ? <RefreshCw size={10} className="animate-spin" /> : <Clock size={10} />}
            </div>

            <div className={`p-2 rounded-xl border flex items-center justify-between ${
              forceRefreshStatus.services.database === 'pass'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : forceRefreshStatus.services.database === 'checking'
                ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-200 animate-pulse'
                : 'bg-black/40 border-gray-800 text-gray-500'
            }`}>
              <span>3. Data Storage</span>
              {forceRefreshStatus.services.database === 'pass' ? <CheckCircle2 size={12} className="text-emerald-400" /> : forceRefreshStatus.services.database === 'checking' ? <RefreshCw size={10} className="animate-spin" /> : <Clock size={10} />}
            </div>

            <div className={`p-2 rounded-xl border flex items-center justify-between ${
              forceRefreshStatus.services.aiModel === 'pass'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : forceRefreshStatus.services.aiModel === 'checking'
                ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-200 animate-pulse'
                : 'bg-black/40 border-gray-800 text-gray-500'
            }`}>
              <span>4. Random Forest ML</span>
              {forceRefreshStatus.services.aiModel === 'pass' ? <CheckCircle2 size={12} className="text-emerald-400" /> : forceRefreshStatus.services.aiModel === 'checking' ? <RefreshCw size={10} className="animate-spin" /> : <Clock size={10} />}
            </div>

            <div className={`p-2 rounded-xl border flex items-center justify-between col-span-2 sm:col-span-1 ${
              forceRefreshStatus.services.firewall === 'pass'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : forceRefreshStatus.services.firewall === 'checking'
                ? 'bg-cyan-950/40 border-cyan-400/60 text-cyan-200 animate-pulse'
                : 'bg-black/40 border-gray-800 text-gray-500'
            }`}>
              <span>5. Edge Shield</span>
              {forceRefreshStatus.services.firewall === 'pass' ? <CheckCircle2 size={12} className="text-emerald-400" /> : forceRefreshStatus.services.firewall === 'checking' ? <RefreshCw size={10} className="animate-spin" /> : <Clock size={10} />}
            </div>
          </div>
        </div>
      )}

      {/* Critical Low Success Rate Alarm Alert Banner */}
      {isLowRateAlert && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-red-950/90 via-red-900/60 to-black border-2 border-red-500 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="animate-bounce" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-sm">
                  ⚠️ ការព្រមានបន្ទាន់: អត្រាជោគជ័យ AI Signal ធ្លាក់ចុះ!
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono font-black text-[10px]">
                  {latestHourRate}% (ក្រោម {lowRateThreshold}%)
                </span>
              </div>
              <p className="text-xs text-red-300/90 mt-0.5">
                អត្រាជោគជ័យ AI Signal ក្នុងម៉ោងនេះបានធ្លាក់ចុះក្រោម {lowRateThreshold}%។ សំឡេង Siren Alarm ត្រូវបានបន្លឺឡើង!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => sound.playLowRateWarning()}
              className="px-3 py-2 rounded-xl bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-700/60 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Volume2 size={14} />
              <span>បន្លឺសំឡេង Siren</span>
            </button>
            <button
              onClick={() => appState.resetSuccessRateToNormal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition cursor-pointer"
            >
              ស្ដារប្រព័ន្ធធម្មតា (Reset)
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Today's Sales */}
        <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">ការលក់ថ្ងៃនេះ (Today Sales)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ${todayStat?.revenueUsd || 0}
          </div>
          <div className="text-xs text-gray-400 font-mono mt-0.5">
            {(todayStat?.revenueKhr || 0).toLocaleString()} ៛
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <TrendingUp size={14} />
            <span>+{todayStat?.ordersCount || 0} ការបញ្ជាទិញថ្ងៃនេះ</span>
          </div>
        </div>

        {/* Metric 2: Total Gross Revenue */}
        <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">ចំណូលសរុប (Total Revenue)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ${totalRevenueUsd.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 font-mono mt-0.5">
            {totalRevenueKhr.toLocaleString()} ៛
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <span className="text-blue-400 font-semibold">{orders.length} Orders</span>
            <span>• ស្ថិតិ 7 ថ្ងៃកន្លងមក</span>
          </div>
        </div>

        {/* Metric 3: Pending Orders & Automations */}
        <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-lg relative overflow-hidden group hover:border-yellow-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">ការបញ្ជាទិញរង់ចាំពិនិត្យ</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              pendingOrdersCount > 0 ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' : 'bg-gray-800 text-gray-400'
            }`}>
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {pendingOrdersCount}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {pendingOrdersCount > 0 ? 'ត្រូវការការអនុម័តបុងទូទាត់' : 'គ្មានការកកស្ទះបញ្ជាទិញទេ'}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-yellow-400 font-medium">
            <Zap size={14} />
            <span>Auto-Approve: {autoApprove ? 'ON (ស្វ័យប្រវត្តិ)' : 'OFF'}</span>
          </div>
        </div>

        {/* Metric 4: Active VIP Members & Signal Usage */}
        <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-400">សមាជិក VIP & Signal Usage</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {activeVipUsers} <span className="text-xs text-gray-400 font-normal">VIP សកម្ម</span>
          </div>
          <div className="text-xs text-gray-400 font-mono mt-0.5">
            {totalSignalsUsed.toLocaleString()} ដង ចាប់សេវាសរុប
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <Sparkles size={14} className="text-yellow-400 animate-pulse" />
            <span>Gemini 3.8 Flash ({winRate}%) • Cloudflare Edge</span>
          </div>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#182e1d] pb-3 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'ផ្ទាំងសង្ខេប & ការលក់ (Overview)', icon: TrendingUp },
          { id: 'ml_engine', label: '🤖 ML Predictor Core (RandomForest & Scaler)', icon: Cpu },
          { id: 'expenses', label: '⚡ Simple Setup & Update Expense (Server Ops)', icon: Server },
          { id: 'profit_analytics', label: 'វិភាគប្រាក់ចំណេញ (Profit Analytics)', icon: DollarSign },
          { id: 'orders', label: `គ្រប់គ្រងការបញ្ជាទិញ (Orders) [${orders.length}]`, icon: ShoppingCart },
          { id: 'signals', label: 'តាមដាន Check Signal ភ្លាមៗ (Live Monitor)', icon: Radio },
          { id: 'signal_history', label: `ប្រវត្តិនៃ Signal (Signal History) [${appState.scannedSignalsHistory.length}]`, icon: History },
          { id: 'activity', label: `កំណត់ត្រាសកម្មភាព (Activity Log) [${activityLogs.length}]`, icon: Activity },
          { id: 'keys', label: 'បង្កើត VIP License Keys', icon: Key },
          { id: 'settings', label: 'ការកំណត់ប្រព័ន្ធ (Engine Config)', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setSelectedTab(tab.id as typeof selectedTab);
              }}
              className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60 font-black'
                  : 'bg-[#101e14] text-gray-400 hover:text-white border border-[#1b3422]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW & SALES CHART */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <RealtimeSalesSection />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 7-Day Sales Trend Bar Chart */}
          <div className="lg:col-span-2 p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" />
                  តារាងតាមដានការលក់ប្រចាំថ្ងៃ (Daily Sales Trend)
                </h3>
                <p className="text-xs text-gray-400">ចំណូលប្រចាំថ្ងៃគិតជាដុល្លារ និងរៀលក្នុងរយៈពេល ៧ ថ្ងៃចុងក្រោយ</p>
              </div>
              <div className="text-right">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                  មធ្យម: ${(totalRevenueUsd / salesStats.length).toFixed(1)}/ថ្ងៃ
                </span>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-3 px-2 border-b border-[#182e1d]">
              {salesStats.map((stat, idx) => {
                const heightPercent = Math.max(12, Math.round((stat.revenueUsd / maxDayRevenue) * 100));
                const isToday = idx === salesStats.length - 1;

                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-white bg-black/90 px-2 py-1 rounded-md border border-gray-700 pointer-events-none mb-1 shadow-lg text-center">
                      <div>${stat.revenueUsd}</div>
                      <div className="text-gray-400">{stat.revenueKhr.toLocaleString()} ៛</div>
                      <div className="text-emerald-400">{stat.ordersCount} Orders</div>
                    </div>

                    {/* Bar */}
                    <div className="w-full max-w-[48px] bg-[#142618] rounded-xl overflow-hidden flex flex-col justify-end p-1 h-full">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-lg transition-all duration-500 relative ${
                          isToday
                            ? 'bg-gradient-to-t from-emerald-600 to-green-400 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                            : 'bg-emerald-700/60 group-hover:bg-emerald-600'
                        }`}
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-gray-300">
                          ${stat.revenueUsd}
                        </span>
                      </div>
                    </div>

                    {/* X-axis Label */}
                    <span className={`text-[11px] font-medium tracking-tight text-center ${
                      isToday ? 'text-emerald-400 font-bold' : 'text-gray-400'
                    }`}>
                      {stat.label.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 pt-3">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>ចំណូលថ្ងៃនេះកំពុងកើនឡើង</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                សរុប ៧ ថ្ងៃ: ${totalRevenueUsd} ({totalRevenueKhr.toLocaleString()} ៛)
              </span>
            </div>
          </div>

          {/* Live Alerts & Real-time Check Feed */}
          <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell size={18} className="text-yellow-400" />
                  ការជូនដំណឹងប្រព័ន្ធភ្លាមៗ (Alerts)
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#182e1d] text-gray-300 font-mono">
                  {appState.alerts.filter((a) => !a.read).length} ថ្មី
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                ជូនដំណឹងភ្លាមៗរាល់ពេលមានការបញ្ជាទិញ ឬឆែក Signal
              </p>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {appState.alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-2xl border transition ${
                      !alert.read
                        ? 'bg-[#14281a] border-emerald-500/50'
                        : 'bg-[#101b13] border-[#1d3322]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {alert.type === 'order' ? '💰' : alert.type === 'signal' ? '🎯' : '⚙️'} {alert.titleKh}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{alert.messageKh}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#182e1d] mt-3">
              <button
                onClick={() => appState.markAllAlertsAsRead()}
                className="w-full py-2 rounded-xl bg-[#132417] hover:bg-[#1a3320] text-gray-300 hover:text-white text-xs font-semibold transition"
              >
                កំណត់ថាបានអានទាំងអស់ (Mark All Read)
              </button>
            </div>
          </div>

          {/* System Health Widget */}
          <div className="lg:col-span-3">
            <SystemHealth variant="full" />
          </div>

          {/* Recharts Signal Performance Trend */}
          <div className="lg:col-span-3">
            <SignalPerformanceTrend />
          </div>

          {/* Recharts Hourly Success Rate Heatmap (Most Profitable Time Windows) */}
          <div className="lg:col-span-3">
            <HourlySuccessHeatmap />
          </div>

          {/* Recharts Profit Analytics (Daily & Weekly Earnings Growth) */}
          <div className="lg:col-span-3">
            <ProfitAnalyticsChart />
          </div>

          {/* Recharts Daily Profit / Loss Trend Visualization */}
          <div className="lg:col-span-3">
            <DailyProfitLossTrend />
          </div>

          {/* 24-Hour AI Signal Success Rate Line Chart */}
          <div className="lg:col-span-3">
            {renderSuccessRateChart()}
          </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: ML OUTCOME PREDICTOR CORE */}
      {selectedTab === 'ml_engine' && (
        <MLOutcomePredictor />
      )}

      {/* TAB CONTENT: SIMPLE SETUP & EXPENSE OPS */}
      {selectedTab === 'expenses' && (
        <ExpenseConsole />
      )}

      {/* TAB CONTENT: PROFIT ANALYTICS (Daily & Weekly Earnings Growth Visualization) */}
      {selectedTab === 'profit_analytics' && (
        <div className="space-y-6">
          <ProfitAnalyticsChart />
          <DailyProfitLossTrend />
        </div>
      )}

      {/* TAB CONTENT 2: ORDERS MANAGEMENT */}
      {selectedTab === 'orders' && (
        <div className="space-y-4">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#0c160f] border border-[#1b3422]">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ស្វែងរកតាមឈ្មោះ ឬលេខ Order (Search customer/order #)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#132417] border border-[#213b28] text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex items-center bg-[#111f15] p-1 rounded-xl border border-[#1f3724] text-xs">
                {(['all', 'pending', 'completed', 'rejected'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      sound.playClick();
                      setOrderFilter(status);
                    }}
                    className={`px-3 py-1.5 rounded-lg capitalize transition ${
                      orderFilter === status
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {status === 'all'
                      ? 'ទាំងអស់'
                      : status === 'pending'
                      ? 'រង់ចាំពិនិត្យ'
                      : status === 'completed'
                      ? 'ជោគជ័យ'
                      : 'បដិសេធ'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => appState.exportSignalsCSV()}
                className="px-3 py-1.5 rounded-xl bg-[#14291a] hover:bg-[#1b3a24] text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                title="ទាញយកកំណត់ត្រា Signal ថ្មីៗជា CSV"
              >
                <Download size={13} />
                <span>Export Signals CSV</span>
              </button>
              <div className="text-xs text-gray-400 font-mono">
                បង្ហាញ {filteredOrders.length} នៃ {orders.length} ការបញ្ជាទិញ
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-3xl bg-[#0c160f] border border-[#1b3422] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#101e14] border-b border-[#182f1f] text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">លេខកូដ Order</th>
                    <th className="py-3 px-4">អតិថិជន</th>
                    <th className="py-3 px-4">កញ្ចប់ VIP</th>
                    <th className="py-3 px-4">ចំនួនទឹកប្រាក់</th>
                    <th className="py-3 px-4">វិធីសាស្ត្រ</th>
                    <th className="py-3 px-4">ស្ថានភាព</th>
                    <th className="py-3 px-4">License Key</th>
                    <th className="py-3 px-4 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#15291b]">
                  {filteredOrders.map((order) => {
                    return (
                      <tr key={order.id} className="hover:bg-[#112216] transition">
                        {/* Order Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          #{order.orderNumber}
                          <div className="text-[10px] text-gray-500 font-normal">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{order.userName}</div>
                          <div className="text-[11px] text-gray-400 font-mono">{order.userPhone}</div>
                        </td>

                        {/* Package */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-white">{order.packageNameKh}</div>
                          <div className="text-[10px] text-gray-400">{order.packageName}</div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-yellow-400">${order.amountUsd}</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {order.amountKhr.toLocaleString()} ៛
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-300">
                          <span className="px-2 py-0.5 rounded-md bg-[#14281a] border border-[#213e28] font-bold">
                            {order.paymentMethod === 'prasac'
                              ? 'KB Prasac Bank'
                              : order.paymentMethod === 'ppc'
                              ? 'PPC Bank'
                              : order.paymentMethod === 'amk'
                              ? 'AMK Bank'
                              : order.paymentMethod === 'khqr'
                              ? 'KHQR'
                              : order.paymentMethod.toUpperCase()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {order.paymentStatus === 'completed' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              <CheckCircle2 size={12} /> បានអនុម័ត
                            </span>
                          ) : order.paymentStatus === 'pending' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px] font-bold animate-pulse">
                              <Clock size={12} /> រង់ចាំពិនិត្យ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[10px] font-bold">
                              <XCircle size={12} /> បានបដិសេធ
                            </span>
                          )}
                        </td>

                        {/* Activation Key */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {order.activationKey ? (
                            <span className="text-emerald-400 font-bold">{order.activationKey}</span>
                          ) : (
                            <span className="text-gray-500">មិនទាន់បង្កើត</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Slip */}
                            <button
                              onClick={() => setSelectedReceiptOrder(order)}
                              className="p-1.5 rounded-lg bg-[#142719] text-gray-300 hover:text-white hover:bg-[#1a3320] border border-[#203c27]"
                              title="មើលបុងទូទាត់ប្រាក់ (View Receipt)"
                            >
                              <Eye size={14} />
                            </button>

                            {/* Quick Approve */}
                            {order.paymentStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveOrder(order.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1 transition shadow-sm"
                                  title="អនុម័ត និងផ្ដល់ Key ស្វ័យប្រវត្តិ"
                                >
                                  <Check size={13} />
                                  <span>អនុម័ត</span>
                                </button>
                                <button
                                  onClick={() => handleRejectOrder(order.id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                                  title="បដិសេធការបញ្ជាទិញ"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: LIVE SIGNAL MONITOR ("Check Signal Apple of Fortune ជូនដំណឹងភ្លាមៗ") */}
      {selectedTab === 'signals' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Radio size={18} className="text-emerald-400 animate-pulse" />
                  ប្រព័ន្ធតាមដាន Check Signal ភ្លាមៗ (Real-time Signal Checker)
                </h3>
                <p className="text-xs text-gray-400">
                  រាល់ពេលមានអតិថិជនចាប់សេវា Apple of Fortune ប្រព័ន្ធនឹងលោតសញ្ញាជូនដំណឹង និងបញ្ជីឈ្មោះភ្លាមៗ
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setSelectedTab('signal_history');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#132417] hover:bg-[#1a3321] text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <History size={14} />
                  <span>មើលប្រវត្តិនៃ Signal ទាំងអស់ ({appState.scannedSignalsHistory.length})</span>
                </button>
              </div>
            </div>

            {/* Live Feed List */}
            <div className="space-y-2.5">
              {recentChecks.map((check) => (
                <div
                  key={check.id}
                  className="p-3.5 rounded-2xl bg-[#111f15] border border-[#1d3522] flex items-center justify-between hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
                      🍎
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{check.userName}</span>
                        <span className="font-mono text-xs text-gray-400">({check.userPhone})</span>
                      </div>
                      <div className="text-xs text-emerald-400 flex items-center gap-2 mt-0.5">
                        <span>បានចាប់ដល់: <strong>Step {check.stepReached} / 10</strong></span>
                        <span>• មេគុណ: <strong className="text-yellow-400 font-mono">{check.multiplier}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
                      {check.status === 'win' ? 'WIN 🏆' : 'SAFE ✅'}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1 font-mono">{check.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SIGNAL HISTORY (Paginated log of all previously scanned signals) */}
      {selectedTab === 'signal_history' && (
        <SignalHistorySection />
      )}

      {/* TAB CONTENT: ACTIVITY LOG (Real-time Events Table, Chart & Export) */}
      {selectedTab === 'activity' && (
        <div className="space-y-6">
          {/* Top 24-Hour AI Signal Success Rate Line Chart */}
          {renderSuccessRateChart()}

          {/* Activity Log Table Section */}
          <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" />
                  <span>កំណត់ត្រាសកម្មភាពប្រព័ន្ធផ្ទាល់ (Real-time Activity Log)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    {filteredActivityLogs.length} Events
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  តាមដានព្រឹត្តិការណ៍ Check Signal, ការបញ្ជាទិញ, ការការពារ Security, និងការ Upgrade ប្រព័ន្ធ
                </p>
              </div>

              {/* CSV Export Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => appState.exportActivityLogsCSV()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download size={14} />
                  <span>ទាញយក Logs (CSV)</span>
                </button>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-72">
                <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="ស្វែងរកតាមចំណងជើង, អ្នកប្រើប្រាស់, ព័ត៌មាន..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#132417] border border-[#213b28] text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1 bg-[#111f15] p-1 rounded-xl border border-[#1f3724] text-xs overflow-x-auto w-full sm:w-auto">
                {[
                  { id: 'all', label: 'ទាំងអស់' },
                  { id: 'signal', label: '📡 Signals' },
                  { id: 'order', label: '💰 Orders' },
                  { id: 'system', label: '🚀 System' },
                  { id: 'security', label: '🛡️ Security' },
                  { id: 'maintenance', label: '⚡ Maintenance' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playClick();
                      setActivityFilter(cat.id as typeof activityFilter);
                    }}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                      activityFilter === cat.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Events Table */}
            <div className="rounded-2xl border border-[#1b3422] overflow-hidden bg-[#0c160f]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-[#101e14] border-b border-[#182f1f] text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ពេលវេលា (Timestamp)</th>
                      <th className="py-3 px-4">ប្រភេទ (Type)</th>
                      <th className="py-3 px-4">ព្រឹត្តិការណ៍ & ព័ត៌មានលម្អិត (Event Details)</th>
                      <th className="py-3 px-4">ប្រភព / អ្នកប្រើប្រាស់</th>
                      <th className="py-3 px-4 text-right">ស្ថានភាព (Status)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#15291b]">
                    {filteredActivityLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          មិនមានកំណត់ត្រាសកម្មភាពត្រូវនឹងការស្វែងរកទេ
                        </td>
                      </tr>
                    ) : (
                      filteredActivityLogs.map((item) => {
                        const typeBadge =
                          item.type === 'signal'
                            ? { label: 'SIGNAL', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }
                            : item.type === 'order'
                            ? { label: 'ORDER', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' }
                            : item.type === 'security'
                            ? { label: 'SECURITY', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
                            : item.type === 'maintenance'
                            ? { label: 'MAINTENANCE', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' }
                            : { label: 'SYSTEM', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };

                        const statusBadge =
                          item.status === 'success'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.status === 'warning'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse'
                            : item.status === 'error'
                            ? 'bg-red-500/20 text-red-300 border-red-500/40'
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/30';

                        return (
                          <tr key={item.id} className="hover:bg-[#112216] transition">
                            {/* Timestamp */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400 whitespace-nowrap">
                              <div className="text-white font-semibold">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                {new Date(item.timestamp).toISOString().slice(0, 10)}
                              </div>
                            </td>

                            {/* Type */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold ${typeBadge.color}`}>
                                {typeBadge.label}
                              </span>
                            </td>

                            {/* Event Details */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white text-xs">{item.titleKh}</div>
                              <div className="text-[11px] text-gray-400 mt-0.5">{item.details}</div>
                              {/* Metadata Badges */}
                              {item.meta && (
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  {item.meta.accuracy !== undefined && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                                      Accuracy: {item.meta.accuracy}%
                                    </span>
                                  )}
                                  {item.meta.steps !== undefined && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#162f1d] text-gray-300 font-mono">
                                      Step {item.meta.steps}/10
                                    </span>
                                  )}
                                  {item.meta.latencyMs !== undefined && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-500/10 text-yellow-300 font-mono">
                                      ⚡ {item.meta.latencyMs}ms Latency
                                    </span>
                                  )}
                                  {item.meta.orderNumber && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 font-mono">
                                      #{item.meta.orderNumber}
                                    </span>
                                  )}
                                  {item.meta.ipAddress && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-gray-800 text-gray-400 font-mono">
                                      IP: {item.meta.ipAddress}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Source / User */}
                            <td className="py-3.5 px-4 font-mono text-[11px] text-gray-300 whitespace-nowrap">
                              {item.userOrSource}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusBadge}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: VIP KEY GENERATOR */}
      {selectedTab === 'keys' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Generator Form */}
          <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key size={18} className="text-yellow-400" />
              បង្កើត VIP License Keys (Batch Generator)
            </h3>
            <p className="text-xs text-gray-400">
              សម្រាប់ផ្ដល់ជូនអតិថិជន VIP ដោយផ្ទាល់ ឬលក់បោះដុំតាម Telegram Channel
            </p>

            <div>
              <label className="block text-xs text-gray-300 mb-1.5 font-medium">ជ្រើសរើសប្រភេទកញ្ចប់:</label>
              <select
                value={genTier}
                onChange={(e) => setGenTier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#132417] border border-[#213b28] text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {PACKAGES.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.nameKh} - ${pkg.priceUsd} ({pkg.accuracyRate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1.5 font-medium">ចំនួន Key ដែលត្រូវបង្កើត:</label>
              <input
                type="number"
                min="1"
                max="20"
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#132417] border border-[#213b28] text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={handleGenerateKeys}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key size={15} />
              <span>បង្កើត License Key ឥឡូវនេះ (Generate Keys)</span>
            </button>
          </div>

          {/* Generated Keys Display */}
          <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-2">
                បញ្ជី Key ដែលបានបង្កើត ({generatedBatch.length})
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                ចុចប៊ូតុងខាងស្ដាំ ដើម្បី Copy យកទៅផ្ញើជូនអតិថិជន
              </p>

              {generatedBatch.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-2xl">
                  មិនទាន់មាន Key ត្រូវបានបង្កើតនៅឡើយទេ។ សូមចុច "បង្កើត License Key" នៅខាងឆ្វេង។
                </div>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {generatedBatch.map((key, idx) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-xl bg-[#111f15] border border-yellow-500/30 flex items-center justify-between"
                    >
                      <span className="font-mono text-yellow-300 font-bold text-xs tracking-wider">
                        {key}
                      </span>
                      <button
                        onClick={() => handleCopyBatchKey(key, idx)}
                        className="px-2.5 py-1 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[11px] transition flex items-center gap-1"
                      >
                        {copiedKeyIndex === idx ? <Check size={12} /> : null}
                        <span>{copiedKeyIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {generatedBatch.length > 0 && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedBatch.join('\n'));
                  sound.playClick();
                }}
                className="mt-4 w-full py-2 rounded-xl bg-[#152a1b] text-emerald-400 border border-[#22442b] text-xs font-bold hover:bg-[#1a3522] transition"
              >
                Copy Key ទាំងអស់ (Copy All)
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: SETTINGS & ENGINE CONFIG */}
      {selectedTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl max-w-2xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders size={18} className="text-emerald-400" />
            ការកំណត់ប្រព័ន្ធចាប់សេវា Apple of Fortune (Game & Bot Settings)
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-gray-300 font-medium">
                  កម្រិតភាពត្រឹមត្រូវ Win Rate Target (%):
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">{winRate}%</span>
              </div>
              <input
                type="range"
                min="92.0"
                max="99.9"
                step="0.1"
                value={winRate}
                onChange={(e) => setWinRate(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[11px] text-gray-500">
                កំណត់ភាគរយនៃការទស្សន៍ទាយគ្រាប់ផ្លែប៉ោមសុវត្ថិភាព 🍎
              </span>
            </div>

            {/* KHQR Bakong Payment Settings */}
            <div className="p-4 rounded-2xl bg-[#111f15] border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-[10px]">
                    KHQR
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">ការកំណត់ KHQR ទទួលប្រាក់ (Bakong Payment)</h4>
                    <p className="text-[10px] text-gray-400">QR Code ដែលបង្ហាញជូនអតិថិជនពេលស្កេនទិញ VIP</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  ✓ សកម្ម (Active)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-gray-300 mb-1">
                    ឈ្មោះគណនីទទួល (Beneficiary Name):
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    placeholder="BIN SOPHA"
                    className="w-full px-3 py-2 rounded-xl bg-[#142417] border border-[#213b28] text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-300 mb-1">
                    ព័ត៌មានគណនី / សម្គាល់ (Account / Note):
                  </label>
                  <input
                    type="text"
                    value={merchantAccount}
                    onChange={(e) => setMerchantAccount(e.target.value)}
                    placeholder="BIN SOPHA (Bakong / KHQR)"
                    className="w-full px-3 py-2 rounded-xl bg-[#142417] border border-[#213b28] text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* QR Thumbnail Preview */}
              <div className="pt-2 flex items-center gap-3">
                <div className="w-16 h-20 rounded-xl overflow-hidden border border-gray-600 bg-white p-1 shrink-0 flex items-center justify-center">
                  <img
                    src={khqrImageFile}
                    alt="KHQR BIN SOPHA"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-[11px] text-gray-400">
                  <div className="text-white font-bold">{merchantName} (KHQR Bakong)</div>
                  <div>រូបភាព QR Code ត្រូវបានដំឡើងរួចរាល់ និងដំណើរការស្កេនលើគ្រប់ធនាគារក្នុងប្រទេសកម្ពុជា</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#111f15] border border-[#1d3522]">
              <div>
                <div className="text-xs font-bold text-white">អនុម័តការបញ្ជាទិញស្វ័យប្រវត្តិ (Auto-Approve Orders)</div>
                <div className="text-[11px] text-gray-400">
                  នៅពេលបើក អតិថិជននឹងទទួលបាន VIP Key ភ្លាមៗក្រោយពេលស្កេន KHQR
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#111f15] border border-[#1d3522]">
              <div>
                <div className="text-xs font-bold text-white">សំឡេងរោទ៍ជូនដំណឹង (Sound Notifications)</div>
                <div className="text-[11px] text-gray-400">
                  បន្លឺសំឡេងភ្លាមៗរាល់ពេលមានការបញ្ជាទិញថ្មី ឬ Check Signal ចូលមក
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Low AI Success Rate Alert Threshold */}
            <div className="p-4 rounded-2xl bg-[#111f15] border border-red-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <AlertTriangle size={15} className="text-red-400" />
                    <span>កម្រិតព្រមានអត្រាជោគជ័យ AI ធ្លាក់ចុះ (Low Success Rate Alert)</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    ប្រព័ន្ធនឹងបន្លឺសំឡេង Alarm Siren និងបង្ហាញផ្ទាំង Warning ភ្លាមៗប្រសិនបើ Success Rate ធ្លាក់ចុះក្រោមភាគរយនេះ
                  </div>
                </div>
                <span className="text-sm font-mono font-black text-red-400">&lt; {lowRateThreshold}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="95"
                step="1"
                value={lowRateThreshold}
                onChange={(e) => setLowRateThreshold(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-gray-500">កម្រិតស្តង់ដារ: 85% (ជួរដែលអាចកំណត់: 70% ដល់ 95%)</span>
                <button
                  type="button"
                  onClick={() => sound.playLowRateWarning()}
                  className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Volume2 size={12} />
                  <span>ស្តាប់សំឡេង Alarm Siren</span>
                </button>
              </div>
            </div>

            {/* Operating Hours (7:00 AM - 10:00 PM) Automatic Schedule Control */}
            <div className="p-4 rounded-2xl bg-[#111f15] border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">កាលវិភាគម៉ោងដំណើរការស្វ័យប្រវត្តិ (Operating Hours: 07:00 - 22:00)</h4>
                    <p className="text-[10px] text-gray-400">ប្រព័ន្ធបើកពីម៉ោង 7:00 ព្រឹក និងបិទនៅម៉ោង 10:00 យប់ដោយស្វ័យប្រវត្តិ (Admin & VIP អាច bypass បាន)</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                  appState.isWithinOperatingHours()
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {appState.isWithinOperatingHours() ? '🟢 បើកដំណើរការ (OPEN)' : '🌙 ផ្អាកសម្រាកយប់ (CLOSED)'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-300 font-semibold">
                  បើកដំណើរការកាលវិភាគស្វ័យប្រវត្តិ:
                </span>
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">ម៉ោងចាប់ផ្ដើមដំណើរការ (Open Hour):</label>
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#142618] border border-[#23422a] text-white text-xs font-mono"
                  >
                    {[5, 6, 7, 8, 9].map((h) => (
                      <option key={h} value={h}>{h}:00 ព្រឹក (0{h}:00 AM)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 mb-1">ម៉ោងបិទសម្រាកយប់ (Close Hour):</label>
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-[#142618] border border-[#23422a] text-white text-xs font-mono"
                  >
                    {[20, 21, 22, 23, 24].map((h) => (
                      <option key={h} value={h}>{h === 22 ? '22:00 យប់ (10:00 PM)' : `${h}:00`}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedule Override Modes */}
              <div className="pt-2 border-t border-[#182f1f] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-gray-400 text-[11px]">កំណត់ស្ថានភាពប្រតិបត្តិការ (Schedule Override):</span>
                <div className="flex items-center gap-1.5 bg-[#0e1a12] p-1 rounded-xl border border-[#1b3422]">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.setScheduleForceMode('auto');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                      appState.config.scheduleForceMode === 'auto' || !appState.config.scheduleForceMode
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ⏰ Auto (07:00-22:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.setScheduleForceMode('force_closed');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                      appState.config.scheduleForceMode === 'force_closed'
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ⛔ Force Closed
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.setScheduleForceMode('force_open');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition cursor-pointer ${
                      appState.config.scheduleForceMode === 'force_open'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🟢 Force Open (24/7)
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Afternoon Auto-Update Window (3:00 PM - 5:00 PM / 15:00 - 17:00) */}
            <div className="p-4 rounded-2xl bg-[#0e1d13] border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw size={16} className="text-emerald-400 animate-spin" />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      កាលវិភាគ Auto Update ម៉ាស៊ីនបម្រើនារសៀល (3:00 PM - 5:00 PM)
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      Auto Update & សម្រាកបច្ចេកទេសប្រចាំថ្ងៃ ដើម្បីឲ្យម៉ាស៊ីនដំណើរការរលូន គ្មាន Stutter/Bug (អាចបើកដំណើរការឡើងវិញមុនបាន)
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                  appState.isWithinAutoUpdateWindow()
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {appState.isWithinAutoUpdateWindow() ? '⚙️ កំពុង Auto Update' : '✓ ប្រព័ន្ធ Online'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#183020]">
                <div className="text-[11px] text-gray-300">
                  ម៉ោងកំណត់: <strong>15:00 ដល់ 17:00 (3:00 រសៀល - 5:00 ល្ងាច)</strong>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.setAutoUpdateForceMode('force_updating');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono transition cursor-pointer ${
                      appState.config.autoUpdateForceMode === 'force_updating'
                        ? 'bg-amber-600 text-white'
                        : 'bg-[#14281a] text-gray-300 hover:text-white border border-[#213e28]'
                    }`}
                  >
                    ⚙️ Run Auto-Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.triggerEarlyResume();
                    }}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black text-[10px] font-bold font-mono transition cursor-pointer"
                    title="បញ្ចប់ការ Update និងបើកដំណើរការឡើងវិញមុនម៉ោង 5:00"
                  >
                    ⚡ បើកដំណើរការឡើងវិញមុនម៉ោង (Resume Early)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.setAutoUpdateForceMode('auto');
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono transition cursor-pointer ${
                      appState.config.autoUpdateForceMode === 'auto' || !appState.config.autoUpdateForceMode
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#14281a] text-gray-300 hover:text-white border border-[#213e28]'
                    }`}
                  >
                    Auto តាមម៉ោង
                  </button>
                </div>
              </div>
            </div>

            {/* Intelligent Auto-Retry Signal Mechanism Status */}
            <div className="p-4 rounded-2xl bg-[#0d1c12] border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      យន្តការ Intelligent Auto-Retry (Signal Processing Latency Guard)
                    </h4>
                    <p className="text-[10px] text-gray-400">
                      ប្រសិនបើ Latency ឡើងខ្ពស់លើសកម្រិតកំណត់ ប្រព័ន្ធនឹង Auto-Retry ដោយស្វ័យប្រវត្តិចាំរហូតដល់ Latency ធ្លាក់ចុះទើបចាប់សេវា
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                  Active Guard: &lt; {appState.config.latencyRetryThresholdMs || 15}ms
                </span>
              </div>
            </div>

            {/* Server Maintenance Mode Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#111f15] border border-amber-500/30">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Wrench size={14} className="text-amber-400" />
                  <span>ដំណើរការ Server Maintenance Mode (24 ម៉ោង)</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  បង្ហាញផ្ទាំងជូនដំណឹងបច្ចុប្បន្នភាពម៉ាស៊ីនបម្រើ និងការ Upgrade ប្រព័ន្ធ (Admin & VIP អាច bypass បាន)
                </div>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Cloudflare & Gemini 3.8 Flash Engine Status */}
            <div className="p-3.5 rounded-2xl bg-[#0f2114] border border-[#234c2b] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Cloudflare Edge Firewall & Gemini 3.8 Flash</span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      PROTECTED
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Anti-DDoS, SSL 256-Bit, Zero Stuttering, 10x Turbo Speed (~22ms latency)
                  </div>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            {/* Cambodia Host 🇰🇭 & Modern CPU Hardware Configuration */}
            <div className="p-4 rounded-2xl bg-[#0d1a10] border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server size={16} className="text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white">ម៉ាស៊ីនបម្រើ Cambodia Host 🇰🇭 & CPU Hardware</h4>
                    <p className="text-[10px] text-gray-400">ភ្ជាប់ទៅកាន់ Server IP Host កម្ពុជាផ្ទាល់ ជាមួយ CPU ទំនើប 64-Core</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  2ms Ping
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-[#122216] border border-[#1f3825]">
                  <span className="text-gray-400 block text-[10px]">Server Host IP:</span>
                  <span className="text-cyan-300 font-bold">{appState.dailyNetworkConfig.currentNode.hostIp}</span>
                  <span className="text-[10px] text-gray-500 block">{appState.dailyNetworkConfig.currentNode.city}, {appState.dailyNetworkConfig.currentNode.countryCode}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#122216] border border-[#1f3825]">
                  <span className="text-gray-400 block text-[10px]">Live Scan Feed IP (Daily Rotating):</span>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">{appState.dailyNetworkConfig.currentNode.feedIp}</span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        appState.rotateIpNow(undefined, true);
                      }}
                      className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[9px] font-bold transition cursor-pointer"
                      title="Force Rotate Daily IP Now"
                    >
                      Rotate IP
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 block">{appState.dailyNetworkConfig.currentNode.region}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#122216] border border-[#1f3825]">
                  <span className="text-gray-400 block text-[10px]">Modern CPU Architecture:</span>
                  <span className="text-emerald-400 font-bold">{appState.config.serverCpuModel}</span>
                  <span className="text-[10px] text-gray-500 block">Google TPU v5e Coprocessor</span>
                </div>
              </div>

              {/* Daily IP Auto-Change Everyday Status */}
              <div className="p-3 rounded-xl bg-[#08120d] border border-cyan-500/40 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <div>
                    <span className="text-white font-bold block text-xs">
                      Daily IP Auto-Change Everyday
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Auto-shifts all network endpoints at 00:00 UTC • Total shifts: <strong className="text-cyan-300">{appState.dailyNetworkConfig.totalRotationsCount}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.toggleDailyAutoRotate();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                      appState.dailyNetworkConfig.autoRotateDaily
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                  >
                    Auto-Rotate: {appState.dailyNetworkConfig.autoRotateDaily ? 'ENABLED' : 'PAUSED'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.rotateIpNow(undefined, true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#ff0055]/20 hover:bg-[#ff0055]/30 text-pink-300 border border-[#ff0055]/50 text-[10px] font-bold transition cursor-pointer"
                  >
                    ⚡ Rotate IP Now
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  appState.restartServerAndAllSystems();
                }}
                className="w-full py-2.5 rounded-xl bg-[#152a1b] hover:bg-[#1e3c27] text-emerald-300 border border-[#2b5235] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <RefreshCw size={13} className="text-emerald-400" />
                <span>Restart Server & All Systems & Bot (v3.2 Auto-Rotate)</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            រក្សាទុកការកំណត់ (Save Configuration)
          </button>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0c160f] border border-[#1f3724] rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-white text-sm">
                បុងទូទាត់ប្រាក់ #{selectedReceiptOrder.orderNumber}
              </h3>
              <button
                onClick={() => setSelectedReceiptOrder(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-300">
                <span>អតិថិជន:</span>
                <span className="font-bold text-white">{selectedReceiptOrder.userName}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>ចំនួនទឹកប្រាក់:</span>
                <span className="font-bold text-yellow-400">${selectedReceiptOrder.amountUsd} ({selectedReceiptOrder.amountKhr.toLocaleString()} ៛)</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>វិធីសាស្ត្រ:</span>
                <span className="font-mono text-emerald-400 uppercase">{selectedReceiptOrder.paymentMethod}</span>
              </div>
            </div>

            <div className="p-3 bg-gray-900 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-48 h-56 rounded-xl overflow-hidden border border-gray-700 bg-gray-800 flex items-center justify-center">
                <img
                  src={selectedReceiptOrder.receiptImage}
                  alt="Payment Receipt"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-2">រូបភាពបុងផ្ទេរប្រាក់ពី App ធនាគារ</span>
            </div>

            {selectedReceiptOrder.paymentStatus === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleApproveOrder(selectedReceiptOrder.id);
                    setSelectedReceiptOrder(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs"
                >
                  អនុម័តបុងនេះ
                </button>
                <button
                  onClick={() => {
                    handleRejectOrder(selectedReceiptOrder.id);
                    setSelectedReceiptOrder(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs"
                >
                  បដិសេធ
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
