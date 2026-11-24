import React, { useCallback, useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  ShoppingCart,
  Award,
  RefreshCw,
  DollarSign,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { AdminSalesMetricsResponse } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { appState, PACKAGES } from '../../services/store';

export const RealtimeSalesSection: React.FC = () => {
  const { firebaseUser, isAdminVerified, getFreshToken, signInGoogle } = useAuth();
  const [liveMetrics, setLiveMetrics] = useState<AdminSalesMetricsResponse | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchMetrics = useCallback(async () => {
    if (!firebaseUser || !isAdminVerified) return;
    setIsFetching(true);
    try {
      const token = await getFreshToken();
      if (!token) return;
      const res = await fetch('/api/admin/sales-metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as AdminSalesMetricsResponse;
      setLiveMetrics(data);
      setLastFetchedAt(new Date().toLocaleTimeString());
    } catch {
      // Silently preserve previous snapshot until next interval tick
    } finally {
      setIsFetching(false);
    }
  }, [firebaseUser, isAdminVerified, getFreshToken]);

  useEffect(() => {
    if (!firebaseUser || !isAdminVerified) return;
    void fetchMetrics();
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      void fetchMetrics();
    }, 5000);
    return () => clearInterval(timer);
  }, [firebaseUser, isAdminVerified, autoRefresh, fetchMetrics]);

  // Compute local fallback snapshot when not yet signed in via Google Admin
  const localToday = appState.salesStats[appState.salesStats.length - 1];
  const localServiceCounts = PACKAGES.map((pkg) => {
    const matching = appState.orders.filter((o) => o.packageId === pkg.id);
    return {
      serviceName: pkg.name,
      orderCount: matching.length,
      revenueUsd: matching
        .filter((o) => o.paymentStatus === 'completed')
        .reduce((sum, o) => sum + o.amountUsd, 0),
    };
  }).sort((a, b) => b.orderCount - a.orderCount);

  const displayDailySales = liveMetrics?.totalDailySalesUsd ?? localToday?.revenueUsd ?? 0;
  const displayDailySalesKhr = liveMetrics?.totalDailySalesKhr ?? localToday?.revenueKhr ?? 0;
  const displayOrdersToday = liveMetrics?.ordersTodayCount ?? localToday?.ordersCount ?? 0;
  const displayTotalOrders = liveMetrics?.totalOrdersCount ?? appState.orders.length;
  const displayTopServices =
    liveMetrics && liveMetrics.topServices.length > 0
      ? liveMetrics.topServices
      : localServiceCounts;
  const maxServiceOrders = Math.max(
    1,
    ...displayTopServices.map((s) => s.orderCount)
  );

  const chartData =
    liveMetrics && liveMetrics.hourlyBreakdown.length > 0
      ? liveMetrics.hourlyBreakdown
      : appState.salesStats.slice(-7).map((s) => ({
          hour: s.date.slice(5),
          revenueUsd: s.revenueUsd,
          ordersCount: s.ordersCount,
        }));

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0d1c13] via-[#0a150e] to-[#08100b] border border-emerald-500/35 shadow-2xl space-y-5">
      {/* Header & Real-Time Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-lg font-black text-white tracking-tight">
              Real-Time Sales Performance
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
              {autoRefresh ? 'Auto-Updating (5s)' : 'Paused'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Live daily revenue, order volume, and most frequently ordered game services
            {lastFetchedAt ? ` • Last synced ${lastFetchedAt}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!firebaseUser ? (
            <button
              type="button"
              onClick={() => void signInGoogle()}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>Sign In Admin Live Sync</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setAutoRefresh((v) => !v)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  autoRefresh
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#122016] border-[#1f3a27] text-gray-400'
                }`}
              >
                {autoRefresh ? 'Live Feed: ON' : 'Live Feed: OFF'}
              </button>
              <button
                type="button"
                onClick={() => void fetchMetrics()}
                className="px-3 py-1.5 rounded-xl bg-[#13261a] hover:bg-[#1a3423] border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3 Primary Real-Time Sales KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#09120c] border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Total Daily Sales</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            ${displayDailySales.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-400 font-mono">
            {displayDailySalesKhr.toLocaleString()} ៛ • Live Today
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#09120c] border border-cyan-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Number of Orders</span>
            <ShoppingCart size={16} className="text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">
            {displayOrdersToday} <span className="text-sm text-gray-400 font-normal">today</span>
          </div>
          <div className="text-xs text-cyan-300 font-mono">
            {displayTotalOrders} Total Orders • {liveMetrics?.pendingOrdersCount ?? 0} Pending
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#09120c] border border-amber-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Top Game Service</span>
            <Award size={16} className="text-amber-400" />
          </div>
          <div className="text-lg font-black text-white truncate">
            {displayTopServices[0]?.serviceName || '7-Days Pro VIP'}
          </div>
          <div className="text-xs text-amber-300 font-mono">
            {displayTopServices[0]?.orderCount || 0} orders • $
            {(displayTopServices[0]?.revenueUsd || 0).toFixed(2)} revenue
          </div>
        </div>
      </div>

      {/* Chart + Most Frequently Ordered Game Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Live Revenue Chart */}
        <div className="lg:col-span-7 p-4 rounded-2xl bg-[#09120c] border border-[#193021] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <TrendingUp size={15} className="text-emerald-400" />
              <span>Live Sales Revenue Stream (USD)</span>
            </span>
            <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
              <Clock size={12} /> Auto-Synced
            </span>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#162b1c" />
                <XAxis dataKey="hour" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c160f',
                    borderColor: '#1f3b26',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenueUsd" name="Sales ($)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Frequently Ordered Game Services */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-[#09120c] border border-[#193021] space-y-3">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Award size={15} className="text-amber-400" />
            <span>Most Frequently Ordered Game Services</span>
          </h3>

          <div className="space-y-3">
            {displayTopServices.map((svc, idx) => {
              const pct = Math.round((svc.orderCount / maxServiceOrders) * 100);
              return (
                <div key={svc.serviceName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-200 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      {svc.serviceName}
                    </span>
                    <span className="font-mono text-emerald-300 text-[11px] font-bold">
                      {svc.orderCount} orders • ${svc.revenueUsd.toFixed(0)}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#122418] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500"
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
