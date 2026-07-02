import { useEffect, useState } from 'react'
import api from '../api'

const statusColors = {
    Pending: '#C98A3D', Confirmed: '#3B6FB6', Shipped: '#7A4FB0',
    Delivered: '#1F5C45', Cancelled: '#B3432B'
}

export default function Orders() {
    const [orders, setOrders] = useState([])

    useEffect(() => {
        api.get('/api/orders/my').then(res => setOrders(res.data))
    }, [])

    if (orders.length === 0) {
        return <div className="page"><div className="empty-state"><h2>No orders yet</h2><p>Once you place an order it will show up here.</p></div></div>
    }

    return (
        <div className="page" style={{ maxWidth: 720 }}>
            <h1>My Orders</h1>

            {orders.map(o => (
                <div key={o.id} className="panel" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>Order #{o.id}</strong>
                        <span className="status-badge" style={{ background: statusColors[o.status] }}>{o.status}</span>
                    </div>
                    <p className="muted" style={{ margin: '4px 0 10px' }}>
                        {new Date(o.ordered_at).toLocaleString()}
                    </p>

                    {o.items.map(item => (
                        <p key={item.id} style={{ margin: '2px 0' }}>
                            {item.product_name} × {item.quantity} — ₹{item.unit_price}
                        </p>
                    ))}

                    <p style={{ fontWeight: 700, marginTop: 10 }}>Total: ₹{o.total_amount}</p>
                </div>
            ))}
        </div>
    )
}