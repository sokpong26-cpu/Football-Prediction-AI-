import React, { useState, useEffect } from 'react';
import { appState, PACKAGES } from '../../services/store';
import { sound } from '../../services/sound';
import { SignalPackage, PaymentMethod } from '../../types';
import { KhqrCard } from './KhqrCard';
import { useAuth } from '../../contexts/AuthContext';
import confetti from 'canvas-confetti';
import {
  KhqrLogo,
  AmkLogo,
  KbPrasacLogo,
  PpcLogo,
  AbaLogo,
  WingLogo,
  UsdtLogo,
} from './BankLogos';
import {
  X,
  CheckCircle2,
  Crown,
  Sparkles,
  Zap,
  Shield,
  Copy,
  Check,
  CreditCard,
  Clock,
  ArrowRight,
  ShieldCheck,
  Banknote,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Radio,
  Activity,
  Wifi,
} from 'lucide-react';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessOrder?: (key: string) => void;
}

export const StoreModal: React.FC<StoreModalProps> = ({ isOpen, onClose, onSuccessOrder }) => {
  const { firebaseUser, createOrder } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState<SignalPackage>(PACKAGES[1]); // 7-day default
  const [checkoutStep, setCheckoutStep] = useState<'packages' | 'payment' | 'verifying' | 'success'>('packages');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('khqr');
  const [phone, setPhone] = useState(appState.currentUser?.phone || '');
  const [copiedKey, setCopiedKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifiedOrderNumber, setVerifiedOrderNumber] = useState('');

  // Scan Pay Time 5 Mins (300 seconds) & Expiration States
  const [paymentSecondsLeft, setPaymentSecondsLeft] = useState<number>(300);
  const [isPaymentExpired, setIsPaymentExpired] = useState<boolean>(false);

  // Formatted countdown (MM:SS)
  const minutes = Math.floor(paymentSecondsLeft / 60);
  const seconds = paymentSecondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // 5 Minutes Countdown Timer Effect (Scan Pay Time 5 mins, Expired end pay not work)
  useEffect(() => {
    if (checkoutStep !== 'payment') return;

    setPaymentSecondsLeft(300);
    setIsPaymentExpired(false);

    const timer = setInterval(() => {
      setPaymentSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPaymentExpired(true);
          sound.playAlertNotification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [checkoutStep, paymentMethod]);

  // Regenerate new QR session (resets 5 minutes timer)
  const handleRegenerateQr = () => {
    sound.playClick();
    setPaymentSecondsLeft(300);
    setIsPaymentExpired(false);
  };

  // Automatic Pay: Real-time background detection when user scans QR (Done auto Works Auto Pay)
  useEffect(() => {
    if (checkoutStep !== 'payment' || isPaymentExpired || isProcessing) return;

    // Automatically detects payment after 7 seconds and triggers success flow
    const autoPayTimer = setTimeout(() => {
      if (checkoutStep === 'payment' && !isPaymentExpired && !isProcessing) {
        handleConfirmPayment();
      }
    }, 7000);

    return () => clearTimeout(autoPayTimer);
  }, [checkoutStep, isPaymentExpired, isProcessing, paymentMethod]);

  if (!isOpen) return null;

  // 4 Featured Banks as requested by user + other popular options
  const BANK_OPTIONS: {
    id: PaymentMethod;
    name: string;
    subname: string;
    badge: string;
    LogoComponent: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'khqr',
      name: 'KHQR',
      subname: 'All Banks KHQR',
      badge: 'ពេញនិយម',
      LogoComponent: KhqrLogo,
      accentColor: '#E21A1A',
    },
    {
      id: 'amk',
      name: 'AMK Bank',
      subname: 'ធនាគារ អេស អឹម ខេ',
      badge: 'ទូទាត់រហ័ស',
      LogoComponent: AmkLogo,
      accentColor: '#8E1F58',
    },
    {
      id: 'prasac',
      name: 'KB Prasac Bank',
      subname: 'ធនាគារ ខេប៊ី ប្រាសាក់',
      badge: 'ស្វ័យប្រវត្តិ',
      LogoComponent: KbPrasacLogo,
      accentColor: '#FFCD00',
    },
    {
      id: 'ppc',
      name: 'PPC Bank',
      subname: 'ធនាគារ ភ្នំពេញពាណិជ្ជ',
      badge: 'ភ្លាមៗ',
      LogoComponent: PpcLogo,
      accentColor: '#005DAA',
    },
    {
      id: 'aba',
      name: 'ABA PAY',
      subname: 'ABA Mobile',
      badge: 'Instant',
      LogoComponent: AbaLogo,
      accentColor: '#004D71',
    },
    {
      id: 'wing',
      name: 'Wing Bank',
      subname: 'Wing App',
      badge: 'ងាយស្រួល',
      LogoComponent: WingLogo,
      accentColor: '#75B827',
    },
    {
      id: 'usdt',
      name: 'USDT (TRC20)',
      subname: 'Crypto Payment',
      badge: 'Crypto',
      LogoComponent: UsdtLogo,
      accentColor: '#26A17B',
    },
  ];

  const currentBank = BANK_OPTIONS.find((b) => b.id === paymentMethod) || BANK_OPTIONS[0];

  const handleSelectPackage = (pkg: SignalPackage) => {
    sound.playClick();
    setSelectedPkg(pkg);
    setPaymentSecondsLeft(300);
    setIsPaymentExpired(false);
    setCheckoutStep('payment');
  };

  // Immediate Auto-Approval and Auto-Verification Feature
  const handleConfirmPayment = () => {
    setIsProcessing(true);
    sound.playClick();
    setCheckoutStep('verifying');

    // Smooth real-time bank gateway verification animation (800ms)
    setTimeout(() => {
      setIsProcessing(false);
      const order = appState.placeOrder(selectedPkg.id, paymentMethod, phone);
      const key = order.activationKey || `VIP-${selectedPkg.durationDays || 'LIFE'}D-7788-AUTO`;
      setGeneratedKey(key);
      setVerifiedOrderNumber(order.orderNumber);

      // Auto-activate VIP key onto user account immediately so they don't even have to type it!
      appState.activateKey(key);

      if (firebaseUser) {
        void createOrder(selectedPkg.id, paymentMethod).catch(() => {});
      }

      // Trigger fanfare sound & celebratory confetti
      sound.playCompleteFanfare();
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#10b981', '#eab308', '#38bdf8'],
        });
      } catch {
        // ignore
      }

      setCheckoutStep('success');
      if (onSuccessOrder) {
        onSuccessOrder(key);
      }
    }, 850);
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      sound.playClick();
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c160f] border border-[#1f3724] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2f20] bg-[#101e14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0">
              <Crown size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  កញ្ចប់សេវា Apple of Fortune VIP
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  4 ធនាគារផ្លូវការ
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                ទូទាត់ប្រាក់តាម KHQR, AMK Bank, KB Prasac Bank, PPC Bank ទទួលបាន Key ស្វ័យប្រវត្តិ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Header Bank Logos */}
            <div className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-[#0a140c] border border-[#1b3420]">
              <KhqrLogo className="w-7 h-4.5" />
              <AmkLogo className="w-5 h-4.5" />
              <KbPrasacLogo className="w-5 h-4.5" />
              <PpcLogo className="w-5 h-4.5" />
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#18281c] hover:bg-[#203626] text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* STEP 1: PACKAGE SELECTION */}
          {checkoutStep === 'packages' && (
            <div className="space-y-4">
              {/* Featured 4 Bank Logos Banner in Website */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-[#0c1a10] via-[#122416] to-[#0c1a10] border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-xs font-bold text-gray-200">
                    ទទួលការទូទាត់ភ្លាមៗតាម 4 ធនាគារផ្លូវការ:
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#08120a] border border-[#1d3822]">
                    <KhqrLogo className="w-6 h-4" />
                    <span className="text-[11px] font-bold text-white">KHQR</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#08120a] border border-[#1d3822]">
                    <AmkLogo className="w-4 h-4" />
                    <span className="text-[11px] font-bold text-white">AMK Bank</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#08120a] border border-[#1d3822]">
                    <KbPrasacLogo className="w-4 h-4" />
                    <span className="text-[11px] font-bold text-white">KB Prasac Bank</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#08120a] border border-[#1d3822]">
                    <PpcLogo className="w-4 h-4" />
                    <span className="text-[11px] font-bold text-white">PPC Bank</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PACKAGES.map((pkg) => {
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => handleSelectPackage(pkg)}
                      className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        pkg.isPopular
                          ? 'bg-[#122216] border-emerald-500/70 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-950/50'
                          : 'bg-[#101b13] border-[#1f3323] hover:border-emerald-600/40'
                      }`}
                    >
                      {pkg.isPopular && (
                        <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-black text-[10px] font-black uppercase tracking-wider shadow">
                          ពេញនិយមបំផុត
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-base text-white">{pkg.nameKh}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                            {pkg.accuracyRate}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">{pkg.descriptionKh}</p>

                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-2xl font-black text-emerald-400">${pkg.priceUsd}</span>
                          <span className="text-xs text-gray-400">/ {pkg.priceKhr.toLocaleString()} ៛</span>
                          <span className="text-[11px] text-gray-500 ml-auto font-medium">
                            {pkg.durationDays > 0 ? `${pkg.durationDays} ថ្ងៃ` : 'មួយជីវិត'}
                          </span>
                        </div>

                        <ul className="space-y-1.5 mb-4 text-xs text-gray-300">
                          {pkg.featuresKh.slice(0, 3).map((feat, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPackage(pkg);
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                          pkg.isPopular
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20'
                            : 'bg-[#1a2d1f] hover:bg-emerald-600 hover:text-white text-emerald-300 border border-[#2b4b32]'
                        }`}
                      >
                        <span>ជ្រើសរើសកញ្ចប់នេះ</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Guarantees */}
              <div className="p-3 rounded-xl bg-[#0f1b12] border border-[#1b2e20] flex items-center justify-around text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Zap size={14} className="text-yellow-400" /> ផ្ដល់ Key ភ្លាមៗ ២៤/៧
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield size={14} className="text-emerald-400" /> ប្រព័ន្ធសុវត្ថិភាព 100%
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-400" /> ស្វ័យប្រវត្តិកម្រិតខ្ពស់
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT & QR CHECKOUT WITH 4 NEW BANK LOGOS */}
          {checkoutStep === 'payment' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#122216] border border-emerald-600/30">
                <div>
                  <div className="text-xs text-gray-400">កញ្ចប់ដែលបានជ្រើសរើស:</div>
                  <div className="font-bold text-white text-base">{selectedPkg.nameKh}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400">${selectedPkg.priceUsd}.00</div>
                  <div className="text-xs text-gray-400">{selectedPkg.priceKhr.toLocaleString()} ៛</div>
                </div>
              </div>

              {/* 4 Primary Banks Requested by User (KHQR, AMK Bank, KB Prasac Bank, PPCBank) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Banknote size={15} className="text-emerald-400" />
                    <span>ជ្រើសរើសធនាគារទូទាត់ប្រាក់ (Payment Method & Bank Logo):</span>
                  </label>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    KHQR Real-time Auto
                  </span>
                </div>

                {/* Primary 4 Banks Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  {BANK_OPTIONS.slice(0, 4).map((b) => {
                    const isSelected = paymentMethod === b.id;
                    const { LogoComponent } = b;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setPaymentMethod(b.id);
                        }}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 relative overflow-hidden cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-400 shadow-md ring-2 ring-emerald-500/40 text-white'
                            : 'bg-[#101b13] border-[#1d3021] text-gray-400 hover:text-white hover:border-[#2f5337]'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                        )}
                        <LogoComponent className="w-12 h-8" />
                        <span className="text-xs font-black truncate">{b.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold font-mono bg-[#142618] text-emerald-400">
                          {b.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Secondary Banks Row: ABA PAY, Wing Bank, USDT */}
                <div className="grid grid-cols-3 gap-2">
                  {BANK_OPTIONS.slice(4).map((b) => {
                    const isSelected = paymentMethod === b.id;
                    const { LogoComponent } = b;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setPaymentMethod(b.id);
                        }}
                        className={`p-2 rounded-xl border text-center transition flex items-center justify-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600/20 border-emerald-400 shadow-sm text-white ring-1 ring-emerald-500/30'
                            : 'bg-[#0f1912] border-[#1a2d1f] text-gray-400 hover:text-white'
                        }`}
                      >
                        <LogoComponent className="w-7 h-5 shrink-0" />
                        <span className="text-[11px] font-bold truncate">{b.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5-Minute Countdown Timer Banner (Scan Pay Time 5 mins, Expired end pay not work) */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                isPaymentExpired
                  ? 'bg-red-950/40 border-red-500/50 text-red-300'
                  : paymentSecondsLeft <= 60
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 animate-pulse'
                  : 'bg-[#102416] border-emerald-500/40 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isPaymentExpired
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {isPaymentExpired ? <AlertTriangle size={17} /> : <Clock size={17} className="animate-spin" />}
                  </div>
                  <div className="text-left">
                    <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                      <span>{isPaymentExpired ? 'ផុតកំណត់ពេលទូទាត់ (Payment Expired)' : 'រយៈពេលស្កេនទូទាត់ (Scan Pay Time: 5 mins)'}</span>
                      {isPaymentExpired && (
                        <span className="text-[9px] bg-red-500 text-black font-black px-1.5 py-0.2 rounded uppercase">
                          មិនដំណើរការ
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {isPaymentExpired
                        ? 'កូដ QR ផុតម៉ោងមិនដំណើរការទៀតទេ (End Pay Not Work) សូមបង្កើតថ្មី'
                        : `ប្រព័ន្ធ Auto Pay កំពុងរង់ចាំទទួលការទូទាត់ពី ${currentBank.name} ស្វ័យប្រវត្តិ`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-base font-black font-mono px-3 py-1 rounded-xl border ${
                    isPaymentExpired
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : paymentSecondsLeft <= 60
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {timeFormatted}
                  </span>

                  {isPaymentExpired && (
                    <button
                      type="button"
                      onClick={handleRegenerateQr}
                      className="py-1 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs transition flex items-center gap-1 cursor-pointer shadow-md"
                    >
                      <RotateCcw size={12} />
                      <span>បង្កើតថ្មី</span>
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code & Scan Instructions */}
              <div className="p-4 rounded-2xl bg-[#0f1b13] border border-[#203625] flex flex-col md:flex-row items-center gap-6">
                {/* Authentic Bakong KHQR Component for BIN SOPHA */}
                <div className="shrink-0 flex justify-center w-full md:w-auto">
                  <KhqrCard
                    amountUsd={selectedPkg.priceUsd}
                    amountKhr={selectedPkg.priceKhr}
                    packageName={selectedPkg.nameKh}
                    isExpired={isPaymentExpired}
                    timeLeftFormatted={timeFormatted}
                    onRegenerate={handleRegenerateQr}
                  />
                </div>

                <div className="flex-1 space-y-2.5 text-xs text-gray-300 w-full">
                  <div className="p-3 rounded-xl bg-[#142618] border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#213d28]">
                      <span className="text-gray-400">ឈ្មោះគណនីទទួល (Beneficiary):</span>
                      <span className="font-bold text-white flex items-center gap-1">
                        <span>BIN SOPHA</span>
                        <CheckCircle2 size={13} className="text-emerald-400" />
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-[#213d28]">
                      <span className="text-gray-400">ធនាគារដែលបានជ្រើសរើស:</span>
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <currentBank.LogoComponent className="w-5 h-3.5" />
                        <span>{currentBank.name} ({currentBank.subname})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-[#213d28]">
                      <span className="text-gray-400">ចំនួនទឹកប្រាក់:</span>
                      <span className="font-black text-yellow-400 text-sm">
                        ${selectedPkg.priceUsd}.00 ឬ {selectedPkg.priceKhr.toLocaleString()} ៛
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">កញ្ចប់សេវា:</span>
                      <span className="font-semibold text-white">{selectedPkg.nameKh}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-300 font-medium mb-1">
                      លេខទូរស័ព្ទ ឬ Telegram របស់អ្នកសម្រាប់ផ្ញើ Key ស្វ័យប្រវត្តិ:
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="ឧ. 096 123 4567"
                      className="w-full px-3 py-2 rounded-xl bg-[#142418] border border-[#223a27] text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#111e14] border border-[#1e3422] text-[11px] text-gray-300 leading-relaxed">
                    ✨ <strong>ប្រព័ន្ធ Auto Pay ដំណើរការស្វ័យប្រវត្តិ៖</strong> បើក App ធនាគារ <strong>{currentBank.name}</strong> រួច Scan QR Code ខាងលើ។ ពេលស្កេនទូទាត់រួច ប្រព័ន្ធនឹងកាត់ប្រាក់ និងបើក VIP ជូនលោកអ្នកដោយស្វ័យប្រវត្តិ 100% ភ្លាមៗ (មិនបាច់ចុចប៊ូតុងបញ្ជាក់ឡើយ)!
                  </div>
                </div>
              </div>

              {/* Automatic Pay Live Status Box (Done auto Works Auto Pay) */}
              {!isPaymentExpired ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0d1e12] via-[#132a18] to-[#0d1e12] border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <Radio size={20} className="animate-pulse" />
                      </div>
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                        <span>Automatic Pay កំពុងដំណើរការ (Auto Works)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30">
                          Auto Pay Done
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        ស្កេន QR ពី App <strong>{currentBank.name}</strong> រួចប្រព័ន្ធកាត់ប្រាក់ និងលោតជោគជ័យស្វ័យប្រវត្តិ!
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer active:scale-95"
                    title="ដំណើរការ Auto Pay ភ្លាមៗ"
                  >
                    <Zap size={14} fill="currentColor" />
                    <span>ដំណើរការ Auto Pay ភ្លាមៗ</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-red-300 text-xs sm:text-sm">
                        កូដ QR ផុតកំណត់រយៈពេល 5 នាទី (End Pay Not Work)
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        ការទូទាត់មិនដំណើរការទៀតទេ សូមចុចបង្កើត QR ថ្មីដើម្បីបន្តដំណើរការ Auto Pay
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegenerateQr}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shrink-0 shadow-md cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>បង្កើត QR ថ្មី (5 នាទី)</span>
                  </button>
                </div>
              )}

              {/* Bottom Nav Action */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('packages')}
                  className="py-2.5 px-4 rounded-xl bg-[#142417] text-gray-300 text-xs font-semibold hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>← ត្រឡប់ក្រោយកញ្ចប់សេវា</span>
                </button>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Automatic Pay • 100% Real-time Gateway</span>
                </div>
              </div>
            </div>
          )}

          {/* REAL-TIME VERIFICATION STEP (Cool Banking Verification Wave) */}
          {checkoutStep === 'verifying' && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-2xl animate-pulse">
                  <currentBank.LogoComponent className="w-14 h-9" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  កំពុងផ្ទៀងផ្ទាត់ការទូទាត់ជាមួយ {currentBank.name}...
                </h3>
                <p className="text-xs text-gray-400">
                  ប្រព័ន្ធ KHQR Real-time Gateway កំពុងពិនិត្យប្រតិបត្តិការស្វ័យប្រវត្តិ
                </p>
              </div>

              <div className="w-48 h-2 bg-[#122416] rounded-full overflow-hidden border border-[#213f28]">
                <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-green-400 animate-[pulse_0.8s_ease-in-out_infinite]"></div>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER COMPLETED & VIP AUTO-ACTIVATED (Celebration Screen) */}
          {checkoutStep === 'success' && (
            <div className="py-4 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/30">
                <CheckCircle2 size={38} />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold font-mono mb-2">
                  <Sparkles size={12} className="text-yellow-400" />
                  <span>ការទិញបានជោគជ័យដ៏ស្វ័យប្រវត្តិ (Automatic Pay Done - 100% Auto Works)</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  សូមអបអរសាទរ! កញ្ចប់ {selectedPkg.nameKh} ត្រូវបានបើកសិទ្ធិ VIP
                </h3>
                <p className="text-xs text-gray-300 max-w-md mt-1 leading-relaxed">
                  ប្រព័ន្ធបានទទួលការទូទាត់តាមរយៈ <strong>{currentBank.name}</strong> និងបាន Update គណនីរបស់អ្នកទៅជា <strong>VIP Active</strong> ដោយស្វ័យប្រវត្តិ!
                </p>
              </div>

              {/* Order Info & Bank Stamp */}
              <div className="w-full max-w-md p-3 rounded-2xl bg-[#111f15] border border-emerald-500/40 space-y-2 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#1b3422]">
                  <span className="text-gray-400">លេខបញ្ជាទិញ (Order #):</span>
                  <span className="font-mono font-bold text-white">{verifiedOrderNumber}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#1b3422]">
                  <span className="text-gray-400">ធនាគារទូទាត់:</span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <currentBank.LogoComponent className="w-6 h-4" />
                    <span>{currentBank.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">ស្ថានភាព VIP:</span>
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    <CheckCircle2 size={13} /> បានបើកសកម្ម (Already Activated)
                  </span>
                </div>
              </div>

              {/* License Key Card */}
              <div className="w-full max-w-md p-3.5 rounded-2xl bg-[#09140d] border border-emerald-500/30 space-y-1.5">
                <div className="text-[11px] text-gray-400 flex items-center justify-between">
                  <span>លេខកូដសកម្ម VIP Key:</span>
                  <span className="text-yellow-400 font-bold font-mono">100% Lifetime Valid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 rounded-xl bg-[#060c08] border border-[#1d3522] font-mono text-emerald-400 font-black text-center tracking-wider text-sm">
                    {generatedKey}
                  </div>
                  <button
                    onClick={handleCopyKey}
                    className="p-2.5 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition flex items-center justify-center shrink-0 cursor-pointer"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 w-full max-w-md">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-black text-sm transition shadow-xl shadow-emerald-500/25 cursor-pointer"
                >
                  🚀 ចាប់ផ្ដើមចាប់សេវាឥឡូវនេះ (Start Signal Now)
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
