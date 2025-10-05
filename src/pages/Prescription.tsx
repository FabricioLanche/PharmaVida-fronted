import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type Producto } from '../types/productos';
import { uploadPrescription, validatePrescription } from '../services/recetas_y_medicos/recetasAPI';
import { useAuth } from '../hooks/authContext';

// Define CartItem locally as it's not exported from Product_Search
interface CartItem extends Producto {
  quantity: number;
}

// Define a type for items in the cart that are associated with a prescription
interface PrescriptionItem extends Pick<Producto, 'id' | 'nombre' | 'precio' | 'requiere_receta'> {
  cantidad: number;
}

// Define the structure for a prescription entry in the UI state
interface RecetaForm {
  id?: string | number;
  archivoPDF: File | null;
  fechaEmision: string;
  medicoCMP: string;
  productos: PrescriptionItem[];
  status?: 'pending' | 'validated' | 'rejected';
  validationMessage?: string;
}

// Types for API responses are handled in recetasAPI

const Prescription: React.FC = () => {
  const [productosReceta, setProductosReceta] = useState<CartItem[]>([]);
  const [recetas, setRecetas] = useState<RecetaForm[]>([]);
  const [currentReceta, setCurrentReceta] = useState<RecetaForm>({
    archivoPDF: null,
    fechaEmision: '',
    medicoCMP: '',
    productos: [],
  });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = localStorage.getItem('carrito');
    if (storedCart) {
      const carrito: CartItem[] = JSON.parse(storedCart);
      setProductosReceta(carrito.filter(p => Boolean(p.requiere_receta)));
    }
  }, []);

  const handleProductSelection = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCurrentReceta({
      ...currentReceta,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentReceta({
      ...currentReceta,
      archivoPDF: e.target.files ? e.target.files[0] : null,
    });
  };

  const handleAddReceta = () => {
    if (
      !currentReceta.archivoPDF ||
      !currentReceta.fechaEmision ||
      !currentReceta.medicoCMP ||
      selectedProductIds.length === 0
    ) {
      setMessage('Completa todos los campos y selecciona productos.');
      return;
    }

    const productosSeleccionados: PrescriptionItem[] = productosReceta
      .filter(p => selectedProductIds.includes(String(p.id)))
      .map(p => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.quantity || 1,
        precio: p.precio,
        requiere_receta: p.requiere_receta,
      }));

    setRecetas([
      ...recetas,
      {
        ...currentReceta,
        productos: productosSeleccionados,
        status: 'pending',
        validationMessage: '',
      },
    ]);

    setProductosReceta(prev =>
      prev.filter(p => !selectedProductIds.includes(String(p.id)))
    );

    setCurrentReceta({
      archivoPDF: null,
      fechaEmision: '',
      medicoCMP: '',
      productos: [],
    });
    setSelectedProductIds([]);
    setMessage('');
  };

  // Subir todas las recetas y verificar estado
  const handleSubmit = async () => {
    if (isLoading) return;

    if (!user) {
      alert('Debes iniciar sesión para subir recetas.');
      navigate('/login');
      return;
    }

    // No permitir continuar si alguna receta está rechazada
    const allPrescriptionsValid = recetas.every(receta => receta.status !== 'rejected');
    if (!allPrescriptionsValid) {
      setMessage('Hay recetas rechazadas. Por favor, corrígelas o súbelas de nuevo.');
      return;
    }

    setMessage('Subiendo recetas...');
    try {
      const uploadedRecetasInfo: RecetaForm[] = [];

      for (let i = 0; i < recetas.length; i++) {
        const receta = recetas[i];
        const formData = new FormData();
        if (receta.archivoPDF) {
          formData.append('archivoPDF', receta.archivoPDF);
        } else {
          throw new Error(`Receta para ${receta.productos.map(p => p.nombre).join(', ')} no tiene archivo PDF.`);
        }
        formData.append('fechaEmision', receta.fechaEmision);
        formData.append('medicoCMP', receta.medicoCMP);
        const pacienteDNI = user?.dni?.toString() || localStorage.getItem('userDNI');
        formData.append('pacienteDNI', pacienteDNI || '');
        formData.append(
          'productos',
          JSON.stringify(
            receta.productos.map((p: PrescriptionItem) => ({
              id: p.id,
              nombre: p.nombre,
              cantidad: p.cantidad,
            }))
          )
        );
        // upload returns { mensaje, receta }
        const uploadResult = await uploadPrescription(formData);
        const uploaded = uploadResult.receta;
        uploadedRecetasInfo.push({
          ...receta,
          id: uploaded._id,
          status: uploaded.estadoValidacion === 'validada' ? 'validated' : uploaded.estadoValidacion === 'rechazada' ? 'rejected' : 'pending',
          validationMessage: uploadResult.mensaje || '',
        });
      }
      setRecetas(uploadedRecetasInfo);
      setMessage('Recetas subidas. Validando...');

      await checkPrescriptionStatuses(uploadedRecetasInfo);

    } catch (error: any) {
      console.error('Error submitting prescriptions:', error);
      setMessage('Error al subir las recetas. Verifica los datos o intenta de nuevo.');
    }
  };

  // Verificar estado de todas las recetas subidas
  const checkPrescriptionStatuses = async (recetasToUpdate: RecetaForm[]) => {
    const updatedRecetas = [...recetasToUpdate];
    let allValidated = true;

    for (let i = 0; i < updatedRecetas.length; i++) {
      const receta = updatedRecetas[i];
      if (receta.id) {
        try {
          const validateRes = await validatePrescription(String(receta.id));
          const estado = validateRes.receta.estadoValidacion;
          updatedRecetas[i] = {
            ...receta,
            status: estado === 'validada' ? 'validated' : estado === 'rechazada' ? 'rejected' : 'pending',
            validationMessage: validateRes.mensaje,
          };
          if (estado === 'rechazada') {
            allValidated = false;
          }
        } catch (error) {
          console.error(`Error validating prescription ${receta.id}:`, error);
          updatedRecetas[i] = {
            ...receta,
            status: 'rejected',
            validationMessage: 'Error al validar la receta.',
          };
          allValidated = false;
        }
      }
    }
    setRecetas(updatedRecetas);

    if (allValidated) {
      setMessage('Todas las recetas han sido validadas. Puedes continuar con el pago.');
      setTimeout(() => navigate('/cart/transaction'), 2000);
    } else {
      setMessage('Algunas recetas fueron rechazadas. Por favor, corrígelas o súbelas de nuevo.');
    }
  };

  // Permitir reintentar la carga de una receta rechazada
  function handleRetryUpload(index: number) {
    setRecetas(prev =>
      prev.map((r, i) =>
        i === index ? { ...r, archivoPDF: null, status: undefined, validationMessage: undefined } : r
      )
    );
  }

  return (
    <div>
      <h2>Subir Receta Médica</h2>
      {message && <p>{message}</p>}

      {productosReceta.length === 0 && recetas.length === 0 ? (
        <p>No hay productos que requieran receta en tu carrito.</p>
      ) : (
        <>
          {productosReceta.length > 0 && (
            <div>
              <h4>Selecciona productos para esta receta:</h4>
              <ul>
                {productosReceta.map(producto => (
                  <li key={producto.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(String(producto.id))}
                        onChange={() => handleProductSelection(String(producto.id))}
                      />
                      {producto.nombre} - S/.{producto.precio}
                    </label>
                  </li>
                ))}
              </ul>
              <input
                type="text"
                name="medicoCMP"
                placeholder="Código CMP del médico"
                value={currentReceta.medicoCMP}
                onChange={handleChange}
              />
              <input
                type="date"
                name="fechaEmision"
                value={currentReceta.fechaEmision}
                onChange={handleChange}
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <button onClick={handleAddReceta} disabled={selectedProductIds.length === 0 || isLoading}>
                Agregar receta
              </button>
            </div>
          )}

          {recetas.length > 0 && (
            <div>
              <h4>Recetas agregadas:</h4>
              <ul>
                {recetas.map((receta, idx) => (
                  <div key={receta.id || idx}>
                    {receta.productos.map(p => p.nombre).join(', ')} | CMP: {receta.medicoCMP} | Fecha: {receta.fechaEmision}
                    {receta.status && (
                      <span style={{ marginLeft: '10px', color: receta.status === 'validated' ? 'green' : receta.status === 'rejected' ? 'red' : 'orange' }}>
                        Status: {receta.status} {receta.validationMessage && `(${receta.validationMessage})`}
                      </span>
                    )}
                    {receta.status === 'rejected' && (
                      <div>
                        <p style={{ color: 'red' }}>
                          Receta rechazada: {receta.validationMessage || 'Motivo no especificado'}
                        </p>
                        <button onClick={() => handleRetryUpload(idx)}>
                          Corregir y volver a subir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </ul>
              <button
                onClick={handleSubmit}
                disabled={
                  recetas.length === 0 ||
                  isLoading ||
                  !user ||
                  recetas.some(r => r.status === 'pending')
                }
              >
                Subir todas las recetas y continuar
              </button>
            </div>
          )}
        </>
      )}
      <br />
      <Link to="/cart">Volver al carrito</Link>
    </div>
  );
};

export default Prescription;
