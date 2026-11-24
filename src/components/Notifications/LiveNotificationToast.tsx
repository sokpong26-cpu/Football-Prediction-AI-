import React, { useState, useEffect } from 'react';
import { appState } from '../../services/store';
import { SystemAlert } from '../../types';
import { X, Bell, Zap, CheckCircle2, Radio, RefreshCw, Server } from 'lucide-react';

export const LiveNotificationToast: React.FC = () => {
  const [activeToast, setActiveToast] = useState<SystemAlert | null>(null);
  const [retryToast, setRetryToast] = useState(appState.latencyRetryToast);

  useEffect(() => {
    let lastAlertId = appState.alerts[0]?.id;

    const unsub = appState.subscribe(() => {
      setRetryToast(appState.latencyRetryToast);

      const latest = appState.alerts[0];
      if (latest && latest.id !== lastAlertId) {
        lastAlertId = latest.id;
        setActiveToast(latest);

        const timer = setTimeout(() => {
          setActiveToast(null);
        }, 5000);

        return () => clearTimeout(timer);
      }
    });

    return unsub;
  }, []);

  return (
    <>
      {/* Intelligent Auto-Retry Toast Notification */}
      {retryToast?.active && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 relative overflow-hidden ${
              retryToast.status === 'waiting'
                ? 'bg-[#181a0b] border-amber-500/60 shadow-amber-950/60'
                : 'bg-[#0a180f] border-emerald-500/60 shadow-emerald-950/60'
            }`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                retryToast.status === 'waiting' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
              }`}
            />

            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                retryToast.status === 'waiting'
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {retryToast.status === 'waiting' ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </div>

            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider font-mono ${
                    retryToast.status === 'waiting' ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {retryToast.status === 'waiting'
                    ? '⚡ Intelligent Auto-Retry Engaged'
                    : '✓ Server Latency Optimal'}
                </span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    retryToast.status === 'waiting' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
              </div>

              <h4 className="text-xs font-bold text-white leading-tight mb-1">
                {retryToast.messageKh}
              </h4>

              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-1 pt-1 border-t border-gray-700/40">
                <span>Latency: <strong className={retryToast.status === 'waiting' ? 'text-amber-300' : 'text-emerald-300'}>{retryToast.latencyMs}ms</strong></span>
                <span>Host: 103.216.51.188 🇰🇭</span>
              </div>
            </div>

            <button
              onClick={() => {
                appState.latencyRetryToast = null;
                setRetryToast(null);
              }}
              className="text-gray-400 hover:text-white p-1 transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Regular Alert Notification Toast */}
      {activeToast && (
        <div className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 rounded-2xl bg-[#0d1a10] border border-emerald-500/50 shadow-2xl shadow-black/80 flex items-start gap-3 relative overflow-hidden backdrop-blur-md">
            
            {/* Glowing Indicator bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-400 to-green-600 animate-pulse" />

            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg shrink-0 mt-0.5">
              {activeToast.type === 'order' ? '💰' : activeToast.type === 'signal' ? '🍎' : '⚡'}
            </div>

            <div className="flex-1 pr-4">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  {activeToast.type === 'order' ? 'ការបញ្ជាទិញថ្មី' : 'Check Signal ចូលមក'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <h4 className="text-xs font-bold text-white leading-tight mb-1">
                {activeToast.titleKh}
              </h4>
              <p className="text-[11px] text-gray-300 leading-snug">
                {activeToast.messageKh}
              </p>
            </div>

            <button
              onClick={() => setActiveToast(null)}
              className="text-gray-400 hover:text-white p-1 transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

