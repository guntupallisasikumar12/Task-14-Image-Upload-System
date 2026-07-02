import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { useCart } from '../context/CartContext'
import { useToastContext } from '../context/ToastContext'

const IMAGE_BASE = 'http://localhost:5000'

export default function ProductDetail() {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [qty, setQty] = useState(1)
    const { addToCart } = useCart()
    const { showToast } = useToastContext()

    useEffect(() => {
        api.get(`/api/products/${id}`).then(res => setProduct(res.data))
    }, [id])

    if (!product) return <div className="page"><p className="muted">Loading...</p></div>

    function handleAdd() {
        addToCart(product, qty)
        showToast(`${product.name} added to cart`, 'success')
    }

    return (
        <div className="page" style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            {product.image_url ? (
                <img src={`${IMAGE_BASE}${product.image_url}`} alt={product.name}
                    style={{ width: 360, height: 360, objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--line)' }} />
            ) : (
                <div className="img-placeholder" style={{ width: 360, height: 360, borderRadius: 'var(--radius)' }}>No image</div>
            )}

            <div style={{ maxWidth: 420 }}>
                <span className="category-pill">{product.category_name}</span>
                <h1>{product.name}</h1>
                <p className="muted">{product.description}</p>
                <p className="price" style={{ fontSize: 28, margin: '12px 0' }}>₹{product.price}</p>

                {product.stock < 1 ? (
                    <span className="status-badge" style={{ background: 'var(--danger)' }}>Out of Stock</span>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <button className="secondary" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                            <span style={{ fontWeight: 600 }}>{qty}</span>
                            <button className="secondary" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                        </div>
                        <button onClick={handleAdd}>Add to Cart</button>
                    </>
                )}
            </div>
        </div>
    )
}