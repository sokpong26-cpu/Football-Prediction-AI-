import React, { useState } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import { ExpenseItem, ServerScript, ScriptLogEntry } from '../../types';
import {
  Server,
  DollarSign,
  Play,
  RotateCw,
  Terminal,
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  Zap,
  TrendingUp,
  Cpu,
  Layers,
  HardDrive,
  Activity,
  X,
} from 'lucide-react';

export const ExpenseConsole: React.FC = () => {
  const [, setTick] = useState(0);
  const [runningScriptId, setRunningScriptId] = useState<string | null>(null);
  const [activeConsoleLog, setActiveConsoleLog] = useState<ScriptLogEntry | null>(
    appState.scriptLogs[0] || null
  );
  const [streamingLogLines, setStreamingLogLines] = useState<string[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Form state for adding an expense
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseItem['category']>('server_hosting');
  const [amountUsd, setAmountUsd] = useState('');
  const [recurrence, setRecurrence] = useState<ExpenseItem['recurrence']>('monthly');
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');

  const expenses = appState.expenses;
  const scripts = appState.serverScripts;
  const scriptLogs = appState.scriptLogs;

  // Revenue vs Expense Calculations
  const totalMonthlyExpenses = expenses.reduce((acc, curr) => {
    if (curr.recurrence === 'monthly') return acc + curr.amountUsd;
    if (curr.recurrence === 'yearly') return acc + curr.amountUsd / 12;
    return acc;
  }, 0);

  const totalRevenueUsd = appState.salesStats.reduce((acc, s) => acc + s.revenueUsd, 0);
  const netProfit = Math.max(0, totalRevenueUsd - totalMonthlyExpenses);
  const marginPct = totalRevenueUsd > 0 ? ((netProfit / totalRevenueUsd) * 100).toFixed(1) : '0';

  const handleRunScript = async (script: ServerScript) => {
    sound.playClick();
    setRunningScriptId(script.id);
    setStreamingLogLines([]);

    try {
      const result = await appState.runServerScript(script.id, (line) => {
        setStreamingLogLines((prev) => [...prev, line]);
      });
      setActiveConsoleLog(result);
      sound.playCompleteFanfare();
    } catch {
      sound.playError();
    } finally {
      setRunningScriptId(null);
      setTick((t) => t + 1);
    }
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amountUsd);
    if (!title.trim() || isNaN(num) || num <= 0) {
      sound.playError();
      return;
    }

    sound.playClick();
    appState.addExpense({
      title: title.trim(),
      category,
      amountUsd: num,
      recurrence,
      provider: provider.trim() || 'Custom Provider',
      status: 'paid',
      dueDate: new Date().toISOString().split('T')[0],
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setAmountUsd('');
    setProvider('');
    setNotes('');
    setIsAddExpenseOpen(false);
    setTick((t) => t + 1);
  };

  const handleDeleteExpense = (id: string) => {
    sound.playClick();
    appState.deleteExpense(id);
    setTick((t) => t + 1);
  };

  const handleToggleStatus = (item: ExpenseItem) => {
    sound.playClick();
    const nextStatus = item.status === 'paid' ? 'due' : 'paid';
    appState.updateExpense(item.id, { status: nextStatus });
    setTick((t) => t + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Simple Setup & Update Expensive / Server Ops */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1624] via-[#0b141d] to-[#070d14] border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>SERVER OPS CONSOLE</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold">
                CyderShield V3.1 Beta
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
                Smooth 100% Security
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Simple Setup &amp; Update Console</span>
              <span className="text-cyan-400 text-lg font-mono">⚡ {appState.dailyNetworkConfig.currentNode.hostIp}</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
              One-click server deployment scripts, zero-downtime updates, live WebSocket handshake benchmarks to feed <span className="text-emerald-400 font-mono font-bold">{appState.dailyNetworkConfig.currentNode.feedIp}</span> ({appState.dailyNetworkConfig.currentNode.region}), and daily rotating proxy infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <a
              href="https://t.me/Sokpong168"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => sound.playClick()}
              className="w-full lg:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#00b0ff] to-[#0081cb] hover:brightness-110 text-white font-bold text-xs tracking-wider transition shadow-lg flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Send size={15} />
              <span>Contact @Sokpong168</span>
            </a>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsAddExpenseOpen(true);
              }}
              className="w-full lg:w-auto px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus size={15} />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row: Expense vs Revenue vs Profit Margin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Expenses */}
        <div className="p-5 rounded-2xl bg-[#09111c] border border-cyan-900/40 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold">Monthly Operational Burn</span>
            <HardDrive size={18} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${totalMonthlyExpenses.toFixed(2)}
          </div>
          <div className="text-[11px] text-cyan-400/80 mt-1 flex items-center gap-1">
            <span>5 Active Nodes &amp; Proxies</span>
          </div>
        </div>

        {/* Total Sales Revenue */}
        <div className="p-5 rounded-2xl bg-[#09111c] border border-emerald-900/40 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold">Total VIP Revenue</span>
            <DollarSign size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${totalRevenueUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>High Margin License Sales</span>
          </div>
        </div>

        {/* Net Profit Margin */}
        <div className="p-5 rounded-2xl bg-[#09111c] border border-purple-900/40 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold">Net Operational Profit</span>
            <Zap size={18} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 font-mono">
            +${netProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-purple-300/80 mt-1 font-mono">
            {marginPct}% Net Profit Ratio
          </div>
        </div>

        {/* Upstream Feed Node Telemetry */}
        <div className="p-5 rounded-2xl bg-[#09111c] border border-cyan-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span className="font-bold">Live Feed Ping ({appState.dailyNetworkConfig.currentNode.feedIp.split(':')[0]})</span>
            <Activity size={18} className="text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            {appState.dailyNetworkConfig.currentNode.latencyMs} ms
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>2,180 pkts/s • Daily Auto-Rotated</span>
          </div>
        </div>
      </div>

      {/* Section: Simple Setup & Script Automation Runners */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Terminal size={18} className="text-cyan-400" />
            <span>Automation Scripts (One-Click Operations)</span>
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            Node: {appState.dailyNetworkConfig.currentNode.hostIp} ({appState.dailyNetworkConfig.currentNode.city})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scripts.map((scr) => {
            const isRunning = runningScriptId === scr.id;
            return (
              <div
                key={scr.id}
                className="p-5 rounded-2xl bg-[#08121d] border border-cyan-900/40 hover:border-cyan-500/50 transition-all shadow-md flex flex-col justify-between gap-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                        {scr.filename}
                      </span>
                      {scr.filename.endsWith('.py') && (
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          PYTHON 3
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1 ${
                        scr.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : scr.status === 'running'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {scr.status === 'running' ? (
                        <RotateCw size={10} className="animate-spin text-yellow-300" />
                      ) : (
                        <CheckCircle size={10} className="text-emerald-400" />
                      )}
                      <span>{scr.status}</span>
                    </span>
                  </div>

                  <h4 className="font-black text-white text-base group-hover:text-cyan-300 transition-colors">
                    {scr.name}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {scr.description}
                  </p>
                  <div className="p-2 rounded-lg bg-black/50 border border-gray-800 font-mono text-[11px] text-gray-400 truncate">
                    $ {scr.command}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-cyan-950 text-xs">
                  <span className="text-gray-500 font-mono text-[10px]">
                    Last run: {scr.lastExecutedAt ? new Date(scr.lastExecutedAt).toLocaleTimeString() : 'Never'}
                  </span>
                  <button
                    type="button"
                    disabled={isRunning}
                    onClick={() => handleRunScript(scr)}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 active:scale-95 text-black font-black text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <RotateCw size={13} className="animate-spin" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} fill="currentColor" />
                        <span>Run Script</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Output Viewer */}
      {(streamingLogLines.length > 0 || activeConsoleLog) && (
        <div className="rounded-2xl bg-[#040810] border border-cyan-500/40 shadow-2xl overflow-hidden font-mono text-xs">
          <div className="px-4 py-2.5 bg-[#0a1220] border-b border-cyan-900/50 flex items-center justify-between text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-cyan-300 font-bold ml-2">
                Console Terminal Output: {activeConsoleLog?.scriptName || 'Running Script'}
              </span>
            </div>
            {activeConsoleLog && (
              <span className="text-[11px] text-emerald-400 font-bold">
                Exit Code: {activeConsoleLog.exitCode} ({activeConsoleLog.durationMs}ms)
              </span>
            )}
          </div>
          <div className="p-4 max-h-64 overflow-y-auto space-y-1 text-cyan-200/90 leading-relaxed select-text">
            {streamingLogLines.length > 0
              ? streamingLogLines.map((line, idx) => (
                  <div key={idx} className="font-mono">
                    {line}
                  </div>
                ))
              : activeConsoleLog?.output.map((line, idx) => (
                  <div key={idx} className="font-mono">
                    {line}
                  </div>
                ))}
          </div>
        </div>
      )}

      {/* Infrastructure Expense Breakdown Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            <span>Infrastructure Expenses &amp; Hardware Subscriptions</span>
          </h3>
          <span className="text-xs text-gray-400">
            Total Monthly: <strong className="text-white">${totalMonthlyExpenses.toFixed(2)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-cyan-950 bg-[#070e17] shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1624] text-gray-400 uppercase font-mono tracking-wider border-b border-cyan-950">
              <tr>
                <th className="py-3 px-4">Item &amp; Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Cost (USD)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-950/60 text-gray-300 font-mono">
              {expenses.map((item) => (
                <tr key={item.id} className="hover:bg-cyan-950/20 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-white">
                    <div>{item.title}</div>
                    {item.notes && (
                      <div className="text-[11px] text-gray-500 font-mono font-normal mt-0.5">
                        {item.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">{item.provider}</td>
                  <td className="py-3.5 px-4 font-black text-white">
                    ${item.amountUsd.toFixed(2)} <span className="text-[10px] text-gray-500 font-normal">/{item.recurrence}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition cursor-pointer ${
                        item.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                      title="Click to toggle status"
                    >
                      {item.status}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-950/50 text-gray-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete expense"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#091320] border border-cyan-500/40 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-900/50">
              <h3 className="text-lg font-black flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-400" />
                <span>Add Infrastructure Expense</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="p-1 rounded-lg hover:bg-cyan-950 text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-bold mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dedicated Edge Node Upgrade"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-900 focus:border-cyan-400 text-white font-sans focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-900 focus:border-cyan-400 text-white font-sans focus:outline-none cursor-pointer"
                  >
                    <option value="server_hosting">Server Hosting</option>
                    <option value="bandwidth">Bandwidth</option>
                    <option value="security_shield">Security Shield</option>
                    <option value="edge_proxy">Edge Proxy</option>
                    <option value="domain_ssl">Domain SSL</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Cost (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    placeholder="e.g. 85.00"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-900 focus:border-cyan-400 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Recurrence</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-900 focus:border-cyan-400 text-white font-sans focus:outline-none cursor-pointer"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="one_time">One-Time</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold mb-1">Provider</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g. IDC Cambodia"
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-900 focus:border-cyan-400 text-white font-sans focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Notes / Description</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Hardware specs, SLA terms, or notes"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-cyan-900 focus:border-cyan-400 text-white font-sans focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:brightness-110 text-black font-black text-xs transition shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
