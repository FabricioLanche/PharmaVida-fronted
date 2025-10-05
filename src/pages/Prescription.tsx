import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { uploadPrescription } from '../services/recetas_y_medicos/recetasAPI';

export default function Prescription() {
  const [pacienteDNI, setPacienteDNI] = useState('');
  const [medicoCMP, setMedicoCMP] = useState('');
  const [fechaEmision, setFechaEmision] = useState('');
  const [productos, setProductos] = useState([{ codigoProducto: '', nombre: '', cantidad: 1 }]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPrescriptionFile(event.target.files[0]);
    }
  };

  const handleProductChange = (index: number, field: string, value: string | number) => {
    const newProductos = [...productos];
    newProductos[index] = { ...newProductos[index], [field]: value };
    setProductos(newProductos);
  };

  const addProduct = () => {
    setProductos([...productos, { codigoProducto: '', nombre: '', cantidad: 1 }]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!pacienteDNI || !medicoCMP || !fechaEmision || !prescriptionFile || !consent) {
      setMessage('Por favor, complete todos los campos, adjunte un archivo y acepte los términos.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pacienteDNI', pacienteDNI);
      formData.append('medicoCMP', medicoCMP);
      formData.append('fechaEmision', fechaEmision);
      formData.append('productos', JSON.stringify(productos));
      formData.append('archivoPDF', prescriptionFile);

      await uploadPrescription(formData);
      setMessage('Receta subida exitosamente!');
      setPacienteDNI('');
      setMedicoCMP('');
      setFechaEmision('');
      setProductos([{ codigoProducto: '', nombre: '', cantidad: 1 }]);
      setPrescriptionFile(null);
      setConsent(false);
      (event.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error('Error uploading prescription:', error);
      let errorMessage = 'Error al subir la receta. Por favor, intente de nuevo.';
      if (error.message) {
        errorMessage = error.message;
      }
      if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Error de red. Asegúrese de que el backend esté en ejecución y accesible.';
      }
      setMessage(errorMessage);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Subir Receta Médica</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid #ddd', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div>
          <label htmlFor="pacienteDNI" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>DNI del Paciente:</label>
          <input type="text" id="pacienteDNI" value={pacienteDNI} onChange={(e) => setPacienteDNI(e.target.value)} required style={{ width: 'calc(100% - 20px)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label htmlFor="medicoCMP" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>CMP del Médico:</label>
          <input type="text" id="medicoCMP" value={medicoCMP} onChange={(e) => setMedicoCMP(e.target.value)} required style={{ width: 'calc(100% - 20px)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label htmlFor="fechaEmision" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha de Emisión:</label>
          <input type="date" id="fechaEmision" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} required style={{ width: 'calc(100% - 20px)', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Productos:</label>
          {productos.map((producto, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input type="text" placeholder="Código" value={producto.codigoProducto} onChange={(e) => handleProductChange(index, 'codigoProducto', e.target.value)} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="text" placeholder="Nombre" value={producto.nombre} onChange={(e) => handleProductChange(index, 'nombre', e.target.value)} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input type="number" placeholder="Cantidad" value={producto.cantidad} onChange={(e) => handleProductChange(index, 'cantidad', parseInt(e.target.value, 10))} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
          ))}
          <button type="button" onClick={addProduct} style={{ padding: '8px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Añadir Producto</button>
        </div>
        <div>
          <label htmlFor="prescriptionFile" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Archivo de Receta (PDF):</label>
          <input type="file" id="prescriptionFile" onChange={handleFileChange} accept="application/pdf" required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9f9f9' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <label htmlFor="consent">Declaro que la receta es auténtica y válida.</label>
        </div>
        <button type="submit" disabled={!consent} style={{ padding: '12px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', opacity: consent ? 1 : 0.5 }}>
          Subir Receta
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', textAlign: 'center', color: message.includes('exitosamente') ? 'green' : 'red' }}>{message}</p>}
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Link to="/prescription/1" style={{ marginRight: '15px', color: '#007bff', textDecoration: 'none' }}>Ver Detalles de Receta (ejemplo)</Link>
        <br />
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>Volver al Inicio</Link>
      </div>
    </div>
  );
}