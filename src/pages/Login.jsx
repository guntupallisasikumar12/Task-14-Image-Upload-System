import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToastContext } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'

export default function Login() {
    const { login } = useAuth()
    const { showToast } = useToastContext()
    const navigate = useNavigate()

    const { values, errors, handleChange, validateForm } = useForm(
        { email: '', password: '' },
        (vals) => {
            const errs = {}
            if (!vals.email.includes('@')) errs.email = 'Valid email is required'
            if (!vals.password) errs.password = 'Password is required'
            return errs
        }
    )

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validateForm()) {
            showToast('Please fix the errors below', 'error')
            return
        }
        try {
            await login(values.email, values.password)
            showToast('Logged in successfully!', 'success')
            navigate('/')
        } catch (err) {
            showToast(err.response?.data?.error || 'Login failed', 'error')
        }
    }

    return (
        <div className="page-narrow">
            <span className="eyebrow">Welcome back</span>
            <h1>Login</h1>
            <div className="panel" style={{ marginTop: 16 }}>
                <form onSubmit={handleSubmit}>
                    <label>Email</label>
                    <input name="email" value={values.email} onChange={handleChange} />
                    {errors.email && <p className="error-text">{errors.email}</p>}

                    <label>Password</label>
                    <input type="password" name="password" value={values.password} onChange={handleChange} />
                    {errors.password && <p className="error-text">{errors.password}</p>}

                    <button type="submit" style={{ marginTop: 18, width: '100%' }}>Login</button>
                </form>
            </div>
            <p className="muted" style={{ marginTop: 14 }}>No account? <Link to="/register">Register</Link></p>
        </div>
    )
}