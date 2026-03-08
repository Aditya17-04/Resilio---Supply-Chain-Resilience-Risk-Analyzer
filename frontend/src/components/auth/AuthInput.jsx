import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function AuthInput({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    icon: Icon,
    required = false,
    autoComplete,
    id,
}) {
    const [showPassword, setShowPassword] = useState(false)
    const [focused, setFocused] = useState(false)
    const isPassword = type === 'password'
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className={`
        relative flex items-center rounded-xl border transition-all duration-200
        ${focused
                    ? 'border-blue-500/70 bg-slate-800/80 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]'
                    : error
                        ? 'border-red-500/60 bg-slate-800/60'
                        : 'border-slate-700/60 bg-slate-800/50 hover:border-slate-600/70'
                }
      `}>
                {Icon && (
                    <div className={`pl-3.5 transition-colors duration-200 ${focused ? 'text-blue-400' : 'text-slate-500'}`}>
                        <Icon size={16} />
                    </div>
                )}
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    required={required}
                    autoComplete={autoComplete}
                    className={`
            flex-1 bg-transparent px-3 py-3 text-sm text-slate-100 placeholder-slate-600
            focus:outline-none w-full
          `}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="pr-3.5 text-slate-500 hover:text-slate-300 transition-colors duration-150"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-400" />
                    {error}
                </p>
            )}
        </div>
    )
}
