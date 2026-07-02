import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/api/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false))
    }, [])

    async function login(email, password) {
        const res = await api.post('/api/login', { email, password })
        setUser(res.data)
        return res.data
    }

    async function register(name, email, password) {
        const res = await api.post('/api/register', { name, email, password })
        setUser(res.data)
        return res.data
    }

    async function logout() {
        await api.get('/api/logout')
        setUser(null)
    }

    const isAdmin = user?.role === 'admin'

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)