import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface OrderSummary {
  total: number;
  time: string;
}

const Order_Confirmation: React.FC = () => {
  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('orderSummary');
    if (stored) {
      try {
        setSummary(JSON.parse(stored));
      } catch {
        setSummary(null);
      }
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1>¡Compra confirmada!</h1>
      {summary ? (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Total pagado:</strong> S/.{summary.total.toFixed(2)}</p>
          <p><strong>Fecha y hora:</strong> {new Date(summary.time).toLocaleString()}</p>
        </div>
      ) : (
        <p>Tu compra ha sido procesada.</p>
      )}
      <div style={{ marginTop: '20px' }}>
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  );
};

export default Order_Confirmation;
