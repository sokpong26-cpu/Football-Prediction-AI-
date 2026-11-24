import React, { useState, useMemo } from 'react';
import {
  Radio,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Trophy,
  DollarSign,
  Clock,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Copy,
  Check,
  Server,
  Sparkles,
  RefreshCw,
  Eye,
  X,
} from 'lucide-react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import { ScannedSignalLog, SignalStrategy } from '../../types';

export const SignalHistorySection: React.FC = () => {
  const [, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [strategyFilter, setStrategyFilter] = useState<'all' | SignalStrategy>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'win' | 'cashout' | 'loss'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedSignal, setSelectedSignal] = useState<ScannedSignalLog | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const signals = appState.scannedSignalsHistory;

  // Filter signals
  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      // Strategy filter
      if (strategyFilter !== 'all' && s.strategy !== strategyFilter) {
        return false;
      }

      // Outcome filter (Win, Cashout, Loss)
      if (outcomeFilter === 'win' && !s.outcome.includes('WIN')) {
        return false;
      }
      if (outcomeFilter === 'cashout' && !s.outcome.includes('CASHOUT')) {
        return false;
      }
      if (outcomeFilter === 'loss' && (s.outcome.includes('WIN') || s.outcome.includes('CASHOUT'))) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchGame = s.gameId.toLowerCase().includes(q);
        const matchUser = s.userName.toLowerCase().includes(q);
        const matchPhone = (s.userPhone || '').includes(q);
        const matchHash = s.serverHash.toLowerCase().includes(q);
        const matchSeed = s.clientSeed.toLowerCase().includes(q);
        const matchServer = s.sourceServer.toLowerCase().includes(q);
        if (!matchGame && !matchUser && !matchPhone && !matchHash && !matchSeed && !matchServer) {
          return false;
        }
      }

      return true;
    });
  }, [signals, strategyFilter, outcomeFilter, searchQuery]);

  // Pagination calculation
  const totalItems = filteredSignals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentSignals = filteredSignals.slice(startIndex, endIndex);

  // Betting Performance Analytics on filtered results
  const winCount = filteredSignals.filter((s) => s.outcome.includes('WIN')).length;
  const cashoutCount = filteredSignals.filter((s) => s.outcome.includes('CASHOUT')).length;
  const winRatePercent = filteredSignals.length > 0
    ? Number((((winCount + cashoutCount) / filteredSignals.length) * 100).toFixed(1))
    : 100;
  const totalMultiplier = filteredSignals.reduce((acc, s) => acc + s.multiplierValue, 0);
  const avgMultiplier = filteredSignals.length > 0
    ? (totalMultiplier / filteredSignals.length).toFixed(1)
    : '0.0';
  const maxMultiplier = filteredSignals.length > 0
    ? Math.max(...filteredSignals.map((s) => s.multiplierValue))
    : 349.48;

  // Strategy badge UI helper
  const renderStrategyBadge = (strat: SignalStrategy) => {
    switch (strat) {
      case 'ultra_max':
        return (
          <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-yellow-500/40 text-yellow-300 font-mono text-[11px] font-bold flex items-center gap-1">
            <Zap size={11} className="text-yellow-400 fill-yellow-400" />
            <span>Ultra Max Real</span>
          </span>
        );
      case 'conservative':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-[11px] font-bold flex items-center gap-1">
            <Shield size={11} className="text-blue-400" />
            <span>Conservative</span>
          </span>
        );
      case 'balanced':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold flex items-center gap-1">
            <span>⚖️ Balanced</span>
          </span>
        );
      case 'aggressive':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-[11px] font-bold flex items-center gap-1">
            <span>🔥 Aggressive</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-gray-500/20 text-gray-300 text-[11px]">
            {strat}
          </span>
        );
    }
  };

  // Outcome badge UI helper
  const renderOutcomeBadge = (outcome: string, stepReached: number) => {
    if (outcome.includes('WIN')) {
      return (
        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600/30 to-green-500/20 border border-emerald-500/50 text-emerald-300 font-bold font-mono text-xs flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <Trophy size={13} className="text-yellow-400 fill-yellow-400" />
          <span>WIN (Step {stepReached}/10)</span>
        </span>
      );
    }
    if (outcome.includes('CASHOUT')) {
      return (
        <span className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-bold font-mono text-xs flex items-center gap-1.5">
          <DollarSign size={13} className="text-yellow-400" />
          <span>CASHOUT (Step {stepReached}/10)</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold font-mono text-xs flex items-center gap-1.5">
        <CheckCircle2 size={13} className="text-cyan-400" />
        <span>COMPLETED (Step {stepReached}/10)</span>
      </span>
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    sound.playClick();
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Radio size={20} className="text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>ប្រវត្តិនៃការចាប់ Signal ទាំងអស់ (Scanned Signal History Log)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/30">
                    {totalItems} Signals
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  កត់ត្រារាល់ Signal ដែលបាន scan រួចរាល់ រួមមាន ពេលវេលា (Timestamps), លទ្ធផល (Outcomes), និងយុទ្ធសាស្ត្រ (Strategy Used)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => appState.exportSignalHistoryCSV()}
              className="px-3.5 py-2 rounded-xl bg-[#132417] hover:bg-[#1a3321] text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download size={14} />
              <span>ទាញយក CSV</span>
            </button>
          </div>
        </div>

        {/* Betting Performance Filter Component */}
        <div className="pt-2 border-t border-[#182e1e] space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
            {/* Search Box */}
            <div className="md:col-span-4 relative">
              <Search size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="ស្វែងរក Game ID, ឈ្មោះ, Phone, Hash..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#111f15] border border-[#1f3724] text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Strategy Type Filter */}
            <div className="md:col-span-4 flex items-center gap-1 bg-[#111f15] p-1 rounded-xl border border-[#1f3724] text-xs overflow-x-auto">
              {[
                { id: 'all', label: 'គ្រប់ Strategy' },
                { id: 'ultra_max', label: '⚡ Ultra Max' },
                { id: 'balanced', label: '⚖️ Balanced' },
                { id: 'conservative', label: '🛡️ Consv' },
                { id: 'aggressive', label: '🔥 Aggr' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStrategyFilter(s.id as typeof strategyFilter);
                    setCurrentPage(1);
                    sound.playClick();
                  }}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer text-[11px] ${
                    strategyFilter === s.id
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Outcome Filter (Win / Cashout / Loss) */}
            <div className="md:col-span-4 flex items-center gap-1 bg-[#111f15] p-1 rounded-xl border border-[#1f3724] text-xs">
              {[
                { id: 'all', label: 'គ្រប់លទ្ធផល' },
                { id: 'win', label: '🏆 Wins' },
                { id: 'cashout', label: '💰 Cashout' },
                { id: 'loss', label: '❌ Losses' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setOutcomeFilter(o.id as typeof outcomeFilter);
                    setCurrentPage(1);
                    sound.playClick();
                  }}
                  className={`flex-1 py-1 rounded-lg transition text-center whitespace-nowrap cursor-pointer text-[11px] ${
                    outcomeFilter === o.id
                      ? 'bg-emerald-600 text-white font-bold shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Betting Performance Analytics Bar */}
          <div className="p-3 rounded-2xl bg-[#0e1c12] border border-[#1a3822] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4 text-gray-300">
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Filter size={13} className="text-emerald-400" />
                <span>ការវិភាគលទ្ធផល (Filtered Performance):</span>
              </span>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-gray-400 text-[11px]">Win Rate:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                  {winRatePercent}%
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-gray-400 text-[11px]">Total Wins:</span>
                <span className="text-white font-bold">
                  {winCount + cashoutCount} <span className="text-gray-500 font-normal">/ {filteredSignals.length}</span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-gray-400 text-[11px]">Avg Multiplier:</span>
                <span className="text-yellow-400 font-bold">
                  ×{avgMultiplier}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-gray-400 text-[11px]">Max Multiplier:</span>
                <span className="text-cyan-300 font-black">
                  ×{maxMultiplier}
                </span>
              </div>
            </div>

            {(strategyFilter !== 'all' || outcomeFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStrategyFilter('all');
                  setOutcomeFilter('all');
                  setSearchQuery('');
                  setCurrentPage(1);
                  sound.playClick();
                }}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold underline cursor-pointer"
              >
                សម្អាត Filter (Reset)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Paginated Signal Log Table */}
      <div className="rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1b3422] bg-[#0e1b12] text-gray-400 font-mono text-[11px]">
                <th className="py-3 px-4">Game ID / ពេល</th>
                <th className="py-3 px-4">អ្នកប្រើប្រាស់ (User)</th>
                <th className="py-3 px-4">យុទ្ធសាស្ត្រ (Strategy)</th>
                <th className="py-3 px-4">លទ្ធផល (Outcome)</th>
                <th className="py-3 px-4">មេគុណ / ជំហាន</th>
                <th className="py-3 px-4">ប្រភព Server / Hash</th>
                <th className="py-3 px-4 text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162a1c]">
              {currentSignals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Radio size={28} className="text-gray-600" />
                      <p className="font-medium">មិនមានទិន្នន័យ Signal ស្របតាមលក្ខខណ្ឌស្វែងរកនេះទេ</p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStrategyFilter('all');
                          setOutcomeFilter('all');
                        }}
                        className="text-xs text-emerald-400 underline hover:text-emerald-300 mt-1 cursor-pointer"
                      >
                        សម្អាតការស្វែងរក (Clear Filters)
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentSignals.map((signal) => (
                  <tr
                    key={signal.id}
                    className="hover:bg-[#122316] transition group cursor-pointer"
                    onClick={() => setSelectedSignal(signal)}
                  >
                    {/* Game ID & Timestamp */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-sm group-hover:text-emerald-400 transition">
                          {signal.gameId}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                          {signal.accuracy}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mt-0.5 font-mono">
                        <Clock size={11} className="text-gray-500" />
                        <span>{signal.timeFormatted}</span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-200 text-xs">
                        {signal.userName}
                      </div>
                      <div className="font-mono text-[11px] text-gray-400">
                        {signal.userPhone || '1xBet Feed'}
                      </div>
                    </td>

                    {/* Strategy */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderStrategyBadge(signal.strategy)}
                    </td>

                    {/* Outcome */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderOutcomeBadge(signal.outcome, signal.stepReached)}
                    </td>

                    {/* Multiplier & Step */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-yellow-400 text-sm">
                        {signal.multiplier}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Step: <strong className="text-emerald-400">{signal.stepReached} / 10</strong>
                      </div>
                    </td>

                    {/* Source Server & Hash snippet */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="text-[11px] text-gray-300 truncate font-mono">
                        {signal.sourceServer}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono mt-0.5">
                        <span className="truncate">Hash: {signal.serverHash.slice(0, 14)}...</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSignal(signal);
                          sound.playClick();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 mx-auto transition cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>មើលលម្អិត</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#182e1e] bg-[#0c160f] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-gray-400 font-mono text-[11px]">
            <span>
              បង្ហាញ <strong className="text-white">{totalItems > 0 ? startIndex + 1 : 0}</strong> ដល់{' '}
              <strong className="text-white">{endIndex}</strong> នៃសរុប{' '}
              <strong className="text-emerald-400">{totalItems}</strong> Signals
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 ml-2">
              <span>ទំព័រនីមួយៗ:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-[#111f15] border border-[#1f3724] rounded-lg px-2 py-1 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              onClick={() => {
                setCurrentPage(1);
                sound.playClick();
              }}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-[#1d3623] bg-[#112015] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="First Page"
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                sound.playClick();
              }}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded-lg border border-[#1d3623] bg-[#112015] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Current of Total */}
            <span className="px-3 py-1 font-mono text-gray-300 bg-[#142619] rounded-lg border border-[#1f3825] text-xs">
              ទំព័រ {safeCurrentPage} / {totalPages}
            </span>

            {/* Next Page */}
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                sound.playClick();
              }}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#1d3623] bg-[#112015] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>

            {/* Last Page */}
            <button
              onClick={() => {
                setCurrentPage(totalPages);
                sound.playClick();
              }}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#1d3623] bg-[#112015] text-gray-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              title="Last Page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0b160e] border border-[#1d3924] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#182e1e]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>ព័ត៌មានលម្អិត Signal {selectedSignal.gameId}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                      100% Real Max
                    </span>
                  </h4>
                  <p className="text-xs text-gray-400 font-mono">{selectedSignal.timeFormatted}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedSignal(null)}
                className="w-8 h-8 rounded-full bg-[#111f15] hover:bg-[#1a3321] text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#111f15] border border-[#1b3422]">
                  <div className="text-gray-400 text-[11px] mb-1">យុទ្ធសាស្ត្រ (Strategy)</div>
                  <div>{renderStrategyBadge(selectedSignal.strategy)}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#111f15] border border-[#1b3422]">
                  <div className="text-gray-400 text-[11px] mb-1">លទ្ធផល (Outcome)</div>
                  <div>{renderOutcomeBadge(selectedSignal.outcome, selectedSignal.stepReached)}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#111f15] border border-[#1b3422] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">អ្នកប្រើប្រាស់ (User):</span>
                  <span className="font-bold text-white">{selectedSignal.userName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">លេខទូរស័ព្ទ / ID:</span>
                  <span className="font-mono text-gray-300">{selectedSignal.userPhone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">កម្រិត VIP:</span>
                  <span className="font-mono text-yellow-400 font-bold uppercase">{selectedSignal.userVipTier || 'VIP'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">ជំហានសម្រេចបាន (Step):</span>
                  <span className="font-mono font-bold text-emerald-400">{selectedSignal.stepReached} / 10 Rows</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">មេគុណឈ្នះ (Multiplier):</span>
                  <span className="font-mono font-black text-yellow-400 text-sm">{selectedSignal.multiplier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">ប្រភព Server:</span>
                  <span className="font-mono text-[11px] text-gray-300">{selectedSignal.sourceServer}</span>
                </div>
              </div>

              {/* Server Hash and Seed */}
              <div className="p-3 rounded-xl bg-[#111f15] border border-[#1b3422] space-y-2">
                <div>
                  <div className="flex items-center justify-between text-gray-400 text-[11px] mb-1">
                    <span>SHA-256 Server Hash:</span>
                    <button
                      onClick={() => handleCopy(selectedSignal.serverHash)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {copiedHash === selectedSignal.serverHash ? (
                        <>
                          <Check size={12} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[10px] bg-[#0c160f] p-2 rounded-lg text-emerald-400/90 break-all select-all border border-[#182e1e]">
                    {selectedSignal.serverHash}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-gray-400 text-[11px] mb-1">
                    <span>Client Seed:</span>
                    <button
                      onClick={() => handleCopy(selectedSignal.clientSeed)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {copiedHash === selectedSignal.clientSeed ? (
                        <>
                          <Check size={12} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Seed</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-[10px] bg-[#0c160f] p-2 rounded-lg text-yellow-400/90 break-all select-all border border-[#182e1e]">
                    {selectedSignal.clientSeed}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={() => setSelectedSignal(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
              >
                បិទផ្ទាំង (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
