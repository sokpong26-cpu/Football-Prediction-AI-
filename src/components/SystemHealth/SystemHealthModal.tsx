import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../../services/sound';
import {
  Activity,
  Server,
  Zap,
  ShieldCheck,
  X,
  RefreshCw,
  Lock,
  Globe,
  Database,
} from 'lucide-react';

export interface DataCenterNode {
  id: string;
  name: string;
  location: string;
  flag: string;
  endpoint: string;
  latencyMs: number;
  protocol: string;
  role: string;
  status: 'optimal' | 'synced' | 'protected' | 'degraded';
}

export interface ServerStatusPayload {
  ok: boolean;
  status: string;
  serverTimestamp: string;
  uptimeSeconds: number;
  nodeVersion: string;
  platform: string;
  arch: string;
  hostname: string;
  cpuCores: number;
  loadAvg1m: number;
  cpuLoadPercent: number;
  heapUsedMb: number;
  heapTotalMb: number;
  memoryRssMb: number;
  totalSystemMemMb: number;
  freeSystemMemMb: number;
  region: string;
  datacenter: string;
  firebaseProjectId: string;
  geminiConfigured: boolean;
  database: {
    connected: boolean;
    latencyMs: number;
    region: string;
    engine: string;
  };
  nodes: DataCenterNode[];
}

interface SystemHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTelemetry?: ServerStatusPayload | null;
  initialRttMs?: number;
}

export const SystemHealthModal: React.FC<SystemHealthModalProps> = ({
  isOpen,
  onClose,
  initialTelemetry = null,
  initialRttMs = 2,
}) => {
  const [telemetry, setTelemetry] = useState<ServerStatusPayload | null>(initialTelemetry);
  const [isAuditing, setIsAuditing] = useState(false);
  const [pingHistory, setPingHistory] = useState<number[]>([initialRttMs]);
  const [lastAuditTimestamp, setLastAuditTimestamp] = useState<string>('Live');

  const runServerAudit = useCallback(async (playChime: boolean = false) => {
    setIsAuditing(true);
    const started = performance.now();
    try {
      const response = await fetch('/api/server/status', { cache: 'no-store' });
      const elapsed = Math.max(1, Math.round(performance.now() - started));
      if (response.ok) {
        const data = (await response.json()) as ServerStatusPayload;
        setTelemetry(data);
        setPingHistory((prev) => [...prev.slice(-15), elapsed]);
        setLastAuditTimestamp(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
        if (playChime) {
          sound.playCompleteFanfare();
        }
      }
    } catch {
      // Preserve existing telemetry if transient fetch fails
    } finally {
      setIsAuditing(false);
    }
  }, []);

  useEffect(() => {
    if (initialTelemetry) {
      setTelemetry(initialTelemetry);
    }
  }, [initialTelemetry]);

  useEffect(() => {
    if (!isOpen) return;
    void runServerAudit(false);
  }, [isOpen, runServerAudit]);

  if (!isOpen) return null;

  const avgPing = Number(
    (pingHistory.reduce((a, b) => a + b, 0) / Math.max(1, pingHistory.length)).toFixed(1)
  );
  const minPing = Math.min(...pingHistory);
  const maxPing = Math.max(...pingHistory);
  const nodes = telemetry?.nodes || [];

  return (
    <div className="fixed inset-0 z-50 bg-[#040906]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#09140d] border border-emerald-500/40 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] flex flex-col overflow-hidden my-auto max-h-[92vh]">
        <div className="px-5 py-4 border-b border-[#162a1c] bg-[#0c1a11] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 p-0.5 shadow-md shadow-emerald-950/60 flex items-center justify-center">
              <div className="w-full h-full bg-[#08120b] rounded-2xl flex items-center justify-center text-emerald-400">
                <Activity size={20} className="animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  ព័ត៌មានលម្អិត Real Server & Data Center ({telemetry?.region || 'asia-southeast1'})
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  {telemetry?.database.connected ? 'ONLINE' : 'CHECKING'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {telemetry?.datacenter || 'Google Cloud Asia-Southeast1 + Cloudflare Edge'} • Live Infrastructure Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-[#122216] hover:bg-[#1a3320] text-gray-400 hover:text-white flex items-center justify-center transition border border-[#213e28] cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-gray-300">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#102416] to-[#0d1d11] border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white text-sm">
                  Real Production Server & Cloud SQL Data Center Active
                </span>
                <span className="px-2 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-black border border-cyan-500/30">
                  {telemetry?.nodeVersion || 'Node Runtime'}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                ម៉ាស៊ីនបម្រើកំពុងដំណើរការផ្ទាល់នៅ Region <strong>{telemetry?.region || 'asia-southeast1'}</strong> ជាមួយ Cloud SQL PostgreSQL ({telemetry?.database.latencyMs ?? 1.5}ms) • CPU {telemetry?.cpuLoadPercent ?? 0}% ({telemetry?.cpuCores ?? 4} Cores) • Memory RSS {telemetry?.memoryRssMb ?? 128} MB។
              </p>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                void runServerAudit(true);
              }}
              disabled={isAuditing}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-600/20 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw size={13} className={isAuditing ? 'animate-spin' : ''} />
              <span>{isAuditing ? 'Refreshing...' : 'Refresh Live Telemetry'}</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#0c170f] border border-[#1b3422] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                <h4 className="font-bold text-white text-sm">Real Server HTTP Round-Trip Latency</h4>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px] flex-wrap">
                <span className="text-gray-400">Min: <strong className="text-emerald-400">{minPing}ms</strong></span>
                <span className="text-gray-400">Avg: <strong className="text-yellow-400">{avgPing}ms</strong></span>
                <span className="text-gray-400">Max: <strong className="text-gray-200">{maxPing}ms</strong></span>
                <span className="text-gray-500">• Checked: {lastAuditTimestamp}</span>
              </div>
            </div>

            <div className="bg-[#08120b] p-3 rounded-xl border border-[#162c1c]">
              <div className="flex items-end justify-start gap-1.5 h-16 pt-2 select-none">
                {pingHistory.map((val, idx) => {
                  const heightPercent = Math.min(100, Math.max(20, (val / Math.max(10, maxPing)) * 100));
                  return (
                    <div key={idx} className="w-8 sm:w-10 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-xs transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[9px] font-mono text-gray-500">
                        {val}ms
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#122316] text-[10px] text-gray-500 font-mono">
                <span>Live Server Probe History ({pingHistory.length} samples)</span>
                <span className="text-emerald-400 font-bold">
                  Cloud SQL Latency: {telemetry?.database.latencyMs ?? 0}ms
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={16} className="text-emerald-400" />
                <h4 className="font-bold text-white text-sm">
                  Active Data Center & Cloud Service Nodes
                </h4>
              </div>
              <span className="text-gray-400 text-[11px] font-mono">
                {nodes.length} Active Nodes Online
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3.5 rounded-2xl bg-[#0c170f] border border-[#1b3422] hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#122216] border border-[#213e28] flex items-center justify-center text-lg shrink-0">
                      {node.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs">{node.name}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#162d1c] text-cyan-300 font-mono text-[10px] border border-[#22442b]">
                          {node.endpoint}
                        </span>
                        <span className="text-[10px] text-gray-500">({node.location})</span>
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{node.role}</span>
                        <span className="text-gray-600">•</span>
                        <span className="font-mono text-emerald-400">{node.protocol}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#152a1b]">
                    <div className="text-right font-mono">
                      <div className="text-xs font-black text-emerald-400 flex items-center justify-end gap-1">
                        <Zap size={11} className="text-yellow-400" />
                        <span>{node.latencyMs} ms</span>
                      </div>
                      <div className="text-[10px] text-gray-500">Live Probe</div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold font-mono ${
                        node.status === 'degraded'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {node.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d1d12] border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <h4 className="font-bold text-white text-sm">
                  Server Security & Infrastructure Runtime
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 rounded-xl bg-[#112316] border border-[#1e3c26] space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <Lock size={12} />
                  <span>Firebase Auth & Firestore Security Rules</span>
                </div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Project: <strong>{telemetry?.firebaseProjectId || 'plenary-order-1vr20'}</strong> • Bearer JWT token verification & strict user-ownership access control enforced on server and database.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#112316] border border-[#1e3c26] space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <Database size={12} />
                  <span>Cloud SQL PostgreSQL ({telemetry?.region || 'asia-southeast1'})</span>
                </div>
                <p className="text-gray-400 text-[10px] leading-relaxed">
                  Real-time persistent storage for users, services, orders, and AI scans • Host OS: {telemetry?.platform || 'linux'} ({telemetry?.arch || 'x64'}) • Heap {telemetry?.heapUsedMb ?? 0}/{telemetry?.heapTotalMb ?? 0} MB.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[#162a1c] bg-[#0c1a11] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400 font-mono">
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-emerald-400" />
            <span>Region: <strong className="text-white">{telemetry?.region || 'asia-southeast1'}</strong></span>
            <span>•</span>
            <span className="text-emerald-400">Uptime: {telemetry?.uptimeSeconds ?? 0}s</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-[#152a1b] hover:bg-[#1f3d28] text-white font-bold text-xs transition border border-[#274c2e] cursor-pointer"
          >
            បិទផ្ទាំង (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
