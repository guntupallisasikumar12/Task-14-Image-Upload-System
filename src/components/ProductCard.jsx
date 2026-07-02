import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToastContext } from '../context/ToastContext'

const IMAGE_BASE = 'http://localhost:5000'

export default function ProductCard({ product }) {
    const { addToCart } = useCart()
    const { showToast } = useToastContext()

    function handleAdd(e) {
        e.preventDefault()
        if (product.stock < 1) return
        addToCart(product, 1)
        showToast(`${product.name} added to cart`, 'success')
    }

    return (
        <Link to={`/products/${product.id}`} className="product-card">
            {product.image_url ? (
                <img src={`${IMAGE_BASE}${product.image_url}`} alt={product.name} />
            ) : (
                <div className="img-placeholder">No image</div>
            )}

            <span className="category-pill">{product.category_name}</span>
            <h3>{product.name}</h3>
            <p className="price">₹{product.price}</p>

            <button onClick={handleAdd} disabled={product.stock < 1}>
                {product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
            </button>
        </Link>
    )
}