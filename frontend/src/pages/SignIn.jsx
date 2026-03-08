import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield, Globe, Activity, AlertTriangle, ChevronRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useGoogleLogin } from '@react-oauth/google'
import WorldMapBackground from '../components/auth/WorldMapBackground'
import AuthInput from '../components/auth/AuthInput'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
    {
        icon: Globe,
        title: 'Global Supply Chain Network Mapping',
        desc: 'Real-time visibility across 190+ countries and 50,000+ suppliers',
    },
    {
        icon: Activity,
        title: 'AI Risk Scoring for Suppliers',
        desc: 'Machine-learning models score disruption likelihood in seconds',
    },
    {
        icon: AlertTriangle,
        title: 'Disruption Prediction using AI',
        desc: 'Forecast bottlenecks up to 30 days before they impact operations',
    },
]

export default function SignIn() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    function set(field) {
        return e => {
            setForm(f => ({ ...f, [field]: e.target.value }))
            setErrors(er => ({ ...er, [field]: '' }))
        }
    }

    function validate() {
        const errs = {}
        if (!form.email) errs.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
        if (!form.password) errs.password = 'Password is required'
        return errs
    }

    async function handleSubmit(e) {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, password: form.password }),
            })
            const data = await res.json()
            setLoading(false)
            if (!res.ok) {
                setErrors({ password: data.detail || 'Invalid email or password' })
                toast.error(data.detail || 'Invalid email or password', {
                    style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.3)' },
                })
                return
            }
            login(data.user)
            toast.success('Welcome back! Redirecting…', {
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(59,130,246,0.3)' },
                iconTheme: { primary: '#3b82f6', secondary: '#fff' },
            })
            const from = location.state?.from?.pathname || '/'
            setTimeout(() => navigate(from, { replace: true }), 1200)
        } catch {
            setLoading(false)
            toast.error('Network error. Is the backend running?', {
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.3)' },
            })
        }
    }

    const googleEnabled = !!import.meta.env.VITE_GOOGLE_CLIENT_ID

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                })
                const profile = await res.json()

                // Persist the Google user in the backend DB
                const backendRes = await fetch('/api/auth/google-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: profile.email, name: profile.name, picture: profile.picture || '' }),
                })
                const backendData = await backendRes.json()
                if (!backendRes.ok) throw new Error(backendData.detail || 'Google login failed')

                login({ email: profile.email, name: profile.name, picture: profile.picture, company: backendData.user?.company || '' })
                toast.success(`Welcome, ${profile.name}!`, {
                    style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(59,130,246,0.3)' },
                    iconTheme: { primary: '#3b82f6', secondary: '#fff' },
                })
                const from = location.state?.from?.pathname || '/'
                setTimeout(() => navigate(from, { replace: true }), 1000)
            } catch {
                toast.error('Google sign-in failed. Please try again.', {
                    style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.3)' },
                })
            }
        },
        onError: () => {
            toast.error('Google sign-in was cancelled or failed.', {
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.3)' },
            })
        },
    })

    return (
        <div className="min-h-screen flex bg-slate-950">
            <Toaster position="top-right" />

            {/* ── LEFT PANEL ─────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-12 overflow-hidden">
                <WorldMapBackground />

                {/* Content above map */}
                <div className="relative z-10">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <Shield size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Resilio</span>
                    </motion.div>
                </div>

                {/* Center tagline */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-semibold text-blue-300 uppercase tracking-widest">Live Risk Intelligence</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                            Supply Chain<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                Resilience Platform
                            </span>
                        </h1>
                        <p className="text-slate-400 text-base leading-relaxed max-w-md">
                            Predict disruptions before they happen and monitor supplier risks globally — powered by AI.
                        </p>
                    </motion.div>
                </div>

                {/* Feature highlights */}
                <div className="relative z-10">
                    <div className="flex flex-col gap-3">
                        {FEATURES.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
                                className="flex items-start gap-3 bg-slate-900/50 backdrop-blur-sm border border-slate-700/40 rounded-xl px-4 py-3"
                            >
                                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <f.icon size={14} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-200">{f.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Risk badge row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex gap-3 mt-4"
                    >
                        <span className="risk-badge-low">● Low Risk</span>
                        <span className="risk-badge-medium">● Medium Risk</span>
                        <span className="risk-badge-high">● High Risk</span>
                    </motion.div>
                </div>
            </div>

            {/* ── RIGHT PANEL ────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-950 relative">
                {/* Subtle glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="w-full max-w-md relative"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2.5 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Shield size={15} className="text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">Resilio</span>
                    </div>

                    {/* Card */}
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/40">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
                            <p className="text-slate-400 text-sm mt-1">Sign in to your Resilio account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <AuthInput
                                id="email"
                                label="Email Address"
                                type="email"
                                placeholder="you@company.com"
                                value={form.email}
                                onChange={set('email')}
                                error={errors.email}
                                icon={Mail}
                                required
                                autoComplete="email"
                            />
                            <AuthInput
                                id="password"
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={set('password')}
                                error={errors.password}
                                icon={Lock}
                                required
                                autoComplete="current-password"
                            />

                            {/* Forgot password */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Sign In button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 mt-1 group"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        Sign In
                                        <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* OR divider */}
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-slate-700/60" />
                            <span className="text-xs text-slate-600 font-medium">OR</span>
                            <div className="flex-1 h-px bg-slate-700/60" />
                        </div>

                        {/* OAuth */}
                        <div className="flex flex-col gap-2.5">
                            <button
                                type="button"
                                onClick={() => googleEnabled ? handleGoogleLogin() : toast('Set VITE_GOOGLE_CLIENT_ID in .env to enable Google sign-in', { icon: 'ℹ️', style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(59,130,246,0.3)' } })}
                                className="w-full flex items-center justify-center gap-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl py-2.5 text-sm text-slate-300 font-medium transition-all duration-200"
                            >
                                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </button>
                        </div>

                        {/* 2FA placeholder */}
                        <div className="mt-4 flex items-center gap-2.5 bg-slate-800/40 border border-slate-700/30 rounded-xl px-3.5 py-2.5">
                            <Shield size={13} className="text-slate-500 flex-shrink-0" />
                            <p className="text-xs text-slate-500">
                                Two-factor authentication available after sign-in
                            </p>
                        </div>

                        {/* Footer link */}
                        <p className="text-center text-sm text-slate-500 mt-5">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>

                    {/* Email verification note */}
                    <p className="text-center text-xs text-slate-600 mt-4">
                        By continuing you agree to Resilio's{' '}
                        <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
                        {' '}and{' '}
                        <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
