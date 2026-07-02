import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <p style={{ padding: 24 }}>Loading...</p>
    if (!user) return <Navigate to="/login" replace />
    return children
}

export function AdminRoute({ children }) {
    const { isAdmin, loading } = useAuth()
    if (loading) return <p style={{ padding: 24 }}>Loading...</p>
    if (!isAdmin) return <Navigate to="/" replace />
    return children
}