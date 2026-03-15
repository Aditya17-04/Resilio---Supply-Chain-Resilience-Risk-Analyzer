import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Shield, ArrowLeft, CheckCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import AuthInput from '../components/auth/AuthInput'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        if (!email) { setError('Email is required'); return }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return }

        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                throw error
            }

            setSent(true)
        } catch (err) {
            toast.error(err.message || 'Unable to send reset email.', {
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.3)' },
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
            <Toaster position="top-right" />

            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative"
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5 mb-8 justify-center">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <Shield size={17} className="text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">Resilio</span>
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-black/40">

                    {sent ? (
                        /* ── Success state ── */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center gap-4 py-4"
                        >
                            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                                <CheckCircle size={28} className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    If an account exists for <span className="text-slate-200 font-medium">{email}</span>,
                                    we've sent a password reset link. It expires in 1 hour.
                                </p>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                Didn't receive it? Check your spam folder or{' '}
                                <button
                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                    onClick={() => setSent(false)}
                                >
                                    try again
                                </button>.
                            </p>
                            <Link
                                to="/signin"
                                className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            >
                                <ArrowLeft size={14} />
                                Back to Sign In
                            </Link>
                        </motion.div>
                    ) : (
                        /* ── Form state ── */
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white">Forgot password?</h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Enter your email and we'll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <AuthInput
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError('') }}
                                    error={error}
                                    icon={Mail}
                                    required
                                    autoComplete="email"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-blue-600/20 mt-1"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Sending…
                                        </>
                                    ) : (
                                        'Send Reset Link'
                                    )}
                                </button>
                            </form>

                            <Link
                                to="/signin"
                                className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                <ArrowLeft size={14} />
                                Back to Sign In
                            </Link>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
