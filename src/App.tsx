/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { appState } from './services/store';
import { Navbar, AppViewType } from './components/Navigation/Navbar';
import { AppleBotView } from './components/AppleBot/AppleBotView';
import { AiPhotoScanView } from './components/AppleBot/AiPhotoScanView';
import { FootballPredictionView } from './components/Football/FootballPredictionView';
import { CloudflareFirebaseHub } from './components/Cloudflare/CloudflareFirebaseHub';
import { ProfileAccountView } from './components/Auth/ProfileAccountView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { StoreModal } from './components/Store/StoreModal';
import { AuthModal } from './components/Auth/AuthModal';
import { AppDownloadModal } from './components/AppDownload/AppDownloadModal';
import { CybersecurityModal } from './components/Cybersecurity/CybersecurityModal';
import { ReleaseNotesModal } from './components/ReleaseNotes/ReleaseNotesModal';
import { LiveNotificationToast } from './components/Notifications/LiveNotificationToast';
import { SystemHealth } from './components/SystemHealth/SystemHealth';
import { FirebaseErrorBoundary } from './components/SystemHealth/FirebaseErrorBoundary';
import { SystemRebootModal } from './components/SystemHealth/SystemRebootModal';
import { OperatingHoursBanner } from './components/Navigation/OperatingHoursBanner';
import { OperatingScheduleOverlay } from './components/Schedule/OperatingScheduleOverlay';
import { AutoUpdateMaintenanceOverlay } from './components/Schedule/AutoUpdateMaintenanceOverlay';
import { CyberLoginScreen } from './components/CyberSystem/CyberLoginScreen';
import { CyberWolfBoard } from './components/CyberSystem/CyberWolfBoard';
import { AuthProvider } from './contexts/AuthContext';
import { Shield, Sparkles, Radio, CheckCircle, Info, Download, Smartphone, Cpu } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<AppViewType>('bot');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadInitialTab, setDownloadInitialTab] = useState<'ultra_hack' | 'apk_studio' | 'download' | 'export'>('ultra_hack');
  const [isCyberOpen, setIsCyberOpen] = useState(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'sokrizybet' | 'login' | 'register' | 'key' | '1xbet'>('sokrizybet');
  const [theme, setTheme] = useState<'dark' | 'forest'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('aof_theme') as 'dark' | 'forest') || 'dark';
    }
    return 'dark';
  });
  const [activeBoardStyle, setActiveBoardStyle] = useState<'cyber' | 'classic'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('aof_board_style') as 'cyber' | 'classic') || 'cyber';
    }
    return 'cyber';
  });
  const [, setRerender] = useState(0);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'forest' : 'dark';
    setTheme(nextTheme);
    appState.setTheme(nextTheme);
  };

  const isUserAdminOrOwner =
    appState.currentUser && (appState.currentUser.role === 'admin' || appState.currentUser.role === 'owner');
  const isOperatingHours = appState.isWithinOperatingHours();
  const showScheduledClosedScreen = !isOperatingHours && !isUserAdminOrOwner;
  const isAutoUpdating = appState.isWithinAutoUpdateWindow();
  const showAutoUpdateScreen = isAutoUpdating && !isUserAdminOrOwner;

  useEffect(() => {
    const unsub = appState.subscribe(() => {
      setRerender((r) => r + 1);
    });

    return () => {
      unsub();
    };
  }, []);

  const openAuthWithTab = (tab: 'sokrizybet' | 'login' | 'register' | 'key' | '1xbet' = 'sokrizybet') => {
    setAuthDefaultTab(tab);
    setIsAuthOpen(true);
  };

  const handleOpenStore = () => {
    setIsStoreOpen(true);
  };

  return (
    <FirebaseErrorBoundary>
      <AuthProvider>
        <div className={`min-h-screen ${theme === 'forest' ? 'bg-[#0c1811]' : 'bg-[#070e09]'} text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 transition-colors duration-300`}>
      
      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'store') {
            setIsStoreOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenAuth={openAuthWithTab}
        onOpenStore={handleOpenStore}
        onOpenDownloadModal={() => setIsDownloadOpen(true)}
        onOpenCybersecurity={() => setIsCyberOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Operating Hours Automated Schedule Banner (07:00 AM - 10:00 PM) */}
      <OperatingHoursBanner />

      {/* Main View Container */}
      <main className="flex-1 w-full flex flex-col items-center">
        {currentView === 'bot' ? (
          <div className="w-full flex flex-col items-center">
            {!appState.cyberAuth.isLoggedIn ? (
              <CyberLoginScreen
                onSuccess={() => setRerender((r) => r + 1)}
                onOpenAdmin={() => setCurrentView('admin')}
              />
            ) : activeBoardStyle === 'cyber' ? (
              <div className="w-full flex flex-col items-center">
                {/* Switcher & System Indicator Bar */}
                <div className="w-full max-w-[420px] mx-auto px-4 pt-2.5 pb-1 flex items-center justify-between text-xs z-20">
                  <span className="text-[11px] text-cyan-400 font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>CYBER SYSTEM ACTIVE</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveBoardStyle('classic');
                        try {
                          localStorage.setItem('aof_board_style', 'classic');
                        } catch {}
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#0e1c12] hover:bg-[#152e1c] text-emerald-400 border border-emerald-500/30 text-[10px] font-bold transition cursor-pointer"
                    >
                      📊 Classic View
                    </button>
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="px-2.5 py-1 rounded-lg bg-[#14081c] hover:bg-[#200d2e] text-purple-300 border border-purple-500/30 text-[10px] font-bold transition cursor-pointer"
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <CyberWolfBoard
                  onLogout={() => setRerender((r) => r + 1)}
                  onOpenAdmin={() => setCurrentView('admin')}
                />
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                {/* Switcher bar at top */}
                <div className="w-full max-w-xl mx-auto px-4 pt-3 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>ប្រព័ន្ធចាប់សេវា Apple of Fortune កំពុងដំណើរការ</span>
                  </span>
                  <button
                    onClick={() => {
                      setActiveBoardStyle('cyber');
                      try {
                        localStorage.setItem('aof_board_style', 'cyber');
                      } catch {}
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 text-pink-300 border border-pink-500/40 text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                  >
                    <Sparkles size={12} className="text-pink-400" />
                    <span>⚡ Cyber Wolf Board (New)</span>
                  </button>
                </div>

                <AppleBotView
                  onOpenStore={handleOpenStore}
                  onOpenAuth={(tab) => openAuthWithTab(tab || 'sokrizybet')}
                  onOpenCybersecurity={() => setIsCyberOpen(true)}
                  onOpenDownloadModal={(tab) => {
                    if (tab) setDownloadInitialTab(tab);
                    setIsDownloadOpen(true);
                  }}
                />
              </div>
            )}
          </div>
        ) : currentView === 'ai_scan' ? (
          <AiPhotoScanView
            onApplyToBot={() => {
              setCurrentView('bot');
            }}
          />
        ) : currentView === 'football' ? (
          <FootballPredictionView />
        ) : currentView === 'cloud' ? (
          <CloudflareFirebaseHub />
        ) : currentView === 'profile' ? (
          <ProfileAccountView />
        ) : (
          <AdminDashboard />
        )}
      </main>

      {/* Modals & Live Notification Toast */}
      <StoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        onSuccessOrder={() => {
          // Success handled in modal
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultTab={authDefaultTab}
      />

      <AppDownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
        initialTab={downloadInitialTab}
      />

      <CybersecurityModal
        isOpen={isCyberOpen}
        onClose={() => setIsCyberOpen(false)}
      />

      <ReleaseNotesModal
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
      />

      {/* Operating Hours Automated Schedule Lockout Screen */}
      {showScheduledClosedScreen && (
        <OperatingScheduleOverlay onBypassLogin={() => openAuthWithTab('login')} />
      )}

      {/* Daily Afternoon Auto-Update Window Overlay (3:00 PM - 5:00 PM) */}
      {showAutoUpdateScreen && (
        <AutoUpdateMaintenanceOverlay onBypassLogin={() => openAuthWithTab('login')} />
      )}

      <SystemRebootModal />
      <LiveNotificationToast />

      {/* Footer */}
      <footer className="w-full border-t border-[#132417] bg-[#060c08] py-5 px-4 sm:px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Apple of Fortune Bot System
              </span>
              <button
                type="button"
                onClick={() => setIsReleaseNotesOpen(true)}
                className="px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold transition flex items-center gap-1 cursor-pointer"
                title="មើលព័ត៌មានលម្អិតកំណែថ្មី v2.0.1"
              >
                <Sparkles size={11} className="text-yellow-400" />
                <span>v2.0.1 Release Notes</span>
              </button>
            </div>
            <span className="hidden sm:inline text-gray-600">•</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <span>👑 ម្ចាស់ប្រព័ន្ធ (Owner):</span>
              <strong className="text-white font-mono font-black">By Sokpong</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] flex-wrap justify-center">
            <button
              onClick={() => setIsReleaseNotesOpen(true)}
              className="text-emerald-400 font-bold hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={12} className="text-yellow-400" />
              <span>កំណែថ្មី v2.0.1 (Notes)</span>
            </button>
            <span className="text-gray-700">•</span>
            <button
              onClick={() => setIsDownloadOpen(true)}
              className="text-emerald-400 font-bold hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Download size={13} />
              <span>ទាញយក App (.APK/.IPA)</span>
            </button>
            <span className="text-gray-700">•</span>
            <button
              onClick={() => {
                appState.login('sokpong', 'owner');
                setCurrentView('admin');
              }}
              className="hover:text-emerald-400 transition cursor-pointer text-gray-400"
            >
              Admin & Owner Portal
            </button>
            <span className="text-gray-700">•</span>
            <button
              onClick={handleOpenStore}
              className="hover:text-yellow-400 transition cursor-pointer text-gray-400"
            >
              VIP License Store
            </button>
            <span className="text-gray-700">•</span>
            <button
              onClick={() => openAuthWithTab('key')}
              className="hover:text-white transition cursor-pointer text-gray-400"
            >
              បញ្ចូល VIP Key
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-2 mt-2 border-t border-[#0e1a10] text-[10px] text-gray-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© 2026 Apple of Fortune Signal System • Owned & Engineered by Sokpong</span>
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <span className="font-mono text-cyan-300 font-semibold">
              Host: {appState.config.serverHostIp} 🇰🇭
            </span>
            <span className="text-gray-600">•</span>
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Feed IP: {appState.config.serverFeedIp || '185.195.234.19'} 📡
            </span>
            <SystemHealth variant="compact" />
          </div>
          <span className="font-mono text-gray-500">Cloudflare Enterprise Edge • Cloud SQL Asia-Southeast1</span>
        </div>
      </footer>

        </div>
      </AuthProvider>
    </FirebaseErrorBoundary>
  );
}
