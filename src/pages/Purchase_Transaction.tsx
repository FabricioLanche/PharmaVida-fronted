import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadPrescription } from '../services/recetas_y_medicos/recetasAPI';

// Simulación de datos del carrito. En una aplicación real, esto vendría de un estado global o contexto.
const mockCartItems = [
  { id: 1, name: 'Atorvastatina 20mg', requiresPrescription: true, quantity: 1 },
  { id: 2, name: 'Paracetamol 500mg', requiresPrescription: false, quantity: 2 },
  { id: 3, name: 'Amoxicilina 500mg', requiresPrescription: true, quantity: 1 },
];

// Definición de tipos para mayor claridad
interface Product {
  id: number;
  name: string;
  requiresPrescription: boolean;
  quantity: number;
}

interface PrescriptionFile {
  file: File;
  medicoCMP: string;
  fechaEmision: string;
  assignedProductIds: number[];
}

export default function Purchase_Transaction() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [productsRequiringPrescription, setProductsRequiringPrescription] = useState<Product[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionFile[]>([]);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Simula la carga de productos del carrito al montar el componente
    setCartItems(mockCartItems);
    const productsWithPrescription = mockCartItems.filter(item => item.requiresPrescription);
    setProductsRequiringPrescription(productsWithPrescription);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        file,
        medicoCMP: '',
        fechaEmision: '',
        assignedProductIds: [],
      }));
      setPrescriptions(prev => [...prev, ...newFiles]);
    }
  };

  const handlePrescriptionInfoChange = (index: number, field: 'medicoCMP' | 'fechaEmision', value: string) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions[index][field] = value;
    setPrescriptions(updatedPrescriptions);
  };

  const handleProductAssignment = (prescriptionIndex: number, productId: number) => {
    const updatedPrescriptions = [...prescriptions];
    const prescription = updatedPrescriptions[prescriptionIndex];
    const isAssigned = prescription.assignedProductIds.includes(productId);

    if (isAssigned) {
      prescription.assignedProductIds = prescription.assignedProductIds.filter(id => id !== productId);
    } else {
      prescription.assignedProductIds.push(productId);
    }

    setPrescriptions(updatedPrescriptions);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!consent) {
      setMessage('Debe aceptar la declaración de responsabilidad para continuar.');
      return;
    }

    const allProductsAssigned = productsRequiringPrescription.every(product =>
      prescriptions.some(p => p.assignedProductIds.includes(product.id))
    );

    if (!allProductsAssigned) {
      setMessage('Por favor, asigne una receta a cada producto que la requiera.');
      return;
    }

    if (prescriptions.length === 0) {
      alert('Por favor, sube al menos una receta.');
      return;
    }

    try {
      // Asumiendo que el DNI del paciente se obtiene de algún estado o contexto
      const pacienteDNI = '12345678'; // Reemplazar con la lógica real para obtener el DNI

      for (const prescription of prescriptions) {
        const formData = new FormData();
        formData.append('pacienteDNI', String(pacienteDNI)); // DNI del usuario logueado
        formData.append('medicoCMP', prescription.medicoCMP);
        formData.append('fechaEmision', prescription.fechaEmision);
        const productos = productsRequiringPrescription
          .filter(p => prescription.assignedProductIds.includes(p.id))
          .map(p => ({ id: String(p.id), nombre: p.name, cantidad: 1 }));
        formData.append('productos', JSON.stringify(productos));
        formData.append('archivoPDF', prescription.file);

        await uploadPrescription(formData);
      }

      setMessage('Recetas subidas exitosamente. Procediendo al pago...');
      // Aquí se integraría la lógica para procesar el pago final
      
    } catch (error: any) {
      console.error('Error uploading prescriptions:', error);
      setMessage(`Error al subir las recetas: ${error.message}`);
    }
  };

  // Si no hay productos que requieran receta, se muestra una interfaz de pago simple.
  if (productsRequiringPrescription.length === 0) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto' }}>
        <h1>Finalizar Compra</h1>
        <p>No se requieren recetas para los productos en su carrito.</p>
        {/* Aquí se renderizaría el componente de pago estándar */}
        <button style={{ padding: '10px 20px' }}>Proceder al Pago</button>
        <br />
        <Link to="/">Volver al Inicio</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Adjuntar Recetas Médicas</h1>
      <p>Algunos productos en su carrito requieren una receta médica. Por favor, adjunte los archivos necesarios y asócielos a los productos correspondientes.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3>Productos que requieren receta:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {productsRequiringPrescription.map(product => (
              <li key={product.id} style={{ background: '#f0f0f0', padding: '8px', borderRadius: '4px' }}>{product.name}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Subir Archivos de Recetas (PDF)</h3>
          <input type="file" multiple onChange={handleFileChange} accept="application/pdf" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}/>
        </div>

        {prescriptions.map((prescription, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4>Receta #{index + 1}: <span style={{ fontWeight: 'normal' }}>{prescription.file.name}</span></h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label>CMP del Médico:</label>
              <input type="text" value={prescription.medicoCMP} onChange={(e) => handlePrescriptionInfoChange(index, 'medicoCMP', e.target.value)} required style={{ padding: '8px', flex: 1 }}/>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label>Fecha de Emisión:</label>
              <input type="date" value={prescription.fechaEmision} onChange={(e) => handlePrescriptionInfoChange(index, 'fechaEmision', e.target.value)} required style={{ padding: '8px', flex: 1 }}/>
            </div>
            <div>
              <label>Asignar a productos:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px' }}>
                {productsRequiringPrescription.map(product => (
                  <div key={product.id}>
                    <input type="checkbox" id={`product-${index}-${product.id}`} checked={prescription.assignedProductIds.includes(product.id)} onChange={() => handleProductAssignment(index, product.id)} />
                    <label htmlFor={`product-${index}-${product.id}`} style={{ marginLeft: '5px' }}>{product.name}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '20px', background: '#fffbe6', padding: '15px', border: '1px solid #ffe58f', borderRadius: '4px' }}>
          <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <label htmlFor="consent" style={{ marginLeft: '10px' }}>Declaro bajo juramento que la información y los documentos presentados son auténticos y válidos, asumiendo toda la responsabilidad legal.</label>
        </div>

        <button type="submit" disabled={!consent} style={{ padding: '12px 20px', fontSize: '16px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', opacity: consent ? 1 : 0.6 }}>
          Continuar con el Pago
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', background: message.includes('exitosamente') ? '#d4edda' : '#f8d7da', color: message.includes('exitosamente') ? '#155724' : '#721c24' }}>{message}</p>}

      <div style={{ marginTop: '20px' }}>
        <Link to="/cart">Volver al Carrito</Link>
      </div>
    </div>
  );
}