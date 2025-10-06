import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingActions: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goCart = () => navigate('/cart');
  const buyNow = () => {
    const stored = localStorage.getItem('carrito');
    const items = stored ? JSON.parse(stored) : [];
    if (!items || items.length === 0) {
      navigate('/cart');
      return;
    }
    // Si hay productos con receta, seguir flujo normal desde carrito
    const requiresRx = items.some((p: any) => Boolean(p.requiere_receta));
    navigate(requiresRx ? '/cart' : '/cart/transaction');
  };

  // Ocultar en algunas rutas de checkout final si se desea
  const hidden = ['/order-confirmation'].includes(location.pathname);
  if (hidden) return null;

  return (
    <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 50 }}>
      <button className="px-4 py-2" onClick={buyNow}>Comprar ahora</button>
      <button className="btn-orange px-4 py-2" onClick={goCart}>Ir al carrito</button>
    </div>
  );
};

export default FloatingActions;
