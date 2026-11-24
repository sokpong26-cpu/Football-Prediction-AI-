import React, { useState } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import { PWAInstallButton } from './PWAInstallButton';
import { ExitSystemModal } from '../Auth/ExitSystemModal';
import { KhqrLogo, AmkLogo, KbPrasacLogo, PpcLogo } from '../Store/BankLogos';
import {
  Shield,
  ShieldCheck,
  Crown,
  Bell,
  Volume2,
  VolumeX,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Radio,
  Sliders,
  DollarSign,
  Check,
  CheckCircle2,
  Smartphone,
  Download,
  Trees,
  Moon,
  CreditCard,
  Power,
  Send,
  Camera,
  Cloud,
  Trophy,
} from 'lucide-react';

export type AppViewType =
  | 'bot'
  | 'ai_scan'
  | 'football'
  | 'cloud'
  | 'profile'
  | 'admin'
  | 'store';

interface NavbarProps {
  currentView: AppViewType;
  onNavigate: (view: AppViewType) => void;
  onOpenAuth: (tab?: 'sokrizybet' | 'login' | 'register' | 'key' | '1xbet') => void;
  onOpenStore: () => void;
  onOpenDownloadModal?: () => void;
  onOpenCybersecurity?: () => void;
  theme?: 'dark' | 'forest';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenStore,
  onOpenDownloadModal,
  onOpenCybersecurity,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const user = appState.currentUser;
  const isOwner = user && user.role === 'owner';
  const isAdmin = user && (user.role === 'admin' || user.role === 'owner');
  const unreadAlerts = appState.alerts.filter((a) => !a.read);

  const getTierBadge = () => {
    if (!user) return null;
    if (user.role === 'owner') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500/20 via-amber-500/25 to-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-black uppercase flex items-center gap-1">
          <Crown size={11} className="text-yellow-400" /> ម្ចាស់គេហទំព័រ (OWNER)
        </span>
      );
    }
    if (user.role === 'admin') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase">
          ADMIN
        </span>
      );
    }
    if (user.vipTier === 'free') {
      return (
        <span className="px-2 py-0.5 rounded-full bg-gray-700/60 text-gray-300 text-[10px] font-bold">
          FREE TIER
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] font-black flex items-center gap-1">
        <Crown size={11} /> VIP ACTIVE
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a140d]/90 backdrop-blur-md border-b border-[#172c1c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onNavigate('bot')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 p-0.5 shadow-lg shadow-emerald-950/60 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0c160f] rounded-2xl flex items-center justify-center text-xl">
                🍎
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black text-white tracking-tight">
                  Apple of Fortune
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-gradient-to-r from-[#ff0055] to-purple-600 text-white uppercase font-mono shadow-[0_0_10px_rgba(255,0,85,0.6)] animate-pulse">
                  NEW V2.02
                </span>
              </div>
              <div className="text-[10px] text-gray-400 font-medium">
                New System • ID 1xBet &amp; Dynamic Machine
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold">
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('bot');
              }}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'bot'
                  ? 'bg-[#152a1b] text-emerald-400 border border-emerald-500/30 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#101e13]'
              }`}
            >
              <Radio size={14} className={currentView === 'bot' ? 'animate-pulse text-emerald-400' : ''} />
              <span>ចាប់សេវា (Signal Bot)</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('ai_scan');
              }}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentView === 'ai_scan'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-cyan-300 hover:text-white hover:bg-[#101e13]'
              }`}
            >
              <Camera size={14} className="text-cyan-400" />
              <span>AI Scan New</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('football');
              }}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentView === 'football'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-emerald-300 hover:text-white hover:bg-[#101e13]'
              }`}
            >
              <Trophy size={14} className="text-emerald-400" />
              <span>Football AI</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('cloud');
              }}
              className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                currentView === 'cloud'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold'
                  : 'text-orange-300 hover:text-white hover:bg-[#101e13]'
              }`}
            >
              <Cloud size={14} className="text-orange-400" />
              <span>Cloudflare & Firebase</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenStore();
                }}
                className="px-3 py-2 rounded-xl text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition cursor-pointer flex items-center gap-1.5 font-bold"
              >
                <Sparkles size={14} className="text-yellow-400" />
                <span>កញ្ចប់ VIP</span>
              </button>

              {/* 4 Accepted Bank Logos in Navbar */}
              <div
                onClick={() => {
                  sound.playClick();
                  onOpenStore();
                }}
                className="hidden xl:flex items-center gap-1.5 py-1 px-2 rounded-xl bg-[#0b170e] border border-[#1b3420] hover:border-emerald-500/40 transition cursor-pointer"
                title="គាំទ្រការទូទាត់តាម KHQR, AMK Bank, KB Prasac Bank, PPC Bank"
              >
                <KhqrLogo className="w-5 h-3.5" />
                <AmkLogo className="w-3.5 h-3.5" />
                <KbPrasacLogo className="w-3.5 h-3.5" />
                <PpcLogo className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold text-gray-300 font-sans ml-0.5">
                  4 ធនាគារ
                </span>
              </div>
            </div>

            {/* App Download Button */}
            {onOpenDownloadModal && (
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenDownloadModal();
                }}
                className="px-3 py-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition cursor-pointer flex items-center gap-1.5 font-bold"
              >
                <Smartphone size={14} />
                <span>ទាញយក App (.APK/.IPA)</span>
              </button>
            )}

            {/* Admin Dashboard Tab - Only visible when logged in as Admin or Owner */}
            {isAdmin && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('admin');
                }}
                className={`px-3 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-[#101e13]'
                }`}
              >
                <Shield size={14} className="text-red-400" />
                <span>ផ្ទាំង Admin (Dashboard)</span>
                {appState.orders.filter((o) => o.paymentStatus === 'pending').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping"></span>
                )}
              </button>
            )}
          </nav>
        </div>

        {/* Right Action Icons & User Dropdown */}
        <div className="flex items-center gap-2">
          {/* Cybersecurity V3.1 Beta System Shield */}
          {onOpenCybersecurity && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenCybersecurity();
              }}
              className="py-1.5 px-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 border border-emerald-500/40 transition flex items-center gap-1.5 cursor-pointer shadow-sm text-xs font-bold"
              title="ប្រព័ន្ធសុវត្ថិភាព CyderShield V3.1 Beta (Smooth 100%)"
            >
              <ShieldCheck size={14} className="text-emerald-400 animate-pulse" />
              <span className="hidden sm:inline font-mono">CyderShield</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-black">
                V3.1
              </span>
            </button>
          )}

          {/* Telegram Direct Support Link */}
          <a
            href="https://t.me/Sokpong168"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playClick()}
            className="hidden md:flex py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-cyan-950/80 to-[#0c1a2e] hover:brightness-125 text-cyan-300 border border-cyan-500/40 transition items-center gap-1.5 cursor-pointer shadow-sm text-xs font-bold"
            title="Telegram Direct: @Sokpong168"
          >
            <Send size={13} className="text-cyan-400" />
            <span className="font-mono text-[11px]">@Sokpong168</span>
          </a>

          {/* Theme Toggle Button: High-Contrast Dark ↔ Deep Forest */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (onToggleTheme) onToggleTheme();
            }}
            className="p-2 rounded-xl bg-[#111f15] hover:bg-[#182c1e] text-gray-400 hover:text-emerald-400 border border-[#1d3522] transition flex items-center gap-1.5 cursor-pointer text-xs"
            title={theme === 'forest' ? 'ប្តូរទៅ High-Contrast Dark Theme' : 'ប្តូរទៅ Deep Forest Theme'}
          >
            {theme === 'forest' ? (
              <>
                <Trees size={16} className="text-emerald-400" />
                <span className="hidden lg:inline text-[10px] font-mono font-bold text-emerald-300">Forest</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-gray-300" />
                <span className="hidden lg:inline text-[10px] font-mono font-bold text-gray-400">Dark</span>
              </>
            )}
          </button>

          {/* In-App PWA / Package Install Button */}
          <PWAInstallButton onOpenDownloadModal={onOpenDownloadModal} />
          
          {/* Sound Toggle */}
          <button
            onClick={() => appState.toggleSound()}
            className="p-2 rounded-xl bg-[#111f15] hover:bg-[#182c1e] text-gray-400 hover:text-emerald-400 border border-[#1d3522] transition"
            title="បិទ/បើក សំឡេង"
          >
            {appState.config.soundEnabled ? (
              <Volume2 size={16} className="text-emerald-400" />
            ) : (
              <VolumeX size={16} className="text-gray-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowAlertsDropdown(!showAlertsDropdown);
                setShowUserDropdown(false);
              }}
              className="p-2 rounded-xl bg-[#111f15] hover:bg-[#182c1e] text-gray-400 hover:text-white border border-[#1d3522] transition relative"
              title="ការជូនដំណឹង"
            >
              <Bell size={16} />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-bold text-[9px] flex items-center justify-center animate-pulse">
                  {unreadAlerts.length}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showAlertsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0c160f] border border-[#1f3724] shadow-2xl p-4 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-[#1a2d1f]">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <Bell size={14} className="text-yellow-400" />
                    ការជូនដំណឹងប្រព័ន្ធ ({unreadAlerts.length} ថ្មី)
                  </h4>
                  <button
                    onClick={() => appState.markAllAlertsAsRead()}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    អានទាំងអស់
                  </button>
                </div>

                <div className="space-y-2 mt-3 max-h-72 overflow-y-auto pr-1">
                  {appState.alerts.slice(0, 6).map((alt) => (
                    <div
                      key={alt.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        !alt.read
                          ? 'bg-[#142618] border-emerald-500/40 text-gray-200'
                          : 'bg-[#101b13] border-[#1c3020] text-gray-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white">{alt.titleKh}</span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(alt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{alt.messageKh}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                sound.playClick();
                setShowUserDropdown(!showUserDropdown);
                setShowAlertsDropdown(false);
              }}
              className="flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-[#111f15] hover:bg-[#182c1e] border border-[#1d3522] transition cursor-pointer"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                isOwner ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {isOwner ? '👑' : user?.name.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight max-w-[120px] truncate">
                  {user?.name}
                </span>
                <span className="text-[10px] text-gray-400 leading-tight">
                  {getTierBadge()}
                </span>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0c160f] border border-[#1f3724] shadow-2xl p-3 z-50 animate-in fade-in space-y-3">
                <div className={`p-3 rounded-xl border ${
                  isOwner ? 'bg-gradient-to-br from-[#1a2313] to-[#121c10] border-yellow-500/40' : 'bg-[#111f15] border-[#1d3522]'
                }`}>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    {isOwner && <span>👑</span>}
                    <span>{user.name}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono">@{user.username} • {user.phone}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">ស្ថានភាព VIP:</span>
                    {getTierBadge()}
                  </div>
                </div>

                {/* Admin Access Link (Only for logged in Admin/Owner) */}
                {isAdmin && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setShowUserDropdown(false);
                      onNavigate('admin');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Shield size={15} className="text-red-400" />
                      <span>ផ្ទាំងគ្រប់គ្រង (Admin Dashboard)</span>
                    </div>
                    <span className="text-[10px] bg-red-500/30 px-2 py-0.5 rounded text-white font-mono">ចូល</span>
                  </button>
                )}

                <div className="pt-2 border-t border-[#182e1d] flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuth('1xbet');
                    }}
                    className="w-full py-2 px-2.5 rounded-lg text-left text-xs text-cyan-300 hover:bg-cyan-500/10 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Radio size={14} className="text-cyan-400" />
                      <span>{user?.oneXBetAccountId ? `1xBet: #${user.oneXBetAccountId}` : 'ភ្ជាប់ ID 1xBet'}</span>
                    </div>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-mono font-bold">
                      185.195.234.19
                    </span>
                  </button>

                  <a
                    href="https://t.me/Sokpong168"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      sound.playClick();
                      setShowUserDropdown(false);
                    }}
                    className="w-full py-2 px-2.5 rounded-lg text-left text-xs text-cyan-300 hover:bg-cyan-500/10 transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Send size={14} className="text-cyan-400" />
                      <span>Telegram ម្ចាស់ប្រព័ន្ធ (@Sokpong168)</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">Chat ›</span>
                  </a>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuth('key');
                    }}
                    className="w-full py-2 px-2.5 rounded-lg text-left text-xs text-yellow-400 hover:bg-yellow-500/10 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Crown size={14} />
                    <span>បញ្ចូល License Key VIP</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('profile');
                    }}
                    className="w-full py-2 px-2.5 rounded-lg text-left text-xs text-emerald-300 hover:bg-emerald-500/10 transition flex items-center gap-2 cursor-pointer"
                  >
                    <User size={14} className="text-emerald-400" />
                    <span>My Account & Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenAuth('login');
                    }}
                    className="w-full py-2 px-2.5 rounded-lg text-left text-xs text-gray-300 hover:text-white hover:bg-[#152618] transition flex items-center gap-2 cursor-pointer"
                  >
                    <User size={14} />
                    <span>ចូលគណនី (Login) / ចុះឈ្មោះ</span>
                  </button>

                  {user && user.id !== 'usr_guest' && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setShowExitModal(true);
                      }}
                      className="w-full py-2 px-2.5 rounded-lg text-left text-xs text-red-400 hover:bg-red-500/10 transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Power size={14} className="text-red-400" />
                        <span>ចេញពីប្រព័ន្ធ (Exit System)</span>
                      </div>
                      <span className="text-[10px] bg-red-500/20 text-red-300 font-bold px-1.5 py-0.2 rounded font-sans">
                        មុខងារថ្មី
                      </span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around py-2 px-2 border-t border-[#142618] bg-[#09120b] text-[11px] font-bold overflow-x-auto gap-1">
        <button
          onClick={() => onNavigate('bot')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
            currentView === 'bot' ? 'text-emerald-400 bg-[#142618]' : 'text-gray-400'
          }`}
        >
          <Radio size={13} />
          <span>Bot</span>
        </button>

        <button
          onClick={() => onNavigate('ai_scan')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentView === 'ai_scan' ? 'text-cyan-300 bg-cyan-500/15' : 'text-cyan-400'
          }`}
        >
          <Camera size={13} />
          <span>AI Scan</span>
        </button>

        <button
          onClick={() => onNavigate('football')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap shrink-0 ${
            currentView === 'football' ? 'text-emerald-300 bg-emerald-500/15' : 'text-emerald-400'
          }`}
        >
          <Trophy size={13} />
          <span>Football AI</span>
        </button>

        <button
          onClick={() => onNavigate('cloud')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
            currentView === 'cloud' ? 'text-orange-300 bg-orange-500/15' : 'text-orange-400'
          }`}
        >
          <Cloud size={13} />
          <span>Cloud</span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
            currentView === 'profile' ? 'text-emerald-300 bg-emerald-500/15' : 'text-gray-300'
          }`}
        >
          <User size={13} />
          <span>Profile</span>
        </button>

        <button
          onClick={() => onOpenStore()}
          className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-yellow-400 hover:text-yellow-300 whitespace-nowrap"
        >
          <Sparkles size={13} />
          <span>VIP</span>
        </button>

        <button
          onClick={() => {
            if (!isAdmin) appState.login('admin');
            onNavigate('admin');
          }}
          className={`flex items-center gap-1 py-1 px-2.5 rounded-lg whitespace-nowrap ${
            currentView === 'admin' ? 'text-red-400 bg-red-500/10' : 'text-gray-400'
          }`}
        >
          <Shield size={13} />
          <span>Admin</span>
        </button>

        <button
          onClick={() => {
            setShowExitModal(true);
          }}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-red-400 hover:text-red-300"
          title="មុខងារចេញពីប្រព័ន្ធ (Exit System)"
        >
          <Power size={14} />
          <span>ចេញ</span>
        </button>
      </div>

      {/* Exit System Modal (New feature requested by user) */}
      <ExitSystemModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onOpenLogin={() => onOpenAuth('login')}
      />
    </header>
  );
};
