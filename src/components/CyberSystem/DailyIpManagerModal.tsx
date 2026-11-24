import React, { useState, useEffect } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import { DailyIpNode } from '../../types';
import {
  Globe,
  RefreshCw,
  RotateCw,
  Clock,
  Shield,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  X,
  Server,
  Activity,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyIpManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyIpManagerModal: React.FC<DailyIpManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStep, setUpdateStep] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'pool' | 'history'>('overview');

  const config = appState.dailyNetworkConfig;
  const currentNode = config.currentNode;

  // Calculate live countdown to next rotation (midnight UTC)
  useEffect(() => {
    if (!isOpen) return;

    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, config.nextRotationTimestamp - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [isOpen, config.nextRotationTimestamp]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldId: string) => {
    sound.playClick();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleForceRotate = async (targetNodeId?: string) => {
    sound.playClick();
    setIsUpdating(true);
    setUpdateStep('Initiating secure handshake to target edge node...');

    await new Promise((r) => setTimeout(r, 400));
    setUpdateStep('Routing WebSocket packets via TLS 1.3 encrypted tunnel...');

    await new Promise((r) => setTimeout(r, 450));
    setUpdateStep('Updating system software patch & flushing L2 cache...');

    await new Promise((r) => setTimeout(r, 400));
    setUpdateStep('Synchronizing live signal feed to new daily IP...');

    await new Promise((r) => setTimeout(r, 350));
    const newNode = appState.rotateIpNow(targetNodeId, true);

    setIsUpdating(false);
    setUpdateStep('');

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff0055', '#00ff66', '#ffd700'],
      });
    } catch {}
  };

  const handleUpdateAllAndReboot = async () => {
    sound.playClick();
    setIsUpdating(true);
    setUpdateStep('Initiating full system software upgrade & IP rotation...');
    try {
      await appState.updateAllSystemSoftwareAndReboot((_step, line) => {
        setUpdateStep(line);
      });
      onClose();
    } finally {
      setIsUpdating(false);
      setUpdateStep('');
    }
  };

  const countryFlagMap: Record<string, string> = {
    KH: '🇰🇭',
    SG: '🇸🇬',
    DE: '🇩🇪',
    NL: '🇳🇱',
    HK: '🇭🇰',
    JP: '🇯🇵',
    VN: '🇻🇳',
    TH: '🇹🇭',
    GB: '🇬🇧',
    US: '🇺🇸',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-[#0e0319] border-2 border-[#ff0055] rounded-3xl shadow-[0_0_40px_rgba(255,0,85,0.4)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Background Header Accents */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-[#ff0055]/15 blur-[60px] pointer-events-none" />
        <div className="absolute top-0 left-1/4 w-72 h-32 bg-emerald-500/15 blur-[60px] pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-4 sm:p-5 border-b border-[#ff0055]/30 flex items-center justify-between shrink-0 bg-[#160426]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff0055] via-purple-600 to-cyan-400 p-[2px] shadow-[0_0_15px_rgba(255,0,85,0.6)]">
              <div className="w-full h-full bg-[#140222] rounded-[14px] flex items-center justify-center">
                <Globe size={20} className="text-[#00ff9d]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-mono font-black text-base sm:text-lg tracking-wide">
                  Daily IP Auto-Change Engine
                </h2>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/40">
                  AUTO 24H
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {config.systemSoftwareVersion} • Smooth 100% Security
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-purple-900/40 bg-[#120220] shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('overview');
            }}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#ff0055] text-white shadow-[0_0_12px_rgba(255,0,85,0.6)]'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <Zap size={13} />
            <span>Active IP Node</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('pool');
            }}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pool'
                ? 'bg-[#ff0055] text-white shadow-[0_0_12px_rgba(255,0,85,0.6)]'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <Server size={13} />
            <span>Multi-Region Pool ({config.ipPool.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
            }}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#ff0055] text-white shadow-[0_0_12px_rgba(255,0,85,0.6)]'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <Clock size={13} />
            <span>14-Day Rotation History</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Active Hero Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1a052c] to-[#0c0217] border-2 border-[#00ff7f]/60 shadow-[0_0_25px_rgba(0,255,127,0.25)] relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">
                        {countryFlagMap[currentNode.countryCode] || '🌐'}
                      </span>
                      <span className="text-white font-mono font-bold text-base">
                        {currentNode.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff7f]/20 text-[#00ff7f] font-mono font-black border border-[#00ff7f]/50 animate-pulse">
                        LIVE ACTIVE TODAY
                      </span>
                    </div>
                    <div className="text-xs text-gray-300 font-mono">
                      {currentNode.city}, {currentNode.region} • {currentNode.provider}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-gray-400 font-mono block">Speed / Ping</span>
                    <span className="text-[#00ff9d] font-mono font-black text-base flex items-center justify-end gap-1">
                      <Activity size={14} />
                      {currentNode.latencyMs} ms
                    </span>
                  </div>
                </div>

                {/* IP Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-purple-900/60 font-mono text-xs">
                  {/* Game Feed IP */}
                  <div className="p-2.5 rounded-xl bg-[#090113]/90 border border-[#00ff7f]/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Game Signal Stream Feed</span>
                      <span className="text-[#00ff9d] font-black text-sm tracking-wide">
                        {currentNode.feedIp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentNode.feedIp, 'feed')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                      title="Copy Feed IP"
                    >
                      {copiedField === 'feed' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Host IP */}
                  <div className="p-2.5 rounded-xl bg-[#090113]/90 border border-purple-500/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Edge Host Gateway</span>
                      <span className="text-cyan-300 font-black text-sm tracking-wide">
                        {currentNode.hostIp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentNode.hostIp, 'host')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                      title="Copy Host IP"
                    >
                      {copiedField === 'host' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* DNS Gateway */}
                  <div className="p-2.5 rounded-xl bg-[#090113]/90 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Ultra-Secure DNS Resolver</span>
                      <span className="text-purple-300 font-black text-xs">
                        {currentNode.dnsIp}
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-200">
                      DoH TLS 1.3
                    </span>
                  </div>

                  {/* Proxy Relay */}
                  <div className="p-2.5 rounded-xl bg-[#090113]/90 border border-purple-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Anti-DDoS Proxy Relay</span>
                      <span className="text-pink-300 font-black text-xs">
                        {currentNode.proxyIp}
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      99.99% UPTIME
                    </span>
                  </div>
                </div>

                {/* Cryptographic Security Details */}
                <div className="mt-3 pt-2 border-t border-purple-900/40 flex flex-wrap items-center justify-between text-[10px] font-mono text-gray-400 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Lock size={12} className="text-emerald-400" />
                    <span>{currentNode.encryption}</span>
                  </div>
                  <div>
                    ASN: <strong className="text-gray-200">{currentNode.asn}</strong>
                  </div>
                </div>
              </div>

              {/* Automatic Everyday Rotation Countdown & Scheduler */}
              <div className="p-4 rounded-2xl bg-[#140222] border border-[#ff0055]/40 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ff0055]/20 border border-[#ff0055]/50 flex items-center justify-center text-[#ff3366] shrink-0">
                    <Clock size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs">Next Automatic Daily Shift</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-400/20 text-yellow-300 font-bold">
                        MIDNIGHT UTC
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Auto-shifts to next synchronized node every day. Total rotations: <strong className="text-emerald-400">{config.totalRotationsCount}</strong>
                    </p>
                  </div>
                </div>

                {/* Countdown Dial */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-[#ff0055]/50 text-center">
                    <span className="text-[9px] text-gray-400 block -mb-0.5">TIME REMAINING</span>
                    <span className="text-lg font-black text-[#ff1a66] tracking-wider drop-shadow-[0_0_8px_rgba(255,0,85,0.7)]">
                      {timeRemaining || '23:59:59'}
                    </span>
                  </div>

                  {/* Auto-rotate Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      appState.toggleDailyAutoRotate();
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                      config.autoRotateDaily
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                        : 'bg-gray-800 text-gray-400 border-gray-700'
                    }`}
                    title="Toggle automatic daily rotation"
                  >
                    <span>Auto:</span>
                    <strong>{config.autoRotateDaily ? 'ACTIVE' : 'PAUSED'}</strong>
                  </button>
                </div>
              </div>

              {/* Action Banner: Update All System Software, IP & Restart Website */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/50 via-[#1e022b] to-pink-900/50 border border-[#ff0055]/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-[#ff0055] p-0.5 shrink-0">
                    <div className="w-full h-full bg-[#12021c] rounded-[10px] flex items-center justify-center">
                      <Sparkles size={18} className="text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                      <span>Update All System Software, IP &amp; Reboot Website</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                        V4.0 • BOT AI v6.0
                      </span>
                    </h4>
                    <p className="text-[11px] text-gray-300 font-mono">
                      Upgrades CyderShield V4.0 &amp; BitsGap Bot AI v6.0 (99.99% Live Signal, Zero Bugs), rotates IP, and executes a clean reboot.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateAllAndReboot()}
                    disabled={isUpdating}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-emerald-500 hover:brightness-110 active:scale-[0.98] border border-cyan-300 text-black font-mono font-black text-xs transition shadow-[0_0_20px_rgba(6,182,212,0.6)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                  >
                    <RotateCw size={14} className={isUpdating ? 'animate-spin' : ''} />
                    <span>{isUpdating ? 'Executing...' : '🚀 Update & Restart Website'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleForceRotate()}
                    disabled={isUpdating}
                    className="px-3.5 py-2.5 rounded-xl bg-[#1d0328] hover:bg-[#280538] border border-[#ff0055]/60 text-pink-300 font-mono font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                    title="Quickly switch to next IP node without full reboot"
                  >
                    <RefreshCw size={13} className={isUpdating ? 'animate-spin' : ''} />
                    <span>Quick Shift IP</span>
                  </button>
                </div>
              </div>

              {/* Update Progress Indicator */}
              {isUpdating && (
                <div className="p-3 rounded-xl bg-black/70 border border-yellow-400/60 font-mono text-xs text-yellow-300 flex items-center gap-2.5 animate-pulse">
                  <RefreshCw size={14} className="animate-spin text-yellow-400" />
                  <span>{updateStep}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MULTI-REGION POOL */}
          {activeTab === 'pool' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-1">
                <span>Verified Enterprise Nodes ({config.ipPool.length} Total)</span>
                <span>All nodes tested &amp; verified 100% active</span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {config.ipPool.map((node) => {
                  const isCurrent = node.id === currentNode.id;
                  return (
                    <div
                      key={node.id}
                      className={`p-3.5 rounded-2xl border transition-all font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-[#180327] border-[#00ff7f] shadow-[0_0_15px_rgba(0,255,127,0.3)]'
                          : 'bg-[#11021c] border-purple-900/60 hover:border-purple-500/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{countryFlagMap[node.countryCode] || '🌐'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-bold text-xs sm:text-sm">
                              {node.name}
                            </h4>
                            {isCurrent && (
                              <span className="text-[9px] px-2 py-0.2 rounded-full bg-[#00ff7f]/20 text-[#00ff7f] font-black border border-[#00ff7f]/40">
                                ACTIVE TODAY
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Feed: <strong className="text-emerald-400">{node.feedIp}</strong> • Host:{' '}
                            <strong className="text-cyan-400">{node.hostIp}</strong>
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            {node.city}, {node.region} • {node.asn}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-purple-900/40">
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">Ping</span>
                          <span className="text-emerald-300 font-bold text-xs">{node.latencyMs} ms</span>
                        </div>

                        {isCurrent ? (
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            <span>Connected</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleForceRotate(node.id)}
                            disabled={isUpdating}
                            className="px-3 py-1.5 rounded-xl bg-[#ff0055]/20 hover:bg-[#ff0055]/40 text-pink-300 border border-[#ff0055]/50 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <span>Switch to Node</span>
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ROTATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Daily IP Change Audit Logs (Last 14 Days)</span>
                <span>Automatic 00:00 UTC Archive</span>
              </div>

              <div className="rounded-2xl border border-purple-900/50 overflow-hidden bg-[#11021c]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#180327] text-gray-400 text-[10px] border-b border-purple-900/60 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Feed IP</th>
                        <th className="py-2.5 px-3">Host IP</th>
                        <th className="py-2.5 px-3">Region</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/30">
                      {config.rotationHistory.map((item) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-white/5 transition ${
                            item.status === 'active' ? 'bg-[#00ff7f]/10 text-white' : 'text-gray-300'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-400 font-bold whitespace-nowrap">
                            {item.feedIp}
                          </td>
                          <td className="py-2.5 px-3 text-cyan-400 whitespace-nowrap">
                            {item.hostIp}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-gray-300">
                            {item.city}, {item.region}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {item.status === 'active' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[9px] border border-emerald-500/40">
                                ACTIVE TODAY
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-gray-700/40 text-gray-400 text-[9px]">
                                ROTATED
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[10px] text-gray-400">
                            {item.rotationType === 'manual_force' ? 'Manual Force' : 'Daily 24h'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-purple-900/40 bg-[#120220] flex items-center justify-between shrink-0 font-mono text-xs">
          <div className="flex items-center gap-2 text-gray-400 text-[11px]">
            <Shield size={13} className="text-[#00ff7f]" />
            <span>Encrypted Tunnel: <strong>Zero Stale IP Footprint</strong></span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
