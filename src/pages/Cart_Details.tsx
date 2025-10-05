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

  // This function converts cart products for prescription upload
  const getProductosParaReceta = () => {
    return carrito
      .filter(p => Boolean(p.requiere_receta))
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.quantity // Use the quantity from CartItem
      }));
  };

  // Check if any product requires a prescription
  const requiereReceta = carrito.some(p => Boolean(p.requiere_receta));

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
    <div>
      <h1>Carrito de Compras</h1>
      <ul>
        {carrito.map(producto => (
          <li key={producto.id}>
            <strong>{producto.nombre}</strong> - S/.{producto.precio} x {producto.quantity}
            {Boolean(producto.requiere_receta) ? <span> (Requiere receta)</span> : null}
          </li>
        ))}
      </ul>
      {carrito.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <button onClick={handleCheckout} disabled={isLoading}>
          {requiereReceta ? 'Subir receta' : 'Continuar con el pago'}
        </button>
      )}
      <br />
      <Link to="/search">Volver al listado de productos</Link>
    </div>
  );
};

export default Cart_Details;
