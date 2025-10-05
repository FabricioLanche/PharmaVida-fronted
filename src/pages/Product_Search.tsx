import React, { useEffect, useState } from 'react';
import { fetchProductos } from '../services/productos_y_ofertas/productosAPI';
import { type Producto } from '../types/productos';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authContext'; // Import the useAuth hook

// Define a type for items in the cart, including quantity
interface CartItem extends Producto {
  quantity: number;
}

const Product_Search: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<CartItem[]>([]); // Use CartItem type for carrito
  const { user, isLoading } = useAuth(); // Get user and isLoading from auth context
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Ensure fetchProductos returns Promise<Producto[]>
    fetchProductos().then((data: Producto[]) => setProductos(data));
    // Recupera el carrito de localStorage al cargar la página
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
  }, []);

  const agregarAlCarrito = (productoToAdd: Producto) => {
    if (isLoading) return; // Do nothing if still loading auth state

    if (!user) {
      // If user is not authenticated, navigate to login page
      alert('Debes iniciar sesión para agregar productos al carrito.');
      navigate('/login'); // Assuming '/login' is the route for the login page
      return;
    }

    setCarrito(prevCarrito => {
      const existingItemIndex = prevCarrito.findIndex(item => item.id === productoToAdd.id);
      let nuevoCarrito: CartItem[];

      if (existingItemIndex > -1) {
        // If item exists, increase quantity
        nuevoCarrito = [...prevCarrito];
        nuevoCarrito[existingItemIndex].quantity += 1;
      } else {
        // If item does not exist, add it with quantity 1
        nuevoCarrito = [...prevCarrito, { ...productoToAdd, quantity: 1 }];
      }
      
      localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
      return nuevoCarrito;
    });
  };

  const handleGoToCart = () => {
    if (isLoading) return; // Do nothing if still loading auth state

    if (!user) {
      alert('Debes iniciar sesión para ver tu carrito.');
      navigate('/login'); // Assuming '/login' is the route for the login page
      return;
    }
    navigate('/cart'); // Navigate to cart page if authenticated
  };

  return (
    <div>
      <h1>Listado de Productos</h1>
      <ul>
        {productos.map(producto => (
          <li key={producto.id}>
            <strong>{producto.nombre}</strong> - S/.{producto.precio}
            <button onClick={() => agregarAlCarrito(producto)} disabled={isLoading}>Agregar al carrito</button>
            {producto.requiere_receta ? <span> (Requiere receta)</span> : null}
          </li>
        ))}
      </ul>
      {/* Modified link to use the navigate function for conditional routing */}
      <button onClick={handleGoToCart} disabled={isLoading}>
        Ir al carrito ({carrito.length})
      </button>
    </div>
  );
};

export default Product_Search;
