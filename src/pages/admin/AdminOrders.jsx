import { useEffect, useState } from 'react'
import api from '../../api'
import { useToastContext } from '../../context/ToastContext'

const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

export default function AdminOrders() {
    const [orders, setOrders] = useState([])
    const { showToast } = useToastContext()

    function loadOrders() {
        api.get('/api/orders').then(res => setOrders(res.data))
    }

    useEffect(() => { loadOrders() }, [])

    async function handleStatusChange(orderId, status) {
        try {
            await api.put(`/api/orders/${orderId}/status`, { status })
            showToast('Order status updated', 'success')
            loadOrders()
        } catch (err) {
            showToast('Could not update status', 'error')
        }
    }

    return (
        <div className="page">
            <span className="eyebrow">Admin</span>
            <h1 style={{ marginBottom: 20 }}>All Orders</h1>

            <div className="panel">
                <table>
                    <thead>
                        <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id}>
                                <td>#{o.id}</td>
                                <td>{o.customer_name}</td>
                                <td>{new Date(o.ordered_at).toLocaleDateString()}</td>
                                <td>₹{o.total_amount}</td>
                                <td>
                                    <select
                                        value={o.status}
                                        onChange={e => handleStatusChange(o.id, e.target.value)}
                                        style={{ width: 'auto' }}
                                    >
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}