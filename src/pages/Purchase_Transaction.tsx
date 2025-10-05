import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type Producto } from '../types/productos';
import { uploadPrescription } from '../services/recetas_y_medicos/recetasAPI';
import { useAuth } from '../hooks/authContext'; // Import useAuth

// Define a type for items in the cart, including quantity
interface CartItem extends Producto {
  quantity: number;
}

// Define the form structure for a single prescription, matching what's used in Prescription.tsx
interface PrescriptionItem extends Pick<Producto, 'id' | 'nombre' | 'precio' | 'requiere_receta'> {
  cantidad: number;
}

// Define the structure for a prescription entry in the UI state
interface RecetaForm { // Define RecetaForm locally
  file: File | null; // Renamed from archivoPDF to file to match handleFileChange
  fechaEmision: string;
  medicoCMP: string;
  productos: PrescriptionItem[]; // Use PrescriptionItem for products in the prescription
}

export default function Purchase_Transaction() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productsRequiringPrescription, setProductsRequiringPrescription] = useState<CartItem[]>([]);
  const [prescriptions, setPrescriptions] = useState<RecetaForm[]>([]);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('');
  const { user, isLoading } = useAuth(); // Get user and isLoading from auth context
  const navigate = useNavigate();

  useEffect(() => {
    // Load cart items from localStorage
    const storedCart = localStorage.getItem('carrito');
    if (storedCart) {
      const parsedCart: CartItem[] = JSON.parse(storedCart);
      setCartItems(parsedCart);
      setProductsRequiringPrescription(parsedCart.filter((item: CartItem) => Boolean(item.requiere_receta)));
    }
  }, []);

  // Calculate total amount
  const totalAmount = cartItems.reduce((total, item) => total + (item.precio * item.quantity), 0);

  // Handle file changes for prescriptions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file, // Use 'file'
        medicoCMP: '',
        fechaEmision: '',
        productos: [], // Initialize products as empty
      }));
      setPrescriptions(prev => [...prev, ...newFiles]);
    }
  };

  // (Removed unused handleChange)

  // Handle product assignment to a prescription
  const handleProductAssignment = (prescriptionIndex: number, productId: number) => {
    const updatedPrescriptions = [...prescriptions];
    const prescription = updatedPrescriptions[prescriptionIndex];
    const isAssigned = prescription.productos.some((p: PrescriptionItem) => p.id === productId); // Check if product is already assigned

    if (isAssigned) {
      // Remove product if already assigned
      prescription.productos = prescription.productos.filter((p: PrescriptionItem) => p.id !== productId);
    } else {
      // Find the product details from productsRequiringPrescription
      const productToAdd = productsRequiringPrescription.find((p: CartItem) => p.id === productId);
      if (productToAdd) {
        // Add product with correct PrescriptionItem format
        prescription.productos.push({
          id: productToAdd.id,
          nombre: productToAdd.nombre,
          cantidad: productToAdd.quantity,
          precio: productToAdd.precio,
          requiere_receta: productToAdd.requiere_receta,
        });
      }
    }
    setPrescriptions(updatedPrescriptions);
  };

  // Define handlePrescriptionInfoChange function
  const handlePrescriptionInfoChange = (index: number, field: 'medicoCMP' | 'fechaEmision', value: string) => {
    const updatedPrescriptions = [...prescriptions];
    if (updatedPrescriptions[index]) {
      updatedPrescriptions[index] = {
        ...updatedPrescriptions[index],
        [field]: value,
      };
      setPrescriptions(updatedPrescriptions);
    }
  };

  // Check if all products requiring prescription have been assigned to a recipe
  const allProductsAssigned = productsRequiringPrescription.every((product: CartItem) =>
    prescriptions.some((p: RecetaForm) => p.productos.some((assignedProduct: PrescriptionItem) => assignedProduct.id === product.id))
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');

    if (!user) {
      alert('Debes iniciar sesión para completar la compra.');
      navigate('/login');
      return;
    }

    if (!consent) {
      setMessage('Debe aceptar la declaración de responsabilidad para continuar.');
      return;
    }

    if (!allProductsAssigned && productsRequiringPrescription.length > 0) {
      setMessage('Por favor, asigne una receta a cada producto que la requiera.');
      return;
    }

    if (prescriptions.length === 0 && productsRequiringPrescription.length > 0) {
      alert('Por favor, sube al menos una receta para los productos requeridos.');
      return;
    }

    setMessage('Procesando su pedido...');
    try {
      // Upload prescriptions first if any exist
      if (prescriptions.length > 0) {
        for (const prescription of prescriptions) {
          const formData = new FormData();
          // Ensure file is not null before appending
          if (prescription.file) {
            formData.append('archivoPDF', prescription.file);
          } else {
            // Handle error: file is missing for a prescription
            throw new Error(`Receta para ${prescription.productos.map(p => p.nombre).join(', ')} is missing the PDF file.`);
          }
          formData.append('fechaEmision', prescription.fechaEmision);
          formData.append('medicoCMP', prescription.medicoCMP);
          const pacienteDNI = user?.dni?.toString() || localStorage.getItem('userDNI');
          formData.append('pacienteDNI', pacienteDNI || '');
          formData.append(
            'productos',
            JSON.stringify(
              prescription.productos.map((p: PrescriptionItem) => ({
                id: p.id,
                nombre: p.nombre,
                cantidad: p.cantidad,
              }))
            )
          );
          await uploadPrescription(formData);
        }
      }

      // Simulate payment process
      setMessage('Pago simulado exitosamente. Procesando su pedido...');
      // In a real app, this would involve calling a payment gateway API.
      // For simulation, we just show a success message.

      // Save order summary before clearing cart
      localStorage.setItem('orderSummary', JSON.stringify({ total: totalAmount, time: new Date().toISOString() }));

      // Clear cart after successful order
      localStorage.removeItem('carrito');

      // Redirect to a confirmation page
      setTimeout(() => navigate('/order-confirmation'), 2000);

    } catch (error: any) {
      console.error('Error during purchase:', error);
      setMessage(`Error al procesar su pedido: ${error.message}`);
    }
  };

  // If no products require a prescription, show a simplified payment interface.
  if (productsRequiringPrescription.length === 0) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto' }}>
        <h1>Finalizar Compra</h1>
        <p>No se requieren recetas para los productos en su carrito.</p>
        <p><strong>Total: S/.{totalAmount.toFixed(2)}</strong></p>
        {/* Here you would render the standard payment component */}
        <button onClick={handleSubmit} disabled={isLoading || !user} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', opacity: isLoading || !user ? 0.6 : 1 }}>
          {isLoading ? 'Procesando...' : 'Proceder al Pago'}
        </button>
        <br />
        <Link to="/cart">Volver al Carrito</Link>
      </div>
    );
  }

  // Render the form for products requiring prescriptions
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>Adjuntar Recetas Médicas</h1>
      <p>Algunos productos en su carrito requieren una receta médica. Por favor, adjunte los archivos necesarios y asócielos a los productos correspondientes.</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h3>Productos que requieren receta:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {productsRequiringPrescription.map(product => (
              <li key={product.id} style={{ background: '#f0f0f0', padding: '8px', borderRadius: '4px', marginBottom: '5px' }}>
                {product.nombre} - S/.{product.precio} x {product.quantity}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Subir Archivos de Recetas (PDF)</h3>
          <input type="file" multiple onChange={handleFileChange} accept="application/pdf" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}/>
        </div>

        {prescriptions.map((prescription, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4>Receta #{index + 1}: <span style={{ fontWeight: 'normal' }}>{prescription.file ? prescription.file.name : 'No file selected'}</span></h4>
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
                    <input
                      type="checkbox"
                      id={`product-${index}-${product.id}`}
                      checked={prescription.productos.some((p: PrescriptionItem) => p.id === product.id)} // Check if product is assigned
                      onChange={() => handleProductAssignment(index, product.id)}
                    />
                    <label htmlFor={`product-${index}-${product.id}`} style={{ marginLeft: '5px' }}>{product.nombre} - S/.{product.precio}</label>
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

        <button
          type="submit"
          disabled={isLoading || !user || (productsRequiringPrescription.length > 0 && !allProductsAssigned)}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            opacity: (isLoading || !user || (productsRequiringPrescription.length > 0 && !allProductsAssigned)) ? 0.6 : 1
          }}
        >
          {isLoading ? 'Procesando...' : 'Continuar con el Pago'}
        </button>
      </form>

      {message && <p style={{ marginTop: '20px', padding: '10px', borderRadius: '4px', background: message.includes('exitosamente') ? '#d4edda' : '#f8d7da', color: message.includes('exitosamente') ? '#155724' : '#721c24' }}>{message}</p>}

      <div style={{ marginTop: '20px' }}>
        <Link to="/cart">Volver al Carrito</Link>
      </div>
    </div>
  );
};
