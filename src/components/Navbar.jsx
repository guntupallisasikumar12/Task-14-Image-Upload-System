import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { cartCount } = useCart()
    const { user, isAdmin, logout } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    return (
        <nav className="navbar">
            <Link to="/" className="brand">ShopApp</Link>

            <div className="nav-links">
                <Link to="/">Home</Link>

                {user && <Link to="/orders">My Orders</Link>}

                {isAdmin && (
                    <>
                        <Link to="/admin/products">Admin Products</Link>
                        <Link to="/admin/orders">Admin Orders</Link>
                    </>
                )}

                <Link to="/cart" className="cart-link">
                    Cart
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </Link>

                {user ? (
                    <>
                        <span className="user-chip">Hi, {user.name}</span>
                        <button className="secondary" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    )
}