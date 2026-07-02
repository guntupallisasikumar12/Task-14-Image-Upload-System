import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToastContext } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'

export default function Register() {
    const { register } = useAuth()
    const { showToast } = useToastContext()
    const navigate = useNavigate()

    const { values, errors, handleChange, validateForm } = useForm(
        { name: '', email: '', password: '' },
        (vals) => {
            const errs = {}
            if (!vals.name) errs.name = 'Name is required'
            if (!vals.email.includes('@')) errs.email = 'Valid email is required'
            if (!vals.password || vals.password.length < 6) errs.password = 'Password must be at least 6 characters'
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
            await register(values.name, values.email, values.password)
            showToast('Account created!', 'success')
            navigate('/')
        } catch (err) {
            showToast(err.response?.data?.error || 'Registration failed', 'error')
        }
    }

    return (
        <div className="page-narrow">
            <span className="eyebrow">Join us</span>
            <h1>Register</h1>
            <div className="panel" style={{ marginTop: 16 }}>
                <form onSubmit={handleSubmit}>
                    <label>Name</label>
                    <input name="name" value={values.name} onChange={handleChange} />
                    {errors.name && <p className="error-text">{errors.name}</p>}

                    <label>Email</label>
                    <input name="email" value={values.email} onChange={handleChange} />
                    {errors.email && <p className="error-text">{errors.email}</p>}

                    <label>Password</label>
                    <input type="password" name="password" value={values.password} onChange={handleChange} />
                    {errors.password && <p className="error-text">{errors.password}</p>}

                    <button type="submit" style={{ marginTop: 18, width: '100%' }}>Register</button>
                </form>
            </div>
            <p className="muted" style={{ marginTop: 14 }}>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    )
}