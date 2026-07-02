import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ToastContainer from './components/ToastContainer'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'

import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminProducts from './pages/admin/AdminProducts'
import ProductForm from './pages/admin/ProductForm'
import AdminOrders from './pages/admin/AdminOrders'

export default function App() {
  return (
    <>
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/checkout" element={
          <ProtectedRoute><Checkout /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><Orders /></ProtectedRoute>
        } />

        <Route path="/admin/products" element={
          <AdminRoute><AdminProducts /></AdminRoute>
        } />
        <Route path="/admin/products/add" element={
          <AdminRoute><ProductForm /></AdminRoute>
        } />
        <Route path="/admin/products/edit/:id" element={
          <AdminRoute><ProductForm /></AdminRoute>
        } />
        <Route path="/admin/orders" element={
          <AdminRoute><AdminOrders /></AdminRoute>
        } />
      </Routes>
    </>
  )
}