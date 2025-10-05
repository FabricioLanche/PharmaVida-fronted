import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const Product_Details = lazy(() => import('./pages/Product_Details'))
const User_Details = lazy(() => import('./pages/User_Details'))
const Cart_Details = lazy(() => import('./pages/Cart_Details'))
const Purchase_Transaction = lazy(() => import('./pages/Purchase_Transaction'))
const Product_Search = lazy(() => import('./pages/Product_Search'))
const Product_Admin = lazy(() => import('./pages/Product_Admin'))
const Prescription = lazy(() => import('./pages/Prescription'))
const Prescription_Details = lazy(() => import('./pages/Prescription_Details'))
const Doctors = lazy(() => import('./pages/Doctors'))
const Users_Admin = lazy(() => import('./pages/Users_Admin'))
const Purchase_Admin = lazy(() => import('./pages/Purchase_Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'))

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<Product_Details />} />
        <Route path="/user/:id" element={<User_Details />} />
        <Route path="/cart" element={<Cart_Details />} />
        <Route path="/cart/transaction" element={<Purchase_Transaction />} />
        <Route path="/search" element={<Product_Search />} />
        <Route path="/admin/products" element={<Product_Admin />} />
        <Route path="/prescription" element={<Prescription />} />
        <Route path="/prescription/:id" element={<Prescription_Details />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/admin/users" element={<Users_Admin />} />
        <Route path="/admin/shop" element={<Purchase_Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/analitica" element={<AnalyticsDashboard />} />
      </Routes>
    </Suspense>
  )
}
