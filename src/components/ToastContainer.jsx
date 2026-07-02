import { useToastContext } from '../context/ToastContext'

export default function ToastContainer() {
    const { toasts } = useToastContext()

    return (
        <div className="toast-stack">
            {toasts.map(t => (
                <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : 'success'}`}>
                    {t.message}
                </div>
            ))}
        </div>
    )
}