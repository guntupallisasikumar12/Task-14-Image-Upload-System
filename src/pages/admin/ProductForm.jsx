import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api'
import { useToastContext } from '../../context/ToastContext'
import { useForm } from '../../hooks/useForm'

const IMAGE_BASE = 'http://localhost:5000'

export default function ProductForm() {
    const { id } = useParams()
    const isEdit = Boolean(id)
    const navigate = useNavigate()
    const { showToast } = useToastContext()

    const [categories, setCategories] = useState([])
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)
    const [existingImage, setExistingImage] = useState('')

    const { values, errors, handleChange, validateForm, setFieldValue } = useForm(
        { name: '', description: '', price: '', stock: '', category_id: '' },
        (vals) => {
            const errs = {}
            if (!vals.name) errs.name = 'Name is required'
            if (!vals.price || vals.price <= 0) errs.price = 'Valid price is required'
            if (vals.stock === '' || vals.stock < 0) errs.stock = 'Valid stock is required'
            if (!vals.category_id) errs.category_id = 'Category is required'
            return errs
        }
    )

    useEffect(() => {
        api.get('/api/categories').then(res => setCategories(res.data))
    }, [])

    useEffect(() => {
        if (isEdit) {
            api.get(`/api/products/${id}`).then(res => {
                const p = res.data
                setFieldValue('name', p.name)
                setFieldValue('description', p.description || '')
                setFieldValue('price', p.price)
                setFieldValue('stock', p.stock)
                setFieldValue('category_id', p.category_id || '')
                setExistingImage(p.image_url || '')
            })
        }
    }, [id])

    function handleFileChange(e) {
        const selected = e.target.files[0]
        if (!selected) return
        setFile(selected)
        setPreview(URL.createObjectURL(selected))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!validateForm()) {
            showToast('Please fix the errors below', 'error')
            return
        }

        try {
            let image_url = existingImage

            if (file) {
                showToast('Uploading image...', 'success')
                const formData = new FormData()
                formData.append('image', file)
                const uploadRes = await api.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                image_url = uploadRes.data.image_url
            }

            const payload = { ...values, image_url }

            if (isEdit) {
                await api.put(`/api/products/${id}`, payload)
                showToast('Product updated successfully!', 'success')
            } else {
                await api.post('/api/products', payload)
                showToast('Product added successfully!', 'success')
            }
            navigate('/admin/products')
        } catch (err) {
            showToast(err.response?.data?.error || 'Upload failed. Try again.', 'error')
        }
    }

    return (
        <div className="page-narrow">
            <span className="eyebrow">Admin</span>
            <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>

            <div className="panel" style={{ marginTop: 16 }}>
                <form onSubmit={handleSubmit}>
                    <label>Name</label>
                    <input name="name" value={values.name} onChange={handleChange} />
                    {errors.name && <p className="error-text">{errors.name}</p>}

                    <label>Description</label>
                    <textarea name="description" rows={3} value={values.description} onChange={handleChange} />

                    <label>Price</label>
                    <input name="price" type="number" value={values.price} onChange={handleChange} />
                    {errors.price && <p className="error-text">{errors.price}</p>}

                    <label>Stock</label>
                    <input name="stock" type="number" value={values.stock} onChange={handleChange} />
                    {errors.stock && <p className="error-text">{errors.stock}</p>}

                    <label>Category</label>
                    <select name="category_id" value={values.category_id} onChange={handleChange}>
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {errors.category_id && <p className="error-text">{errors.category_id}</p>}

                    <label>Product Image</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} />

                    {(preview || existingImage) && (
                        <img
                            src={preview || `${IMAGE_BASE}${existingImage}`}
                            width="140"
                            style={{ borderRadius: 'var(--radius-sm)', marginTop: 10, border: '1px solid var(--line)' }}
                        />
                    )}

                    <button type="submit" style={{ marginTop: 20, width: '100%' }}>
                        {isEdit ? 'Update Product' : 'Add Product'}
                    </button>
                </form>
            </div>
        </div>
    )
}