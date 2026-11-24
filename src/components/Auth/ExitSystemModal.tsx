import React, { useState } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import {
  LogOut,
  X,
  AlertTriangle,
  User,
  ShieldAlert,
  Server,
  RefreshCw,
  PowerOff,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface ExitSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin?: () => void;
}

export const ExitSystemModal: React.FC<ExitSystemModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUser = appState.currentUser;
  const has1xBet = Boolean(currentUser?.oneXBetAccountId);
  const isGuest = currentUser?.id === 'usr_guest';

  // 1. Safe Logout
  const handleLogout = () => {
    setIsExiting(true);
    sound.playClick();
    setTimeout(() => {
      appState.logout();
      setIsExiting(false);
      setSuccessMessage('បានចាកចេញពីគណនីដោយជោគជ័យ!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 900);
    }, 400);
  };

  // 2. Disconnect 1xBet Server Only
  const handleDisconnect1xBet = () => {
    sound.playClick();
    appState.disconnect1xBetAccount();
    setSuccessMessage('បានផ្តាច់ការភ្ជាប់ជាមួយ Server 1xBet (185.195.234.19) រួចរាល់!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 1500);
  };

  // 3. Full Exit (Logout + Clear Stored Credentials)
  const handleFullExit = () => {
    setIsExiting(true);
    sound.playAlertNotification();
    setTimeout(() => {
      appState.clearStoredCredentials();
      appState.disconnect1xBetAccount();
      appState.logout();
      setIsExiting(false);
      setSuccessMessage('បានចាកចេញពីប្រព័ន្ធទាំងស្រុង និងជម្រះទិន្នន័យ Session ដោយសុវត្ថិភាព!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d160f] border border-[#233f28] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1b3420] bg-[#111e14]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <LogOut size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                ចាកចេញពីប្រព័ន្ធ (Exit System)
              </h2>
              <p className="text-[11px] text-gray-400">
                មុខងារគ្រប់គ្រងការចាកចេញ និងផ្តាច់ការតភ្ជាប់ Session
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#182a1c] hover:bg-[#203927] text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {successMessage && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Current User Session Card */}
          <div className="p-3.5 rounded-2xl bg-[#122216] border border-[#1f3a25] space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b3320]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <User size={13} className="text-emerald-400" /> គណនីបច្ចុប្បន្ន:
              </span>
              <span className="font-bold text-white truncate max-w-[200px]">
                {currentUser?.name || 'Guest User'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#1b3320]">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Lock size={13} className="text-yellow-400" /> តួនាទី & VIP:
              </span>
              <span className="font-bold text-yellow-300 font-mono uppercase text-[11px]">
                {currentUser?.role === 'owner'
                  ? '👑 OWNER'
                  : currentUser?.role === 'admin'
                  ? '🛡️ ADMIN'
                  : '⭐ VIP ACTIVE'}
              </span>
            </div>

            {has1xBet && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Server size={13} className="text-cyan-400" /> 1xBet Server:
                </span>
                <span className="font-bold text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  #{currentUser?.oneXBetAccountId} (185.195.234.19)
                </span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2 pt-1">
            {!isGuest && (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isExiting}
                className="w-full py-3 px-4 rounded-2xl bg-[#16271a] hover:bg-[#1e3624] border border-[#26442c] text-white text-xs font-bold transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <LogOut size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-amber-300 transition">
                      ចាកចេញពីគណនី (Standard Logout)
                    </div>
                    <div className="text-[10px] text-gray-400">
                      រក្សាទុកព័ត៌មានសម្ងាត់សម្រាប់ចូលវិញរហ័ស (Quick Login)
                    </div>
                  </div>
                </div>
              </button>
            )}

            {has1xBet && (
              <button
                type="button"
                onClick={handleDisconnect1xBet}
                disabled={isExiting}
                className="w-full py-3 px-4 rounded-2xl bg-[#16271a] hover:bg-[#1e3624] border border-[#26442c] text-white text-xs font-bold transition flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <PowerOff size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition">
                      ផ្តាច់ការភ្ជាប់ 1xBet Server តែមួយមុខ
                    </div>
                    <div className="text-[10px] text-gray-400">
                      ផ្តាច់ Stream 185.195.234.19 ដោយមិនចាកចេញពីគណនី
                    </div>
                  </div>
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={handleFullExit}
              disabled={isExiting}
              className="w-full py-3 px-4 rounded-2xl bg-red-950/20 hover:bg-red-900/30 border border-red-500/30 text-red-200 text-xs font-bold transition flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <ShieldAlert size={16} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-red-300 group-hover:text-red-200 transition">
                    ចាកចេញទាំងស្រុង និងជម្រះ Session (Full System Sign-Out)
                  </div>
                  <div className="text-[10px] text-red-400/80">
                    ផ្តាច់ 1xBet និងជម្រះ Token ចេញពី Browser
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#182c1d]">
            {onOpenLogin && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#142618] hover:bg-[#1a3320] text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>ប្តូរគណនី (Switch Account)</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-[#101b13] hover:bg-[#17281c] text-gray-400 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              បោះបង់
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
