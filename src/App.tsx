import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import FloatingActions from './components/FloatingActions'

const Home = lazy(() => import('./pages/Home'))
const Product_Details = lazy(() => import('./pages/Product_Details'))
const User_Details = lazy(() => import('./pages/User_Details'))
const Cart_Details = lazy(() => import('./pages/Cart_Details'))
const Purchase_Transaction = lazy(() => import('./pages/Purchase_Transaction'))
const Product_Search = lazy(() => import('./pages/Product_Search'))
const Product_Admin = lazy(() => import('./pages/Product_Admin'))
const Prescription = lazy(() => import('./pages/Prescription'))
const Prescription_Details = lazy(() => import('./pages/Prescription_Details'))
const Users_Admin = lazy(() => import('./pages/Users_Admin'))
const Purchase_Admin = lazy(() => import('./pages/Purchase_Admin'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Order_Confirmation = lazy(() => import('./pages/Order_Confirmation'))
const Profile = lazy(() => import('./pages/Profile'))
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'))
const Checkout_Summary = lazy(() => import('./pages/Checkout_Summary'))


export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NavBar />
      <FloatingActions />
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
        <Route path="/users-admin" element={<Users_Admin />} />
        <Route path="/purchase-admin" element={<Purchase_Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/order-confirmation" element={<Order_Confirmation />} />
        <Route path="/checkout/summary" element={<Checkout_Summary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/analitica" element={<AnalyticsDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

