import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import AuthInput from '../components/auth/AuthInput'
import PasswordStrength from '../components/auth/PasswordStrength'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
    const navigate = useNavigate()
    const { user, isLoading } = useAuth()

    const [form, setForm] = useState({ password: '', confirm: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

    function validate() {
        const e = {}
        if (!form.password) e.password = 'Password is required'
        else if (form.password.length < 8) e.password = 'Must be at least 8 characters'
        if (!form.confirm) e.confirm = 'Please confirm your password'
        else if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validate()) return
        if (!user) {
            toast.error('Invalid or missing reset link.', {
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.3)' },
            })
            return
        }
        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: form.password,
            })
            if (error) throw error

            await supabase.auth.signOut()
            setDone(true)
            setTimeout(() => navigate('/signin'), 3000)
        } catch (err) {
            toast.error(err.message || 'Reset failed', {
                style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(239,68,68,0.3)' },
            })
        } finally {
            setLoading(false)
        }
    }

    const invalidLink = !isLoading && !user && !done

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
                Validating reset link...
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
            <Toaster position="top-right" />

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

                    {invalidLink ? (
                        <div className="flex flex-col items-center text-center gap-4 py-4">
                            <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                                <AlertTriangle size={28} className="text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Invalid reset link</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    This reset link is invalid or expired. Please request a new one.
                                </p>
                            </div>
                            <Link to="/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                                Request new link →
                            </Link>
                        </div>
                    ) : done ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center gap-4 py-4"
                        >
                            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                                <CheckCircle size={28} className="text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Password reset!</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Your password has been updated. Redirecting you to sign in…
                                </p>
                            </div>
                            <Link to="/signin" className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                                Go to Sign In →
                            </Link>
                        </motion.div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white">Set new password</h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Resetting password for <span className="text-slate-200 font-medium">{user?.email}</span>
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <AuthInput
                                        id="password"
                                        label="New Password"
                                        type="password"
                                        placeholder="Min. 8 characters"
                                        value={form.password}
                                        onChange={set('password')}
                                        error={errors.password}
                                        icon={Lock}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <PasswordStrength password={form.password} />
                                </div>

                                <AuthInput
                                    id="confirm"
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="Repeat your new password"
                                    value={form.confirm}
                                    onChange={set('confirm')}
                                    error={errors.confirm}
                                    icon={Lock}
                                    required
                                    autoComplete="new-password"
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 mt-1 shadow-lg shadow-blue-600/20"
                                >
                                    {loading ? (
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Reset Password'
                                    )}
                                </button>

                                <p className="text-center text-slate-500 text-xs mt-1">
                                    Remembered it?{' '}
                                    <Link to="/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                        Sign in
                                    </Link>
                                </p>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
