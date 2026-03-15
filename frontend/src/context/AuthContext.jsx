import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

function mapSupabaseUser(supabaseUser) {
    if (!supabaseUser) return null

    const metadata = supabaseUser.user_metadata || {}
    const displayName =
        metadata.full_name ||
        metadata.name ||
        (supabaseUser.email ? supabaseUser.email.split('@')[0] : 'User')

    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: displayName,
        company: metadata.company || '',
        country: metadata.country || '',
        role: metadata.role || '',
        picture: metadata.avatar_url || metadata.picture || '',
    }
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        async function initSession() {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
                console.error('Unable to load Supabase session:', error.message)
            }
            if (!mounted) return

            const currentSession = data?.session || null
            setSession(currentSession)
            setUser(mapSupabaseUser(currentSession?.user))
            setIsLoading(false)
        }

        initSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession)
            setUser(mapSupabaseUser(nextSession?.user))
            setIsLoading(false)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    async function logout() {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Unable to sign out from Supabase:', error.message)
        }
    }

    const value = useMemo(
        () => ({ session, user, logout, isAuthenticated: !!user, isLoading }),
        [session, user, isLoading]
    )

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
