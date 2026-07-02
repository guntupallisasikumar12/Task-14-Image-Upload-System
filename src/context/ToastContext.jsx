import { createContext, useContext } from 'react'
import { useToast } from '../hooks/useToast'

const ToastContext = createContext()

export function ToastProvider({ children }) {
    const toastApi = useToast()
    return (
        <ToastContext.Provider value={toastApi}>
            {children}
        </ToastContext.Provider>
    )
}

export const useToastContext = () => useContext(ToastContext)