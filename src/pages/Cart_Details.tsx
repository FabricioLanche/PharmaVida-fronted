import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { type Producto } from '../types/productos';
import { useAuth } from '../hooks/authContext'; // Import useAuth

// Define a type for items in the cart, including quantity
interface CartItem extends Producto {
  quantity: number;
}

const Cart_Details: React.FC = () => {
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const { user, isLoading } = useAuth(); // Get user and isLoading from auth context
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const storedCart = localStorage.getItem('carrito');
    if (storedCart) {
      setCarrito(JSON.parse(storedCart));
    }
  }, []);

  // (helper removed: not used)

  // Check if any product requires a prescription
  const requiereReceta = carrito.some(p => Boolean(p.requiere_receta));

  const removeFromCart = (productId: number) => {
    setCarrito(prev => {
      const idx = prev.findIndex(p => p.id === productId);
      if (idx === -1) return prev;
      const next = [...prev];
      if (next[idx].quantity > 1) {
        next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
      } else {
        next.splice(idx, 1);
      }
      localStorage.setItem('carrito', JSON.stringify(next));
      return next;
    });
  };

  const total = carrito.reduce((sum, p) => sum + (Number(p.precio) * p.quantity), 0);

  const handleCheckout = () => {
    if (isLoading) return; // Do nothing if still loading auth state

    if (!user) {
      alert('Debes iniciar sesión para continuar con el pago.');
      navigate('/login'); // Navigate to login if not authenticated
      return;
    }

    if (requiereReceta) {
      navigate('/prescription'); // Navigate to prescription upload page
    } else {
      navigate('/cart/transaction'); // Navigate to payment page if no prescription needed
    }
  };

  return (
    <div className="page">
      <h1 className="text-3xl font-bold mb-4">Carrito de Compras</h1>
      <ul className="space-y-3">
        {carrito.map(producto => (
          <li key={producto.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{producto.nombre}</div>
                <div className="text-sm text-[var(--pv-muted)]">S/.{producto.precio} x {producto.quantity}</div>
              </div>
              <div className="flex items-center gap-2">
                {Boolean(producto.requiere_receta) ? (
                  <div className="text-xs alert alert-warn">Requiere receta</div>
                ) : null}
                <button className="btn-orange px-3 py-1.5 text-sm" onClick={() => removeFromCart(producto.id)} disabled={isLoading}>Eliminar</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-[var(--pv-muted)]">Productos: {carrito.length}</div>
        <div className="text-lg font-semibold">Total: S/.{total.toFixed(2)}</div>
      </div>
      {carrito.length === 0 ? (
        <p className="mt-4 text-[var(--pv-muted)]">El carrito está vacío.</p>
      ) : (
        <button className="mt-5 px-4 py-2" onClick={handleCheckout} disabled={isLoading}>
          {requiereReceta ? 'Subir receta' : 'Continuar con el pago'}
        </button>
      )}
      <div className="mt-4">
        <Link className="inline-block px-4 py-2" style={{ background: 'var(--pv-orange)', color: 'white', borderRadius: 12 }}to="/search">Volver al listado de productos</Link>
      </div>
    </div>
  );
};

export default Cart_Details;
