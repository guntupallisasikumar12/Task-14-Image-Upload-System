import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToastContext } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'
import api from '../api'

export default function Checkout() {
    const { cartItems, cartTotal, clearCart } = useCart()
    const { showToast } = useToastContext()
    const navigate = useNavigate()

    const { values, errors, handleChange, validateForm } = useForm(
        { address: '' },
        (vals) => {
            const errs = {}
            if (!vals.address.trim()) errs.address = 'Delivery address is required'
            return errs
        }
    )

    async function handlePlaceOrder(e) {
        e.preventDefault()
        if (!validateForm()) {
            showToast('Please fix the errors below', 'error')
            return
        }

        try {
            const items = cartItems.map(i => ({ product_id: i.id, quantity: i.qty }))
            await api.post('/api/orders', { items, address: values.address })
            clearCart()
            showToast('Order placed successfully!', 'success')
            navigate('/orders')
        } catch (err) {
            showToast(err.response?.data?.error || 'Could not place order', 'error')
        }
    }

    if (cartItems.length === 0) {
        return <div className="page"><div className="empty-state"><h2>Your cart is empty</h2></div></div>
    }

    return (
        <div className="page-narrow">
            <h1>Checkout</h1>

            <div className="panel" style={{ marginBottom: 20 }}>
                <h3 style={{ marginBottom: 10 }}>Order Summary</h3>
                {cartItems.map(i => (
                    <p key={i.id} className="muted" style={{ margin: '4px 0' }}>
                        {i.name} × {i.qty} — ₹{(i.price * i.qty).toFixed(2)}
                    </p>
                ))}
                <p style={{ fontWeight: 700, marginTop: 8 }}>Total: ₹{cartTotal.toFixed(2)}</p>
            </div>

            <form onSubmit={handlePlaceOrder}>
                <label>Delivery Address</label>
                <textarea
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    rows={4}
                />
                {errors.address && <p className="error-text">{errors.address}</p>}

                <button type="submit" style={{ marginTop: 16, width: '100%' }}>Place Order</button>
            </form>
        </div>
    )
}