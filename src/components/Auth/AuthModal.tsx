import React, { useState, useEffect } from 'react';
import { appState } from '../../services/store';
import { sound } from '../../services/sound';
import {
  X,
  User,
  ShieldCheck,
  Key,
  LogIn,
  UserPlus,
  Sparkles,
  Phone,
  Lock,
  Crown,
  CheckCircle2,
  AlertCircle,
  Radio,
  Zap,
  Server,
  Trash2,
  Globe,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'sokrizybet' | 'login' | 'register' | 'key' | '1xbet';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'sokrizybet',
}) => {
  const [tab, setTab] = useState<'sokrizybet' | 'login' | 'register' | 'key' | '1xbet'>(defaultTab);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setMessage(null);
    }
  }, [defaultTab, isOpen]);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // Key form
  const [keyInput, setKeyInput] = useState('');

  // SokRizyBet ID form
  const [sokRizyBetId, setSokRizyBetId] = useState('');
  const [sokRizyBetKey, setSokRizyBetKey] = useState('');

  // 1xBet ID form
  const [oneXBetId, setOneXBetId] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const storedCred = appState.getStoredCredentials();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = appState.login(loginIdentifier);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 800);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handleSokRizyBetLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = appState.loginWithSokRizyBetId(sokRizyBetId, sokRizyBetKey);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 750);
    } else {
      sound.playError();
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handle1xBetLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = appState.loginWith1xBetId(oneXBetId);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 800);
    } else {
      sound.playError();
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handleQuickLogin = () => {
    sound.playClick();
    const res = appState.quickLogin();
    if (res.success) {
      setMessage({ text: `⚡ ចូលគណនីរហ័សជោគជ័យ: ${res.user.name}`, type: 'success' });
      sound.playCompleteFanfare();
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 700);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handleClearStored = () => {
    sound.playClick();
    appState.clearStoredCredentials();
    setMessage({ text: 'បានជម្រះព័ត៌មានសម្ងាត់ចេញពី Browser', type: 'success' });
    setTimeout(() => setMessage(null), 1200);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const res = appState.register(regName, regUsername, regPhone);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 800);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  const handleActivateKey = (e: React.FormEvent) => {
    e.preventDefault();
    const res = appState.activateKey(keyInput);
    if (res.success) {
      setMessage({ text: res.message, type: 'success' });
      setKeyInput('');
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1000);
    } else {
      setMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c160f] border border-[#1f3724] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1b2f20] bg-[#101e14]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                ប្រព័ន្ធសុវត្ថិភាព & គណនី (Authentication)
              </h2>
              <p className="text-[10px] text-gray-400">
                1xBet Server IP: 185.195.234.19 • Cambodia Host: 103.216.51.188
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#18281c] hover:bg-[#203626] text-gray-400 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Browser-Stored Quick Login Banner for Returning Users */}
          {storedCred && (
            <div className="m-4 mb-2 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#122416] to-[#0c1810] border border-emerald-500/40 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>⚡ ចូលគណនីរហ័ស (Quick Login)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      256-bit Encrypted
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearStored}
                  className="text-gray-500 hover:text-rose-400 transition text-[10px] flex items-center gap-0.5"
                  title="លុបព័ត៌មានដែលបានរក្សាទុក"
                >
                  <Trash2 size={11} />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1b3622]">
                <div className="flex flex-col">
                  <span className="font-bold text-emerald-300 truncate max-w-[180px]">
                    {storedCred.displayName} (@{storedCred.username})
                  </span>
                  {storedCred.oneXBetId && (
                    <span className="text-[10px] text-cyan-300 font-mono">
                      1xBet ID: #{storedCred.oneXBetId} (Linked to 185.195.234.19)
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleQuickLogin}
                  className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition shadow-md flex items-center gap-1 cursor-pointer"
                >
                  <span>ចូលភ្លាមៗ</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* 5-Tab Switcher: SokRizyBet | 1xBet ID | Login | Register | VIP Key */}
          <div className="grid grid-cols-3 sm:grid-cols-5 p-1 mx-4 mt-3 bg-[#122216] rounded-xl border border-[#1f3825] text-[11px] font-semibold gap-1">
            <button
              onClick={() => {
                sound.playClick();
                setTab('sokrizybet');
                setMessage(null);
              }}
              className={`min-h-[38px] py-1.5 px-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                tab === 'sokrizybet'
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black shadow-md'
                  : 'text-emerald-300 hover:text-white'
              }`}
            >
              <Zap size={12} fill={tab === 'sokrizybet' ? 'currentColor' : 'none'} />
              <span>SokRizyBet</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setTab('1xbet');
                setMessage(null);
              }}
              className={`min-h-[38px] py-1.5 px-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                tab === '1xbet'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black shadow-md'
                  : 'text-cyan-400 hover:text-white'
              }`}
            >
              <Globe size={12} />
              <span>1xBet ID</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setTab('login');
                setMessage(null);
              }}
              className={`min-h-[38px] py-1.5 px-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                tab === 'login'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ចូលគណនី
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setTab('register');
                setMessage(null);
              }}
              className={`min-h-[38px] py-1.5 px-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                tab === 'register'
                  ? 'bg-emerald-600 text-white font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ចុះឈ្មោះ
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setTab('key');
                setMessage(null);
              }}
              className={`min-h-[38px] py-1.5 px-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                tab === 'key'
                  ? 'bg-yellow-500 text-black font-bold shadow'
                  : 'text-yellow-400 hover:text-white'
              }`}
            >
              Key VIP
            </button>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`mx-4 mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/20 border border-red-500/40 text-red-300'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Forms Section */}
          <div className="p-4 pt-3">
            {/* TAB: SOKRIZYBET ACCOUNT ID LOGIN */}
            {tab === 'sokrizybet' && (
              <form onSubmit={handleSokRizyBetLogin} className="space-y-3.5">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0e241b] to-[#0a1510] border border-emerald-500/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Radio size={14} className="text-emerald-400 animate-pulse" />
                      <span>SokRizyBet Live AI Gateway</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                      60 FPS · 1ms
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    បញ្ចូល <strong>SokRizyBet ID Account</strong> របស់អ្នកដើម្បីភ្ជាប់ជាមួយ{' '}
                    <strong>Power Max Scan Signal AI</strong> និងចាប់ Signal រហ័ស រលូន Real-Time 100%!
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-emerald-300 font-bold mb-1">
                    SokRizyBet ID Account (ត្រូវការ ID Account):
                  </label>
                  <div className="relative">
                    <Zap size={16} className="absolute left-3 top-3 text-emerald-400" />
                    <input
                      type="text"
                      value={sokRizyBetId}
                      onChange={(e) => setSokRizyBetId(e.target.value)}
                      placeholder="បញ្ចូល SokRizyBet ID Account (min 5 chars)"
                      className="w-full min-h-[42px] pl-9 pr-3 py-2.5 rounded-xl bg-[#0e2116] border border-emerald-500/40 text-white font-mono font-bold text-sm focus:outline-none focus:border-emerald-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 font-medium mb-1">
                    VIP Activation Key (ស្រេចចិត្ត / Optional):
                  </label>
                  <div className="relative">
                    <Key size={15} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={sokRizyBetKey}
                      onChange={(e) => setSokRizyBetKey(e.target.value)}
                      placeholder="បញ្ចូល Key (Optional)"
                      className="w-full min-h-[42px] pl-9 pr-3 py-2.5 rounded-xl bg-[#0e2116] border border-[#224129] text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[44px] py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:brightness-110 text-black font-black text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap size={16} fill="currentColor" />
                  <span>ភ្ជាប់ SokRizyBet ID &amp; Power Max Scan AI</span>
                </button>
              </form>
            )}

            {/* TAB 0: 1XBET ACCOUNT ID LOGIN */}
            {tab === '1xbet' && (
              <form onSubmit={handle1xBetLogin} className="space-y-3.5">
                {/* 1xBet Server Connection Status Card */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0e1d24] to-[#0a1510] border border-cyan-500/40 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <Radio size={14} className="text-cyan-400 animate-pulse" />
                      <span>1xBet Global Live Feed Gateway</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                      IP: 185.195.234.19
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    បញ្ចូលលេខសម្គាល់ <strong>1xBet Account ID</strong> របស់អ្នកដើម្បីភ្ជាប់ជាមួយ Server 185.195.234.19 និងចាប់ Signal <strong>100% Smooth Real-time</strong> ក្នុង Apple of Fortune!
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-cyan-500/20 font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> 100% Ultra Smooth (60 FPS)
                    </span>
                    <span>Ping: 1ms • Port: 8443</span>
                  </div>
                </div>

                {/* 1xBet Account ID input */}
                <div>
                  <label className="block text-xs text-cyan-300 font-bold mb-1">
                    លេខសម្គាល់គណនី 1xBet (1xBet Account ID):
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-3 text-cyan-400" />
                    <input
                      type="text"
                      value={oneXBetId}
                      onChange={(e) => setOneXBetId(e.target.value.replace(/\D/g, ''))}
                      placeholder="បញ្ចូល 1xBet ID Account (min 5 digits)"
                      className="w-full min-h-[42px] pl-9 pr-3 py-2.5 rounded-xl bg-[#10221e] border border-cyan-500/40 text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    លេខសម្គាល់ 7 ដល់ 10 ខ្ទង់របស់អ្នកលើវេបសាយ 1xBet / Melbet
                  </span>
                </div>

                {/* Instant Connect - No PIN or Password Required */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300">
                  <CheckCircle2 size={15} className="text-cyan-400 shrink-0" />
                  <span>មិនទាមទារ Password ឬ PIN ទេ — ភ្ជាប់ Server 185.195.234.19 ផ្ទាល់ (No Password Required)</span>
                </div>

                {/* Submit Connect Button */}
                <button
                  type="submit"
                  className="w-full min-h-[44px] py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap size={16} fill="currentColor" />
                  <span>ភ្ជាប់ Server 185.195.234.19 &amp; ចាប់ Signal 100% Smooth</span>
                </button>
              </form>
            )}

            {/* TAB 1: STANDARD LOGIN */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    ឈ្មោះគណនី ឬលេខទូរស័ព្ទ (Username / Phone):
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="admin ឬ sokha_apple"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#142417] border border-[#233c28] text-white text-xs focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    ពាក្យសម្ងាត់ (Password ចូលគណនី):
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="បញ្ចូល Password..."
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#142417] border border-[#233c28] text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white cursor-pointer transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={15} />
                  <span>ចូលគណនី (Login)</span>
                </button>
              </form>
            )}

            {/* TAB 2: REGISTER */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    ឈ្មោះពេញ (Full Name):
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="ឧ. សុខ វិបុល"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#142417] border border-[#233c28] text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    ឈ្មោះគណនី (Username):
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="ឧ. sok_vibul77"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#142417] border border-[#233c28] text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    លេខទូរស័ព្ទ / Telegram:
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-3 text-gray-500" />
                    <input
                      type="text"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="ឧ. 096 777 8888"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#142417] border border-[#233c28] text-white text-xs focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus size={15} />
                  <span>បង្កើតគណនីថ្មី (Create Account)</span>
                </button>
              </form>
            )}

            {/* TAB 3: ACTIVATE VIP KEY */}
            {tab === 'key' && (
              <form onSubmit={handleActivateKey} className="space-y-4">
                <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Crown size={14} /> បញ្ចូលលេខកូដសកម្ម VIP Key
                  </div>
                  <div>
                    ប្រសិនបើលោកអ្នកបានទទួលលេខកូដ VIP ពី Admin ឬទិញតាម Telegram សូមបញ្ចូលខាងក្រោម៖
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-300 mb-1">
                    លេខកូដ VIP License Key:
                  </label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-3 text-yellow-500" />
                    <input
                      type="text"
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="VIP-7D-8942-S8Q"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#142417] border border-yellow-500/40 text-yellow-300 font-mono font-bold text-xs uppercase focus:outline-none focus:border-yellow-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs transition shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={15} />
                  <span>បើកដំណើរការ VIP (Activate Now)</span>
                </button>

                <div className="text-[11px] text-gray-400 text-center">
                  ទម្រង់ License Key៖ <code className="text-yellow-400 font-mono">VIP-7D-XXXX-XXX</code>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
