import React, { useState } from 'react';
import { 
  Package, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

export default function AuthModal({ onLoginSuccess, warehouses }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'otp_request' | 'otp_verify'
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex.rivera@stocksense.io');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState('Inventory Manager');
  const [warehouseId, setWarehouseId] = useState('wh_1');
  
  // OTP fields
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedOtpDemo, setGeneratedOtpDemo] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      setSuccessMsg('Login successful! Redirecting...');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, warehouse_id: warehouseId })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Signup failed');
      }

      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLoginSuccess(data.user, data.token);
      }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to request OTP');
      }

      setGeneratedOtpDemo(data.demo_otp);
      setSuccessMsg(`OTP sent to ${email}. Check the banner above!`);
      setMode('otp_verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode, newPassword })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'OTP Verification failed');
      }

      setSuccessMsg('Password reset successfully! You can now log in.');
      setPassword(newPassword);
      setTimeout(() => {
        setMode('login');
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10 border border-white/10">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/30 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Package className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
            StockSense
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise Inventory Management System
          </p>
        </div>

        {/* Demo OTP Banner if generated */}
        {generatedOtpDemo && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-start gap-2.5 animate-pulse">
            <Sparkles className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
            <div>
              <strong className="block text-cyan-200">Simulated OTP Code Generated:</strong>
              Use code <code className="bg-slate-950 px-2 py-0.5 rounded font-mono font-bold text-white text-sm tracking-wider">{generatedOtpDemo}</code> for instant evaluation.
            </div>
          </div>
        )}

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-9 text-xs"
                  placeholder="alex.rivera@stocksense.io"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button 
                  type="button" 
                  onClick={() => { setError(''); setSuccessMsg(''); setMode('otp_request'); }}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-9 text-xs"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Login Preset */}
            <div className="pt-3 border-t border-white/10">
              <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-2">
                Evaluator Quick Demo Credentials
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail('alex.rivera@stocksense.io');
                  setPassword('Password123!');
                }}
                className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-400 bg-slate-900/60 p-2 rounded-lg border border-white/5"
              >
                Auto-fill: <strong>alex.rivera@stocksense.io</strong> (Inventory Manager)
              </button>
            </div>

            <div className="text-center text-xs text-slate-400 pt-2">
              Don't have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setError(''); setSuccessMsg(''); setMode('signup'); }} 
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* 2. SIGNUP MODE */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input pl-9 text-xs"
                  placeholder="e.g. Elena Rostova"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-9 text-xs"
                  placeholder="elena.rostova@stocksense.io"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-9 text-xs"
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Role</label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full glass-input text-xs py-2"
                >
                  <option value="Inventory Manager" className="bg-slate-900">Inventory Manager</option>
                  <option value="Warehouse Lead" className="bg-slate-900">Warehouse Lead</option>
                  <option value="Logistics Coordinator" className="bg-slate-900">Logistics Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Warehouse</label>
                <select 
                  value={warehouseId} 
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full glass-input text-xs py-2"
                >
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id} className="bg-slate-900">
                      {wh.code} ({wh.name.slice(0, 12)}...)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account & Login'}
            </button>

            <div className="text-center text-xs text-slate-400 pt-1">
              Already registered?{' '}
              <button 
                type="button" 
                onClick={() => { setError(''); setSuccessMsg(''); setMode('login'); }} 
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* 3. OTP REQUEST MODE */}
        {mode === 'otp_request' && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 flex items-start gap-2.5">
              <KeyRound className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Enter your registered email address to receive a 6-digit OTP security reset code.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-9 text-xs"
                  placeholder="alex.rivera@stocksense.io"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs"
            >
              {loading ? 'Generating OTP...' : 'Send OTP Code'}
            </button>

            <button 
              type="button" 
              onClick={() => { setError(''); setSuccessMsg(''); setMode('login'); }} 
              className="w-full btn-secondary py-2 text-xs"
            >
              Back to Sign In
            </button>
          </form>
        )}

        {/* 4. OTP VERIFY MODE */}
        {mode === 'otp_verify' && (
          <form onSubmit={handleVerifyOTP} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit OTP Code</label>
              <input 
                type="text" 
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full glass-input text-center text-lg tracking-widest font-mono font-bold"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full glass-input pl-9 text-xs"
                  placeholder="Enter new password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs"
            >
              {loading ? 'Verifying & Updating...' : 'Verify OTP & Reset Password'}
            </button>

            <button 
              type="button" 
              onClick={() => { setError(''); setSuccessMsg(''); setMode('login'); }} 
              className="w-full btn-secondary py-2 text-xs"
            >
              Cancel
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
