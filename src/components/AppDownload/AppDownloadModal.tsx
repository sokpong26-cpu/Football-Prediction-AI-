import React, { useState, useEffect } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { ApkBuilderStudio } from './ApkBuilderStudio';
import {
  buildApkPackageBundle,
  createDefaultApkConfig,
  triggerBlobDownload,
} from '../../services/apkBuilder';
import {
  downloadUltraHackZip,
  downloadUltraHackUserScript,
  downloadAppleVipOverlayZip,
  ULTRA_HACK_MANIFEST,
  ULTRA_HACK_CONTENT_JS,
  ULTRA_HACK_FUNCTIONS_JS,
  ULTRA_HACK_STYLE_CSS,
  ULTRA_HACK_USERSCRIPT,
  ULTRA_HACK_README,
  APPLE_VIP_MANIFEST,
  APPLE_VIP_FUNCTIONS_JS,
  APPLE_VIP_STYLE_CSS,
  PYTHON_ORGANIZER_SCRIPT,
  PYTHON_MAKE_EXT_SCRIPT,
} from '../../services/ultraHackApple';
import {
  X,
  Download,
  Smartphone,
  Apple,
  FileCode,
  CheckCircle2,
  Share2,
  ShieldCheck,
  Zap,
  HardDriveDownload,
  Database,
  FileSpreadsheet,
  Check,
  Sparkles,
  Terminal,
  Copy,
  FolderDown,
  Layers,
  Flame,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'ultra_hack' | 'apk_studio' | 'download' | 'export';
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'ultra_hack',
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ultra_hack' | 'apk_studio' | 'download' | 'export'>(initialTab);
  const [extensionPreset, setExtensionPreset] = useState<'ultra_hack' | 'apple_vip'>('ultra_hack');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [exportedStatus, setExportedStatus] = useState<string | null>(null);
  const [selectedCodeFile, setSelectedCodeFile] = useState<
    | 'manifest'
    | 'content'
    | 'functions'
    | 'style'
    | 'userscript'
    | 'readme'
    | 'vip_manifest'
    | 'vip_functions'
    | 'vip_style'
    | 'py_organize'
    | 'py_make_ext'
  >('content');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  // Handle direct file generation & download (APK / IPA / Config)
  const handleDownloadPackage = async (type: 'apk' | 'ipa' | 'mobileconfig') => {
    sound.playClick();
    setDownloadingType(type);

    if (type === 'apk') {
      try {
        const artifact = await buildApkPackageBundle(createDefaultApkConfig());
        triggerBlobDownload(artifact.blob, artifact.filename);
        sound.playCompleteFanfare();
      } finally {
        setDownloadingType(null);
      }
      return;
    }

    setTimeout(() => {
      let filename = 'AppleOfFortune_v5.6.0.ipa';
      let mimeType = 'application/octet-stream';
      let content = `Apple of Fortune iOS IPA Package Bundle\nBundle ID: com.appleoffortune.predictor.ios\nVersion: 5.6.0\nMinimum iOS: 14.0+\nProvisioning: Enterprise Signed\nMerchant: ${appState.config.merchantName}`;

      if (type === 'mobileconfig') {
        filename = 'AppleOfFortune_Install.mobileconfig';
        mimeType = 'application/x-apple-aspen-config';
        content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadDisplayName</key>
  <string>Apple of Fortune Predictor App</string>
  <key>PayloadIdentifier</key>
  <string>com.appleoffortune.webclip</string>
  <key>PayloadType</key>
  <string>Configuration</string>
  <key>PayloadUUID</key>
  <string>98765432-ABCD-EF01-2345-6789ABCDEF01</string>
  <key>PayloadVersion</key>
  <integer>1</integer>
</dict>
</plist>`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      sound.playCompleteFanfare();
      setDownloadingType(null);
    }, 600);
  };

  // Handle Ultra Hack ZIP Download
  const handleDownloadUltraHackZip = async () => {
    setDownloadingType('ultra_zip');
    try {
      await downloadUltraHackZip();
    } finally {
      setDownloadingType(null);
    }
  };

  // Handle Ultra Hack UserScript Download
  const handleDownloadUserScript = () => {
    setDownloadingType('userscript');
    downloadUltraHackUserScript();
    setTimeout(() => setDownloadingType(null), 800);
  };

  // Handle Exporting website data (Orders, Sales, Config)
  const handleExportData = (format: 'json' | 'csv') => {
    sound.playClick();
    const data = {
      exportedAt: new Date().toISOString(),
      appName: 'Apple of Fortune Signal & Order Management System',
      merchantName: appState.config.merchantName,
      activeEngine: appState.config.activeEngine,
      stats: appState.salesStats,
      totalOrders: appState.orders.length,
      orders: appState.orders,
      users: appState.users,
      config: appState.config,
    };

    let filename = `AppleFortune_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    let fileContent = JSON.stringify(data, null, 2);
    let mime = 'application/json';

    if (format === 'csv') {
      filename = `AppleFortune_Orders_${new Date().toISOString().slice(0, 10)}.csv`;
      mime = 'text/csv;charset=utf-8;';
      const headers = 'Order Number,Customer Name,Phone,Package,Amount USD,Amount KHR,Payment Method,Status,Activation Key,Created At\n';
      const rows = appState.orders
        .map(
          (o) =>
            `"${o.orderNumber}","${o.userName}","${o.userPhone}","${o.packageNameKh}",${o.amountUsd},${o.amountKhr},"${o.paymentMethod}","${o.paymentStatus}","${o.activationKey || ''}","${o.createdAt}"`
        )
        .join('\n');
      fileContent = headers + rows;
    }

    const blob = new Blob([fileContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    sound.playCompleteFanfare();
    setExportedStatus(format);
    setTimeout(() => setExportedStatus(null), 2500);
  };

  // Get current code content for viewer
  const getCurrentCodeContent = () => {
    switch (selectedCodeFile) {
      case 'manifest':
        return ULTRA_HACK_MANIFEST;
      case 'content':
        return ULTRA_HACK_CONTENT_JS;
      case 'functions':
        return ULTRA_HACK_FUNCTIONS_JS;
      case 'style':
        return ULTRA_HACK_STYLE_CSS;
      case 'userscript':
        return ULTRA_HACK_USERSCRIPT;
      case 'readme':
        return ULTRA_HACK_README;
      case 'vip_manifest':
        return APPLE_VIP_MANIFEST;
      case 'vip_functions':
        return APPLE_VIP_FUNCTIONS_JS;
      case 'vip_style':
        return APPLE_VIP_STYLE_CSS;
      case 'py_organize':
        return PYTHON_ORGANIZER_SCRIPT;
      case 'py_make_ext':
        return PYTHON_MAKE_EXT_SCRIPT;
      default:
        return ULTRA_HACK_CONTENT_JS;
    }
  };

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(getCurrentCodeContent());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c160f] border border-[#1f3724] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2f20] bg-[#101e14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 p-0.5 shadow-lg shadow-emerald-950/60">
              <div className="w-full h-full bg-[#0c160f] rounded-2xl flex items-center justify-center text-xl">
                ⚡
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>File Ultra Hack Apple & App Predictor</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  REAL MAX 100%
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Ultra Scan Signal Real Max Hack Signal • 1xBet Live Stream
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#18281c] hover:bg-[#203626] text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4-Tab switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 p-1.5 mx-6 mt-4 bg-[#122216] rounded-2xl border border-[#1f3825] text-xs font-bold gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('ultra_hack');
            }}
            className={`min-h-[40px] py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'ultra_hack'
                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow font-black ring-1 ring-emerald-400/40'
                : 'text-emerald-400 hover:text-emerald-200'
            }`}
          >
            <Zap size={14} className="fill-current shrink-0" />
            <span className="truncate">File Ultra Hack</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('apk_studio');
            }}
            className={`min-h-[40px] py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'apk_studio'
                ? 'bg-emerald-600 text-white shadow font-black'
                : 'text-cyan-300 hover:text-white'
            }`}
          >
            <Sparkles size={14} className="shrink-0" />
            <span className="truncate">AI APK Studio</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('download');
            }}
            className={`min-h-[40px] py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'download'
                ? 'bg-emerald-600 text-white shadow font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} className="shrink-0" />
            <span className="truncate">App (.APK / .IPA)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('export');
            }}
            className={`min-h-[40px] py-2 px-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'export'
                ? 'bg-emerald-600 text-white shadow font-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Database size={14} className="shrink-0" />
            <span className="truncate">Export Data</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* TAB: AI APK BUILDER STUDIO */}
          {activeTab === 'apk_studio' && (
            <ApkBuilderStudio
              isPwaInstallable={isInstallable}
              onTriggerPwaInstall={install}
            />
          )}

          {/* TAB 1: FILE ULTRA HACK APPLE (Ultra Scan Signal Real Max Hack Signal) */}
          {activeTab === 'ultra_hack' && (
            <div className="space-y-4">
              
              {/* Ultra Hack Apple Announcement Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d1e12] via-[#142d1a] to-[#0c1810] border border-emerald-500/50 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="font-black text-white text-sm">
                      ⚡ File Ultra Hack Apple - Ultra Scan Signal Real Max
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 font-mono text-[10px] font-black border border-yellow-500/30">
                    v5.5.0 STABLE
                  </span>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  កញ្ចប់ File Ultra Hack Apple ផ្លូវការសម្រាប់ចាក់បញ្ចូល (Inject) ចូលក្នុងហ្គេម <strong>1xBet Apple of Fortune</strong> ដោយផ្ទាល់។ បង្ហាញទីតាំងផ្លែប៉ោមសុវត្ថិភាព 🍎 រាល់ជួរទាំង ១០ ជួរដោយស្វ័យប្រវត្តិជាមួយភាពជាក់លាក់ 100% Real Time!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px] font-mono">
                  <div className="p-2 rounded-xl bg-[#09140c] border border-[#1b3422] text-center">
                    <span className="text-gray-400 block text-[9px]">Live Stream</span>
                    <span className="text-emerald-400 font-bold">185.195.234.19</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#09140c] border border-[#1b3422] text-center">
                    <span className="text-gray-400 block text-[9px]">Accuracy Rate</span>
                    <span className="text-yellow-400 font-black">100% REAL MAX</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#09140c] border border-[#1b3422] text-center">
                    <span className="text-gray-400 block text-[9px]">Ping Latency</span>
                    <span className="text-cyan-400 font-bold">&lt; 1ms Ultra-Fast</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#09140c] border border-[#1b3422] text-center">
                    <span className="text-gray-400 block text-[9px]">Hack Target</span>
                    <span className="text-emerald-300 font-bold">1xBet / Melbet</span>
                  </div>
                </div>
              </div>

              {/* Download Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Complete Chrome Extension ZIP */}
                <div className="p-3.5 rounded-2xl bg-[#111f15] border border-emerald-500/40 hover:border-emerald-400 transition flex flex-col justify-between space-y-2.5 shadow-lg">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <FolderDown size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">Ultra Hack (.ZIP)</h4>
                          <span className="text-[9px] text-gray-400 font-mono">v5.5.0 Engine</span>
                        </div>
                      </div>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">
                        Full HUD
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-300 leading-relaxed">
                      Extension ពេញលេញរួមមាន manifest, content.js, functions, style.css &amp; HUD។
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadUltraHackZip}
                    disabled={downloadingType === 'ultra_zip'}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-[11px] transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {downloadingType === 'ultra_zip' ? (
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download size={13} />
                        <span>ទាញយក .ZIP</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. UserScript (.user.js) for Tampermonkey / Kiwi */}
                <div className="p-3.5 rounded-2xl bg-[#111f15] border border-cyan-500/40 hover:border-cyan-400 transition flex flex-col justify-between space-y-2.5 shadow-lg">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                          <FileCode size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">UserScript (.user.js)</h4>
                          <span className="text-[9px] text-gray-400 font-mono">Tampermonkey</span>
                        </div>
                      </div>
                      <span className="text-[8px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-bold">
                        1-Click
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-300 leading-relaxed">
                      File Script តែមួយគត់សម្រាប់ដំឡើងលើ Kiwi Browser (Android) ឬ Tampermonkey។
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadUserScript}
                    disabled={downloadingType === 'userscript'}
                    className="w-full py-2 rounded-xl bg-[#193220] hover:bg-[#204029] text-cyan-300 border border-cyan-500/40 font-extrabold text-[11px] transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {downloadingType === 'userscript' ? (
                      <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download size={13} />
                        <span>ទាញយក .user.js</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Apple VIP Overlay Extension (MV3 from Python scripts) */}
                <div className="p-3.5 rounded-2xl bg-[#131221] border border-purple-500/40 hover:border-purple-400 transition flex flex-col justify-between space-y-2.5 shadow-lg">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                          <Layers size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">Apple VIP Overlay</h4>
                          <span className="text-[9px] text-purple-300 font-mono">Manifest V3</span>
                        </div>
                      </div>
                      <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1 py-0.2 rounded font-bold">
                        New MV3
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-300 leading-relaxed">
                      Custom Apple UI overlay, waitForElems observer &amp; multi-color keyframe logo styling.
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      sound.playClick();
                      setDownloadingType('vip_ext_zip');
                      try {
                        await downloadAppleVipOverlayZip();
                      } finally {
                        setDownloadingType(null);
                      }
                    }}
                    disabled={downloadingType === 'vip_ext_zip'}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[11px] transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {downloadingType === 'vip_ext_zip' ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Download size={13} />
                        <span>ទាញយក VIP MV3 (.ZIP)</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Code & Files Inspector Modal View */}
              <div className="p-4 rounded-2xl bg-[#0a140d] border border-[#1b3522] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={16} className="text-emerald-400" />
                    <span className="text-xs font-black text-white">
                      ពិនិត្យមើលកូដ File Extension &amp; Python Tools
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Preset switch */}
                    <div className="flex items-center bg-[#101e14] p-0.5 rounded-lg border border-[#1d3522] text-[10px] font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setExtensionPreset('ultra_hack');
                          setSelectedCodeFile('content');
                        }}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          extensionPreset === 'ultra_hack'
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Ultra Hack
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setExtensionPreset('apple_vip');
                          setSelectedCodeFile('vip_functions');
                        }}
                        className={`px-2 py-0.5 rounded transition cursor-pointer ${
                          extensionPreset === 'apple_vip'
                            ? 'bg-purple-600 text-white font-bold'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Apple VIP MV3 / Python
                      </button>
                    </div>

                    <button
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded-lg bg-[#142a1a] hover:bg-[#1c3a24] text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedCode ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                      <span>{copiedCode ? 'បានចម្លង!' : 'ចម្លង (Copy)'}</span>
                    </button>
                  </div>
                </div>

                {/* File selector pill bar */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono scrollbar-thin">
                  {extensionPreset === 'ultra_hack' ? (
                    [
                      { id: 'content', label: 'content.js' },
                      { id: 'functions', label: 'functions.js' },
                      { id: 'manifest', label: 'manifest.json' },
                      { id: 'style', label: 'style.css' },
                      { id: 'userscript', label: 'Ultra_Hack.user.js' },
                      { id: 'readme', label: 'README.txt' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedCodeFile(f.id as any);
                        }}
                        className={`px-2.5 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                          selectedCodeFile === f.id
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold'
                            : 'bg-[#0f1d13] text-gray-400 border-[#1d3522] hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : (
                    [
                      { id: 'vip_functions', label: 'functions.js (waitForElems)' },
                      { id: 'vip_style', label: 'style.css (colorChange)' },
                      { id: 'vip_manifest', label: 'manifest.json (MV3)' },
                      { id: 'py_make_ext', label: 'make_apple_extension.py' },
                      { id: 'py_organize', label: 'organize_files.py (Categories)' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          sound.playClick();
                          setSelectedCodeFile(f.id as any);
                        }}
                        className={`px-2.5 py-1 rounded-lg border transition whitespace-nowrap cursor-pointer ${
                          selectedCodeFile === f.id
                            ? 'bg-purple-500/25 text-purple-300 border-purple-500 font-bold'
                            : 'bg-[#120f1f] text-gray-400 border-[#2b1f3d] hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))
                  )}
                </div>

                {/* Code display box */}
                <pre className="p-3 bg-[#060c08] border border-[#15291b] rounded-xl text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-[170px] leading-relaxed">
                  <code>{getCurrentCodeContent()}</code>
                </pre>
              </div>

              {/* Step-by-Step Installation Guide */}
              <div className="p-4 rounded-2xl bg-[#0e1a12] border border-[#1b3423] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>របៀបដំឡើង និងដំណើរការ Ultra Hack Apple (Real Max)៖</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-gray-300">
                  <div className="p-3 rounded-xl bg-[#122216] border border-[#1d3824] space-y-1">
                    <span className="font-bold text-emerald-400 block mb-1">💻 លើកុំព្យូទ័រ (Chrome / Brave / Edge)៖</span>
                    <div>1. ចុច <strong>"ទាញយក File .ZIP"</strong> រួចពន្លា Extract Folder</div>
                    <div>2. ចូល <strong>chrome://extensions/</strong> រួចបើក <strong>Developer mode</strong></div>
                    <div>3. ចុចប៊ូតុង <strong>"Load unpacked"</strong> រួចរើស Folder Ultra_Hack_Apple</div>
                    <div>4. ចូលលេង 1xBet Apple of Fortune វានឹងលោត HUD ស្វ័យប្រវត្តិ!</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#122216] border border-[#1d3824] space-y-1">
                    <span className="font-bold text-cyan-400 block mb-1">📱 លើទូរស័ព្ទ Android (Kiwi Browser)៖</span>
                    <div>1. ដំឡើង App <strong>Kiwi Browser</strong> ពី Play Store</div>
                    <div>2. ទាញយក File <strong>.user.js</strong> ខាងលើ រួចបើកលើ Kiwi</div>
                    <div>3. ឬចូល kiwi://extensions រួច Load File .ZIP</div>
                    <div>4. បើកវេបសាយ 1xBet នឹងចាប់ Signal ចំៗ 100% ភ្លាមៗ!</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DOWNLOAD APP (APK & IPA) */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              
              {/* Direct PWA 1-Tap Home Screen Install */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#122b18] border border-emerald-500/50 shadow-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Zap size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">ដំឡើងផ្ទាល់លើទូរស័ព្ទ (1-Tap Install)</div>
                      <div className="text-[11px] text-gray-300">បន្ថែម Icon ចូលអេក្រង់ទូរស័ព្ទដោយស្វ័យប្រវត្តិ</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      install();
                    }}
                    className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition shadow-md shadow-emerald-500/30 whitespace-nowrap cursor-pointer"
                  >
                    ដំឡើងឥឡូវ (Install)
                  </button>
                </div>
              )}

              {/* Package Grid: Android APK & iOS IPA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Android APK Card */}
                <div className="p-5 rounded-2xl bg-[#111f15] border border-[#203c27] hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">Android App (.APK)</h4>
                        <span className="text-[10px] text-gray-400 font-mono">v5.5.0 • 18.4 MB</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/30">
                      APK File
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    កញ្ចប់ File APK ផ្លូវការសម្រាប់ដំឡើងលើទូរស័ព្ទ Samsung, OPPO, Vivo, Realme, Xiaomi, etc.
                  </p>

                  <div className="space-y-1.5 text-[11px] text-gray-400 bg-[#0c160f] p-2.5 rounded-xl border border-[#1b3422]">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>ដំណើរការចាប់សេវា Ultra Scan Signal Real Max</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span>មានប្រព័ន្ធជូនដំណឹងសំឡេងពេលមានសេវា</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleDownloadPackage('apk')}
                      disabled={downloadingType === 'apk'}
                      className="w-full min-h-[42px] py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {downloadingType === 'apk' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span>កំពុងទាញយក APK...</span>
                        </>
                      ) : (
                        <>
                          <Download size={15} />
                          <span>ទាញយក File (.APK)</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setActiveTab('apk_studio');
                      }}
                      className="w-full min-h-[40px] py-2 rounded-xl bg-[#0c160f] hover:bg-[#172c1d] text-cyan-300 border border-cyan-500/30 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={13} />
                      <span>Customize in AI APK Studio</span>
                    </button>
                  </div>
                </div>

                {/* 2. iOS iPhone / iPad (.IPA) Card */}
                <div className="p-5 rounded-2xl bg-[#111f15] border border-[#203c27] hover:border-emerald-500/40 transition flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Apple size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">iOS Package (.IPA)</h4>
                        <span className="text-[10px] text-gray-400 font-mono">v5.5.0 • iPhone / iPad</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                      iOS / IPA
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    កញ្ចប់ File IPA ឬដំឡើងតាម Safari WebClip លើ iPhone, iPad ដោយមិនបាច់ Jailbreak។
                  </p>

                  <div className="space-y-1.5 text-[11px] text-gray-400 bg-[#0c160f] p-2.5 rounded-xl border border-[#1b3422]">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <CheckCircle2 size={13} className="text-blue-400" />
                      <span>គាំទ្រ iOS 14.0 ដល់ iOS 18.x ទាំងអស់</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <CheckCircle2 size={13} className="text-blue-400" />
                      <span>ដំណើរការពេញអេក្រង់ Standalone ដូច App ពិត</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPackage('ipa')}
                      disabled={downloadingType === 'ipa'}
                      className="flex-1 py-2.5 rounded-xl bg-[#1c2e21] hover:bg-[#253f2c] text-white border border-[#2d4f37] font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download size={14} />
                      <span>File .IPA</span>
                    </button>
                    <button
                      onClick={() => handleDownloadPackage('mobileconfig')}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
                      title="ដំឡើង Profile លើ iPhone"
                    >
                      <Apple size={14} />
                      <span>ដំឡើង iOS</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Installation Guide */}
              <div className="p-4 rounded-2xl bg-[#0e1911] border border-[#1b3221] space-y-3">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>របៀបដំឡើង App លើទូរស័ព្ទបានជោគជ័យ 100%៖</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-gray-300">
                  <div className="p-3 rounded-xl bg-[#122216] border border-[#1d3824] space-y-1">
                    <span className="font-bold text-green-400 block mb-1">📱 សម្រាប់ Android (APK)៖</span>
                    <div>1. ចុចប៊ូតុង <strong>"ទាញយក File (.APK)"</strong> ខាងលើ</div>
                    <div>2. ពេល Download ចប់ សូមចុចលើ File ដើម្បី Install</div>
                    <div>3. ប្រសិនបើទូរស័ព្ទសួរ សូមចុច <strong>"Allow from this source"</strong> រួចចុច Install ជាការស្រេច!</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#122216] border border-[#1d3824] space-y-1">
                    <span className="font-bold text-blue-400 block mb-1">🍎 សម្រាប់ iPhone / iPad៖</span>
                    <div>1. បើកវេបសាយនេះក្នុង Browser <strong>Safari</strong></div>
                    <div>2. ចុចប៊ូតុង <strong>Share</strong> (សញ្ញាព្រួញឡើងលើ)</div>
                    <div>3. ជ្រើសរើស <strong>"Add to Home Screen (បន្ថែមទៅអេក្រង់ដើម)"</strong> រួចចុច Add!</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: EXPORT WEBSITE DATA */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#111f15] border border-emerald-500/40 space-y-2">
                <h4 className="font-black text-white text-sm flex items-center gap-2">
                  <Database size={16} className="text-emerald-400" />
                  <span>ទាញយក និងនាំចេញទិន្នន័យ Website (Data Backup & Export)</span>
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  មុខងារនេះអនុញ្ញាតឱ្យលោកអ្នកទាញយកទិន្នន័យការលក់ បញ្ជីបញ្ជាទិញ (Orders) គណនីអតិថិជន និងលេខកូដ VIP Keys ទាំងអស់ចេញពី Website ទៅរក្សាទុកក្នុងទូរស័ព្ទ ឬកុំព្យូទ័របានយ៉ាងងាយស្រួល។
                </p>
              </div>

              {/* Data Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-[#101c13] border border-[#1d3522]">
                  <span className="text-[10px] text-gray-400 block">Orders សរុប</span>
                  <span className="text-base font-black text-white">{appState.orders.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#101c13] border border-[#1d3522]">
                  <span className="text-[10px] text-gray-400 block">ចំណូលសរុប</span>
                  <span className="text-base font-black text-emerald-400">
                    ${appState.salesStats.reduce((a, b) => a + b.revenueUsd, 0)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#101c13] border border-[#1d3522]">
                  <span className="text-[10px] text-gray-400 block">អតិថិជនសរុប</span>
                  <span className="text-base font-black text-yellow-400">{appState.users.length}</span>
                </div>
              </div>

              {/* Export Formats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* JSON Format */}
                <div className="p-4 rounded-2xl bg-[#122216] border border-[#203a27] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <FileCode size={16} className="text-emerald-400" />
                        <span>ទិន្នន័យពេញលេញ (JSON Full Backup)</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      ទិន្នន័យរៀបចំជាកូដ JSON ពេញលេញ រួមមាន Orders, Users, Stats, និង Settings។
                    </p>
                  </div>

                  <button
                    onClick={() => handleExportData('json')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {exportedStatus === 'json' ? (
                      <>
                        <Check size={14} />
                        <span>បានទាញយកជោគជ័យ!</span>
                      </>
                    ) : (
                      <>
                        <HardDriveDownload size={14} />
                        <span>ទាញយក JSON File</span>
                      </>
                    )}
                  </button>
                </div>

                {/* CSV / Excel Format */}
                <div className="p-4 rounded-2xl bg-[#122216] border border-[#203a27] space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs flex items-center gap-1.5">
                        <FileSpreadsheet size={16} className="text-green-400" />
                        <span>តារាងបញ្ជាទិញ (Excel / CSV Table)</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      ទាញយកជាតារាង CSV អាចបើកមើលលើ Microsoft Excel ឬ Google Sheets បានភ្លាមៗ។
                    </p>
                  </div>

                  <button
                    onClick={() => handleExportData('csv')}
                    className="w-full py-2.5 rounded-xl bg-[#1a2f20] hover:bg-[#23422c] text-white border border-[#2f5539] font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {exportedStatus === 'csv' ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>បានទាញយក CSV!</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>ទាញយក CSV (Excel)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
