import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('resilio_user')
            return stored ? JSON.parse(stored) : null
        } catch {
            return null
        }
    })

    function login(userData) {
        const payload = userData || { email: 'user@resilio.ai', name: 'User' }
        localStorage.setItem('resilio_user', JSON.stringify(payload))
        setUser(payload)
    }

    function logout() {
        localStorage.removeItem('resilio_user')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
