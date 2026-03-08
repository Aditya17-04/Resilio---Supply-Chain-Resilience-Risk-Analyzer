const levels = [
    { label: 'Weak', color: 'bg-red-500', min: 1 },
    { label: 'Fair', color: 'bg-amber-400', min: 2 },
    { label: 'Strong', color: 'bg-blue-500', min: 3 },
    { label: 'Very Strong', color: 'bg-emerald-500', min: 4 },
]

function getStrength(password) {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return Math.min(4, Math.ceil(score * 4 / 5))
}

export default function PasswordStrength({ password }) {
    const strength = getStrength(password)
    if (!password) return null

    const current = levels[strength - 1] || levels[0]

    return (
        <div className="flex flex-col gap-1.5 mt-1.5">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => (
                    <div
                        key={i}
                        className={`
              h-1 flex-1 rounded-full transition-all duration-500 ease-out
              ${i <= strength ? current.color : 'bg-slate-700'}
            `}
                    />
                ))}
            </div>
            <p className={`text-xs font-medium transition-colors duration-300 ${strength === 1 ? 'text-red-400' :
                    strength === 2 ? 'text-amber-400' :
                        strength === 3 ? 'text-blue-400' :
                            'text-emerald-400'
                }`}>
                {current.label} password
            </p>
        </div>
    )
}
