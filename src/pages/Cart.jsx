import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart()
    const navigate = useNavigate()

    if (cartItems.length === 0) {
        return (
            <div className="page">
                <div className="empty-state">
                    <h2>Your cart is empty</h2>
                    <p>Add a few things you like and they'll show up here.</p>
                    <Link to="/"><button style={{ marginTop: 12 }}>Continue shopping</button></Link>
                </div>
            </div>
        )
    }

    return (
        <div className="page-narrow" style={{ maxWidth: 640 }}>
            <h1>Your Cart</h1>

            <div className="panel">
                {cartItems.map(item => (
                    <div key={item.id} className="list-row">
                        <div>
                            <strong>{item.name}</strong>
                            <p className="muted" style={{ margin: 0 }}>₹{item.price} each</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <button className="secondary" onClick={() => updateQuantity(item.id, item.qty - 1)}>−</button>
                            <span>{item.qty}</span>
                            <button className="secondary" onClick={() => updateQuantity(item.id, item.qty + 1)}>+</button>
                        </div>

                        <strong>₹{(item.qty * item.price).toFixed(2)}</strong>
                        <button className="danger" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                <h2 style={{ margin: 0 }}>Total: ₹{cartTotal.toFixed(2)}</h2>
                <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
            </div>
        </div>
    )
}