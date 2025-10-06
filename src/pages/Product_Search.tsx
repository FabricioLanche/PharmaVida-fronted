import React, { useEffect, useState } from 'react';
import { listarProductosPaginado, searchProductosPorNombre, listarPorTipo, listarPorReceta, listarStockBajo, type ProductosPaginadosResponse } from '../services/productos_y_ofertas/productosAPI';
import { type Producto } from '../types/productos';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authContext'; // Import the useAuth hook

// Define a type for items in the cart, including quantity
interface CartItem extends Producto {
  quantity: number;
}

const Product_Search: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pagesize] = useState(12);
  const [query, setQuery] = useState('');
  const [tipo, setTipo] = useState('');
  const [receta, setReceta] = useState<'all' | 'true' | 'false'>('all');
  const [stockBajo, setStockBajo] = useState(false);
  const [carrito, setCarrito] = useState<CartItem[]>([]); // Use CartItem type for carrito
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const { user, isLoading } = useAuth(); // Get user and isLoading from auth context
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // carga inicial con paginación
    loadProducts(1);
    // Recupera el carrito de localStorage al cargar la página
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      setCarrito(JSON.parse(carritoGuardado));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProducts = async (targetPage = page) => {
    // Uso exclusivo de endpoints existentes, con prioridad: nombre > stock-bajo > tipo > receta > paged
    let resp: ProductosPaginadosResponse;
    if (query.trim()) {
      resp = await searchProductosPorNombre(query.trim(), targetPage, pagesize);
    } else if (stockBajo) {
      resp = await listarStockBajo(10, targetPage, pagesize);
    } else if (tipo.trim()) {
      resp = await listarPorTipo(tipo.trim(), targetPage, pagesize);
    } else if (receta !== 'all') {
      resp = await listarPorReceta(receta === 'true', targetPage, pagesize);
    } else {
      resp = await listarProductosPaginado(targetPage, pagesize);
    }
    setProductos(resp.productos || []);
    setTotal(resp.total || 0);
    setPage(resp.page || targetPage);
  };

  const agregarAlCarrito = (productoToAdd: Producto) => {
    if (isLoading) return; // Do nothing if still loading auth state

    if (!user) {
      alert('Debes iniciar sesión para agregar productos al carrito.');
      navigate('/login'); // Assuming '/login' is the route for the login page
      return;
    }

    const qty = Math.max(1, Number(cantidades[productoToAdd.id] || 1));

    setCarrito(prev => {
      const existingIndex = prev.findIndex(item => item.id === productoToAdd.id);
      if (existingIndex !== -1) {
        const updatedCarrito = [...prev];
        updatedCarrito[existingIndex].quantity += qty; // Incrementar según selector
        localStorage.setItem('carrito', JSON.stringify(updatedCarrito));
        return updatedCarrito;
      } else {
        const nuevoProducto = { ...productoToAdd, quantity: qty } as CartItem; // Set selected quantity
        const updatedCarrito = [...prev, nuevoProducto];
        localStorage.setItem('carrito', JSON.stringify(updatedCarrito));
        return updatedCarrito;
      }
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
    <div className="page">
      <h1 className="text-3xl font-bold mb-4">Listado de Productos</h1>
      <div className="card mb-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label htmlFor="search">Buscar por nombre</label>
            <div className="flex gap-2">
              <input id="search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Paracetamol, Ibuprofeno..." />
              <button className="px-4" onClick={() => loadProducts(1)} disabled={isLoading}>Buscar</button>
            </div>
          </div>
          <div>
            <label htmlFor="tipo">Tipo</label>
            <input id="tipo" type="text" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="analgésico, jarabe..." />
          </div>
          <div>
            <label htmlFor="receta">Requiere receta</label>
            <select id="receta" value={receta} onChange={(e) => setReceta(e.target.value as any)}>
              <option value="all">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="flex items-center gap-2"><input type="checkbox" checked={stockBajo} onChange={(e) => setStockBajo(e.target.checked)} /> Stock bajo</label>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="btn-orange px-3 py-2" onClick={() => { setQuery(''); setTipo(''); setReceta('all'); setStockBajo(false); loadProducts(1); }} disabled={isLoading}>Limpiar filtros</button>
          <button className="px-3 py-2" onClick={() => loadProducts(1)} disabled={isLoading}>Aplicar</button>
        </div>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {productos.map(producto => (
          <li key={producto.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">{producto.nombre}</div>
                <div className="text-sm text-[var(--pv-muted)]">S/.{Number(producto.precio).toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={cantidades[producto.id] ?? 1}
                  onChange={(e) => setCantidades(prev => ({ ...prev, [producto.id]: Math.max(1, Number(e.target.value || 1)) }))}
                  className="w-16"
                />
                <button
                  className="px-3 py-2 text-sm"
                  onClick={() => agregarAlCarrito(producto)}
                  disabled={isLoading}
                >
                  Agregar
                </button>
              </div>
            </div>
            {producto.requiere_receta ? (
              <div className="mt-2 text-xs alert alert-warn">Requiere receta</div>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-[var(--pv-muted)]">Total: {total} productos</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2" disabled={page <= 1 || isLoading} onClick={() => loadProducts(page - 1)}>Anterior</button>
          <div className="text-sm">Página {page}</div>
          <button className="px-3 py-2" disabled={productos.length < pagesize || isLoading} onClick={() => loadProducts(page + 1)}>Siguiente</button>
        </div>
      </div>
      <div className="mt-5">
        <button className="btn-orange px-4 py-2" onClick={handleGoToCart} disabled={isLoading}>
          Ir al carrito ({carrito.length})
        </button>
      </div>
    </div>
  );
};

export default Product_Search;
