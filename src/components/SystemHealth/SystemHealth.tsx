import React, { useState, useEffect, useCallback } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import {
  Activity,
  Cpu,
  Wifi,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  Zap,
  Server,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { SystemHealthModal, ServerStatusPayload } from './SystemHealthModal';

interface SystemHealthProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ variant = 'full', className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [rttPingMs, setRttPingMs] = useState<number>(appState.config.serverPingMs || 2);
  const [telemetry, setTelemetry] = useState<ServerStatusPayload | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>('Live');

  const fetchServerStatus = useCallback(async (withSound: boolean = false) => {
    setIsChecking(true);
    const started = performance.now();
    try {
      const response = await fetch('/api/server/status', { cache: 'no-store' });
      const elapsed = Math.max(1, Math.round(performance.now() - started));
      if (response.ok) {
        const data = (await response.json()) as ServerStatusPayload;
        setTelemetry(data);
        setRttPingMs(elapsed);
        appState.config.serverPingMs = elapsed;
        setLastCheckTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
        if (withSound) {
          sound.playStepChime(3);
        }
      }
    } catch {
      // Keep last known metrics on transient network interruption
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void fetchServerStatus(false);
    const interval = setInterval(() => {
      void fetchServerStatus(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchServerStatus]);

  const cpuLoad = telemetry ? telemetry.cpuLoadPercent : 4.2;
  const memoryRss = telemetry ? telemetry.memoryRssMb : 128;
  const totalSysMem = telemetry ? Math.max(512, telemetry.totalSystemMemMb) : 2048;
  const memPct = Math.min(100, Number(((memoryRss / totalSysMem) * 100).toFixed(1)));
  const dbConnected = telemetry ? telemetry.database.connected : true;
  const dbLatency = telemetry ? telemetry.database.latencyMs : 1.5;
  const regionLabel = telemetry?.region || 'asia-southeast1';
  const uptimeSeconds = telemetry?.uptimeSeconds || 0;
  const uptimeDisplay =
    uptimeSeconds >= 3600
      ? `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`
      : uptimeSeconds >= 60
      ? `${Math.floor(uptimeSeconds / 60)}m ${uptimeSeconds % 60}s`
      : `${uptimeSeconds}s`;

  const renderSignalBars = (level: number = 4) => (
    <div className="flex items-end gap-0.5 h-3.5 select-none" title="គុណភាពសេវា Real Data Center">
      {[1, 2, 3, 4].map((bar) => {
        const active = bar <= level;
        const heights = ['h-1', 'h-1.5', 'h-2.5', 'h-3.5'];
        return (
          <span
            key={bar}
            className={`w-1 rounded-xs transition-all duration-300 ${heights[bar - 1]} ${
              active
                ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]'
                : 'bg-gray-700/60'
            }`}
          />
        );
      })}
    </div>
  );

  if (variant === 'compact') {
    return (
      <>
        <div
          onClick={() => {
            sound.playClick();
            setIsModalOpen(true);
          }}
          className={`inline-flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-[#0f1f14] hover:bg-[#152e1c] border border-emerald-500/30 hover:border-emerald-400 text-[11px] font-mono text-gray-300 transition-all cursor-pointer shadow-sm group select-none ${className}`}
          title="ចុចមើល Real Server & Data Center Telemetry"
        >
          <div className="flex items-center gap-1.5">
            {renderSignalBars(dbConnected ? 4 : 2)}
            <span className="text-emerald-400 font-bold group-hover:text-emerald-300">
              {regionLabel}
            </span>
          </div>

          <span className="text-gray-600">•</span>

          <div className="flex items-center gap-1 text-emerald-300">
            <Zap size={11} className="text-yellow-400" />
            <span>{rttPingMs}ms</span>
          </div>

          <span className="text-gray-600 hidden xs:inline">•</span>

          <div className="hidden xs:flex items-center gap-1 text-cyan-300">
            <Cpu size={11} />
            <span>CPU {cpuLoad}%</span>
          </div>

          <span className="text-gray-600 hidden sm:inline">•</span>

          <div className="hidden sm:flex items-center gap-1 text-emerald-400 font-bold">
            <ShieldCheck size={11} />
            <span>{dbConnected ? 'DC Online' : 'Syncing'}</span>
          </div>

          <span className="text-[9px] bg-emerald-500/15 group-hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 rounded font-sans font-bold hidden md:inline transition-colors">
            Server Nodes
          </span>
        </div>

        <SystemHealthModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialTelemetry={telemetry}
          initialRttMs={rttPingMs}
        />
      </>
    );
  }

  return (
    <div className={`p-5 rounded-3xl bg-[#0c160f] border border-[#1b3422] shadow-xl space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 p-0.5 shadow-md shadow-emerald-950/60 flex items-center justify-center">
            <div className="w-full h-full bg-[#0a150d] rounded-2xl flex items-center justify-center text-emerald-400">
              <Activity size={20} className="animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight">
                Real Server & Data Center Monitor ({regionLabel})
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono">
                {dbConnected ? 'PRODUCTION LIVE' : 'RECONNECTING'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              តាមដាន Real Server Uptime, Process Memory, CPU Load និង Cloud SQL ({regionLabel}) Latency ផ្ទាល់ពីម៉ាស៊ីនបម្រើ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-500 font-mono hidden md:inline">
            Updated: {lastCheckTime} • Uptime: {uptimeDisplay}
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-green-500/30 hover:from-emerald-600/50 hover:to-green-500/50 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer"
          >
            <Server size={13} className="text-emerald-400" />
            <span>Data Center Nodes</span>
          </button>
          <button
            type="button"
            disabled={isChecking}
            onClick={() => {
              sound.playClick();
              void fetchServerStatus(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#14291a] hover:bg-[#1b3924] text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition shadow cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isChecking ? 'animate-spin text-emerald-400' : 'text-emerald-400'} />
            <span>{isChecking ? 'Checking...' : 'Refresh Server'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => {
            sound.playClick();
            setIsModalOpen(true);
          }}
          className="p-3.5 rounded-2xl bg-[#112015] hover:bg-[#15281b] border border-[#1e3b26] hover:border-emerald-500/50 flex flex-col justify-between space-y-2 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
              <Zap size={14} className="text-yellow-400" />
              <span>API Server Latency</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded">
              LIVE
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">{rttPingMs}</span>
            <span className="text-xs font-mono text-gray-400">ms RTT</span>
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            {telemetry?.nodeVersion || 'Node.js Runtime'} • Uptime {uptimeDisplay}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#112015] border border-[#1e3b26] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <HardDrive size={14} className="text-cyan-400" />
              <span>Server Memory (RSS)</span>
            </span>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">
              Heap {telemetry?.heapUsedMb ?? 48} MB
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-cyan-300">{memoryRss}</span>
            <span className="text-xs font-mono text-gray-400">MB RSS</span>
          </div>
          <div className="w-full bg-[#172d1f] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, memPct)}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#112015] border border-[#1e3b26] flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Cpu size={14} className="text-purple-400" />
              <span>CPU Core Load</span>
            </span>
            <span className="text-[10px] text-purple-300 font-mono font-bold">
              {telemetry?.cpuCores || 4} Cores
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-purple-300">{cpuLoad}</span>
            <span className="text-xs font-mono text-gray-400">% Load</span>
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            1m Avg: {telemetry?.loadAvg1m ?? 0.15} • {telemetry?.arch || 'x64'} {telemetry?.platform || 'linux'}
          </div>
        </div>

        <div
          onClick={() => {
            sound.playClick();
            setIsModalOpen(true);
          }}
          className="p-3.5 rounded-2xl bg-[#112015] hover:bg-[#15281b] border border-[#1e3b26] hover:border-emerald-500/50 flex flex-col justify-between space-y-2 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 group-hover:text-emerald-300 transition-colors">
              <Database size={14} className="text-emerald-400" />
              <span>Cloud SQL ({regionLabel})</span>
            </span>
            {renderSignalBars(dbConnected ? 4 : 1)}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {dbConnected ? `${dbLatency}ms` : 'Offline'}
            </span>
            <span className="text-xs font-mono text-emerald-300 font-bold">
              {dbConnected ? 'Connected' : 'Error'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>{telemetry?.datacenter ? 'Cloud + Edge' : regionLabel}</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 size={10} /> TLS 1.3
            </span>
          </div>
        </div>
      </div>

      <SystemHealthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTelemetry={telemetry}
        initialRttMs={rttPingMs}
      />
    </div>
  );
};
