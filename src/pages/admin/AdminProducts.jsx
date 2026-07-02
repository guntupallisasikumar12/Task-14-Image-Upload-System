import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'
import { useToastContext } from '../../context/ToastContext'

export default function AdminProducts() {
    const [products, setProducts] = useState([])
    const { showToast } = useToastContext()

    function loadProducts() {
        api.get('/api/products').then(res => setProducts(res.data))
    }

    useEffect(() => { loadProducts() }, [])

    async function handleDelete(id) {
        try {
            await api.delete(`/api/products/${id}`)
            showToast('Product deleted', 'success')
            loadProducts()
        } catch (err) {
            showToast('Could not delete product', 'error')
        }
    }

    return (
        <div className="page">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
                <div>
                    <span className="eyebrow">Admin</span>
                    <h1 style={{ margin: 0 }}>Manage Products</h1>
                </div>
                <Link to="/admin/products/add"><button>Add New Product</button></Link>
            </div>

            <div className="panel">
                <table>
                    <thead>
                        <tr><th>Name</th><th>Price</th><th>Stock</th><th>Category</th><th></th></tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>₹{p.price}</td>
                                <td>{p.stock}</td>
                                <td>{p.category_name}</td>
                                <td style={{ display: 'flex', gap: 8 }}>
                                    <Link to={`/admin/products/edit/${p.id}`}><button className="secondary">Edit</button></Link>
                                    <button className="danger" onClick={() => handleDelete(p.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}