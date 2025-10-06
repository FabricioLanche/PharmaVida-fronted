import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authContext';
import { registerCompraOrquestada } from '../services/orchestrator/orchestratorAPI';
import { type Producto } from '../types/productos';

interface CartItem extends Producto {
  quantity: number;
}

const Checkout_Summary: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [message, setMessage] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('carrito');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch {}
    }
  }, []);

  const totalAmount = useMemo(() => cartItems.reduce((sum, item) => sum + item.precio * item.quantity, 0), [cartItems]);

  const handlePurchase = async () => {
    setMessage('');
    if (!user) {
      alert('Debes iniciar sesión para completar la compra.');
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('authToken') || '';
    if (!token) {
      setMessage('Tu sesión ha expirado. Vuelve a iniciar sesión.');
      navigate('/login');
      return;
    }
    const dni = user?.dni?.toString() || localStorage.getItem('userDNI') || '';
    if (!dni) {
      setMessage('No se pudo obtener tu DNI. Completa tu perfil antes de continuar.');
      navigate('/profile');
      return;
    }
    if (!cartItems.length) {
      setMessage('Tu carrito está vacío.');
      navigate('/cart');
      return;
    }

    try {
      const productos = cartItems.map(ci => ci.id);
      const cantidades = cartItems.map(ci => ci.quantity);

      console.log('[Checkout_Summary] POST compra ->', { productos, cantidades, dni });
      const res = await registerCompraOrquestada(token, { productos, cantidades, dni, datos_adicionales: { metodo_pago: 'tarjeta' } });
      console.log('[Checkout_Summary] Compra response <-', res);

      // Guardar resumen y limpiar carrito
      localStorage.setItem('orderSummary', JSON.stringify({ total: totalAmount, time: new Date().toISOString() }));
      localStorage.removeItem('carrito');

      setMessage('Compra registrada exitosamente. Redirigiendo...');
      setTimeout(() => navigate('/order-confirmation'), 1200);
    } catch (e: any) {
      console.error('Error realizando compra:', e);
      setMessage(e?.message || 'No se pudo completar la compra.');
    }
  };

  return (
    <div className="page">
      <h1 className="text-2xl font-bold mb-3">Resumen y Pago</h1>

      <div className="card mb-3">
        <div className="flex items-center justify-between">
          <div className="font-medium">Total a pagar</div>
          <div className="font-bold">S/.{totalAmount.toFixed(2)}</div>
        </div>
        <div className="text-xs text-[var(--pv-muted)] mt-1">Los productos que requieran receta pueden quedar pendientes hasta su validación.</div>
      </div>

      <div className="card mb-3">
        <h2 className="font-semibold mb-2">Detalle de carrito</h2>
        {!cartItems.length ? (
          <div className="text-sm text-[var(--pv-muted)]">Tu carrito está vacío.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cant.</th>
                <th>P. Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((it, i) => {
                const total = it.precio * it.quantity;
                return (
                  <tr key={i}>
                    <td>{it.nombre}</td>
                    <td>{it.quantity}</td>
                    <td>S/.{it.precio.toFixed(2)}</td>
                    <td>S/.{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <button className="px-4 py-2" disabled={isLoading || !user || !cartItems.length} onClick={handlePurchase}>
        {isLoading ? 'Procesando...' : 'Realizar compra'}
      </button>

      {message && <div className="alert mt-3">{message}</div>}

      <div className="mt-4">
        <Link className="btn-orange inline-block px-4 py-2" to="/cart">Volver al carrito</Link>
      </div>
    </div>
  );
};

export default Checkout_Summary;
