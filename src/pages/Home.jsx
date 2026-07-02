import { useEffect, useState } from 'react'
import api from '../api'
import ProductCard from '../components/ProductCard'

export default function Home() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [category, setCategory] = useState('')
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('')

    useEffect(() => {
        api.get('/api/categories').then(res => setCategories(res.data))
    }, [])

    useEffect(() => {
        const params = {}
        if (category) params.category = category
        if (search) params.search = search
        if (sort) params.sort = sort

        api.get('/api/products', { params }).then(res => setProducts(res.data))
    }, [category, search, sort])

    return (
        <div className="page">
            <span className="eyebrow">Browse the catalog</span>
            <h1 style={{ marginBottom: 24 }}>Shop everything</h1>

            <div className="toolbar">
                <input
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="">Sort by</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                </select>
            </div>

            {products.length === 0 ? (
                <div className="empty-state">
                    <h2>No products found</h2>
                    <p>Try a different search term or category.</p>
                </div>
            ) : (
                <div className="product-grid">
                    {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            )}
        </div>
    )
}