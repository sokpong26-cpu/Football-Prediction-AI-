import React, { useEffect, useState } from 'react';
import {
  User,
  ShieldCheck,
  Crown,
  Save,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Key,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BettingPlatform } from '../../types';
import { sound } from '../../services/sound';

export const ProfileAccountView: React.FC = () => {
  const {
    firebaseUser,
    dbProfile,
    dbOrders,
    loading,
    authError,
    signInGoogle,
    signOutAll,
    updateProfile,
  } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [bettingPlatform, setBettingPlatform] = useState<BettingPlatform>('sokrizybet');
  const [bettingAccountId, setBettingAccountId] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (dbProfile) {
      setDisplayName(dbProfile.displayName || '');
      setPhone(dbProfile.phone || '');
      setBettingPlatform(dbProfile.bettingPlatform === '1xbet' ? '1xbet' : 'sokrizybet');
      setBettingAccountId(dbProfile.bettingAccountId || '');
      setBio(dbProfile.bio || '');
    }
  }, [dbProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    sound.playClick();

    try {
      await updateProfile({
        displayName,
        phone,
        bettingPlatform,
        bettingAccountId,
        bio,
      });
      sound.playCompleteFanfare();
      setSaveMessage('Profile updated and secured.');
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!firebaseUser) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12">
        <div className="p-7 rounded-3xl bg-[#0c1610] border border-emerald-500/30 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5">
            <div className="w-full h-full rounded-2xl bg-[#08100b] flex items-center justify-center text-emerald-400">
              <Lock size={28} />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-black text-white">
              Account Sign In & Registration
            </h1>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Sign in or register securely with your Google Account to save your SokRizyBet / 1xBet player profile, manage VIP game services, and view your order history.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center justify-center gap-2">
              <AlertCircle size={15} />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => void signInGoogle()}
            className="w-full min-h-[48px] px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 hover:brightness-110 text-black font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Connecting...' : 'Sign In / Register with Google'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Profile Header */}
      <div className="p-5 rounded-3xl bg-[#0c1610] border border-[#1d3624] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <User size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-white">
                {dbProfile?.displayName || firebaseUser.displayName || 'Player Account'}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase flex items-center gap-1">
                <Crown size={11} />
                {(dbProfile?.vipTier || 'free').replace('vip_', '').toUpperCase()}
              </span>
              {dbProfile?.role && dbProfile.role !== 'user' && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-black uppercase">
                  {dbProfile.role}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-mono mt-0.5">{firebaseUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void signOutAll()}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Edit Profile Form */}
        <form
          onSubmit={(e) => void handleSave(e)}
          className="lg:col-span-6 p-5 rounded-3xl bg-[#0c1610] border border-[#1d3624] space-y-4"
        >
          <h2 className="text-base font-black text-white">Profile Information</h2>

          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="096..."
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Primary Platform
              </label>
              <select
                value={bettingPlatform}
                onChange={(e) => setBettingPlatform(e.target.value as BettingPlatform)}
                className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white"
              >
                <option value="sokrizybet">SokRizyBet</option>
                <option value="1xbet">1xBet</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">
              Linked Player Account ID
            </label>
            <input
              type="text"
              value={bettingAccountId}
              onChange={(e) => setBettingAccountId(e.target.value)}
              placeholder="Enter SokRizyBet or 1xBet Account ID"
              className="w-full min-h-[42px] px-3.5 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">
              Player Bio / Strategy Note
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Preferred multiplier target..."
              className="w-full p-3 rounded-xl bg-[#08100b] border border-[#1f3d28] text-xs text-white"
            />
          </div>

          {saveMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{saveMessage}</span>
            </div>
          )}

          {saveError && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{saveError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
          </button>
        </form>

        {/* My Orders & Activation Keys */}
        <div className="lg:col-span-6 p-5 rounded-3xl bg-[#0c1610] border border-[#1d3624] space-y-4">
          <h2 className="text-base font-black text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-amber-400" />
            <span>My Game Service Orders ({dbOrders.length})</span>
          </h2>

          {dbOrders.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#08100b] border border-[#172c1e] text-center text-xs text-gray-500">
              No orders placed under this account yet. Open the VIP Store to subscribe to a signal service.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {dbOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-[#08100b] border border-[#193020] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{ord.serviceName}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ${ord.amountUsd.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>{ord.orderNumber} • {ord.paymentMethod.toUpperCase()}</span>
                    <span className="uppercase text-emerald-300">{ord.status}</span>
                  </div>
                  {ord.activationKey && (
                    <div className="mt-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-center gap-1.5">
                      <Key size={12} />
                      <span>{ord.activationKey}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
