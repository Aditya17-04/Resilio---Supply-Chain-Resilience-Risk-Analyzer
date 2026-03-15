import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
                Restoring session...
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />
    }

    return children
}
