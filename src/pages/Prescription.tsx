import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { type Producto } from '../types/productos';
import { uploadPrescription, getPrescriptionById } from '../services/recetas_y_medicos/recetasAPI';
import { validateRecetaOrchestrator } from '../services/orchestrator/orchestratorAPI';
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
  const [consent, setConsent] = useState(false);

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
        // Debug: Log payload being sent (without dumping the entire file)
        try {
          const payloadPreview = {
            pacienteDNI: pacienteDNI || '',
            medicoCMP: receta.medicoCMP,
            fechaEmision: receta.fechaEmision,
            productos: JSON.parse(String(formData.get('productos') || '[]')),
            archivoPDF: receta.archivoPDF ? { name: receta.archivoPDF.name, type: receta.archivoPDF.type, size: receta.archivoPDF.size } : null,
          };
          console.log('[Prescription] POST upload receta ->', payloadPreview);
        } catch {}
        // upload returns { mensaje, receta }
        const uploadResult = await uploadPrescription(formData);
        console.log('[Prescription] Upload response <-', uploadResult);
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

  // Validar con orquestador y consultar estado real en MS de recetas
  const checkPrescriptionStatuses = async (recetasToUpdate: RecetaForm[]) => {
    const updatedRecetas = [...recetasToUpdate];
    let allValidated = true;
    const token = localStorage.getItem('authToken') || '';

    for (let i = 0; i < updatedRecetas.length; i++) {
      const receta = updatedRecetas[i];
      if (!receta.id) continue;
      try {
        if (token) {
          console.log('[Prescription] Orchestrator validate -> recetaId:', String(receta.id));
          await validateRecetaOrchestrator(token, String(receta.id));
        }
        // Poll hasta 10s el estado en MS de recetas
        const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
        let estado: 'pendiente' | 'validada' | 'rechazada' = 'pendiente';
        let mensaje = '';
        for (let t = 0; t < 10; t++) {
          try {
            const r = await getPrescriptionById(String(receta.id));
            if (r && r.estadoValidacion) {
              estado = r.estadoValidacion;
              if (t === 0 || estado !== 'pendiente') {
                console.log('[Prescription] Poll GET estado <-', { recetaId: String(receta.id), intento: t + 1, estado });
              }
              if (estado !== 'pendiente') break;
            }
          } catch {}
          await wait(1000);
        }
        updatedRecetas[i] = {
          ...receta,
          status: estado === 'validada' ? 'validated' : estado === 'rechazada' ? 'rejected' : 'pending',
          validationMessage: mensaje,
        };
        if (estado === 'rechazada' || estado === 'pendiente') allValidated = false;
      } catch (error) {
        console.error(`Error validando receta ${receta.id} en orquestador:`, error);
        updatedRecetas[i] = {
          ...receta,
          status: 'rejected',
          validationMessage: 'Error al validar la receta en orquestador.',
        };
        allValidated = false;
      }
    }
    setRecetas(updatedRecetas);

    if (allValidated) {
      setMessage('Todas las recetas han sido validadas. Puedes continuar con el pago.');
      setTimeout(() => navigate('/checkout/summary'), 1500);
        } else {
      setMessage('Algunas recetas no están validadas. Puedes continuar y serán revisadas, o corrige y vuelve a subir.');
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
    <div className="page">
      <h2 className="text-2xl font-bold mb-3">Subir Receta Médica</h2>
      {message && (
        <div className={`alert mt-2 ${message.includes('validada') ? 'alert-success' : message.includes('rechazadas') || message.includes('Error') ? 'alert-info' : 'alert'}`}>
          {message}
        </div>
      )}

      {productosReceta.length === 0 && recetas.length === 0 ? (
        <p>No hay productos que requieran receta en tu carrito.</p>
      ) : (
        <>
          {productosReceta.length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-2">Selecciona productos para esta receta</h4>
              <ul className="space-y-2 mb-3">
                {productosReceta.map(producto => (
                  <li key={producto.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(String(producto.id))}
                      onChange={() => handleProductSelection(String(producto.id))}
                    />
                    <label className="cursor-pointer">
                      {producto.nombre} <span className="text-[var(--pv-muted)]">- S/.{producto.precio}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className="grid sm:grid-cols-2 gap-3">
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
              </div>
              <div className="mt-3">
                <input type="file" accept="application/pdf" onChange={handleFileChange} />
              </div>
              <button className="mt-3 px-4 py-2" onClick={handleAddReceta} disabled={selectedProductIds.length === 0 || isLoading}>
                Agregar receta
              </button>
            </div>
          )}

          {recetas.length > 0 && (
            <div className="card">
              <h4 className="text-lg font-semibold mb-2">Recetas agregadas</h4>
              <ul className="space-y-2">
                {recetas.map((receta, idx) => (
                  <div key={receta.id || idx} className="border-t border-[var(--pv-border)] pt-2 first:border-t-0 first:pt-0">
                    <div className="text-sm">
                      {receta.productos.map(p => p.nombre).join(', ')}
                      <span className="ml-2 text-[var(--pv-muted)]">| CMP: {receta.medicoCMP} | Fecha: {receta.fechaEmision}</span>
                    </div>
                    {receta.status && (
                      <div className={`mt-1 text-xs ${receta.status === 'validated' ? 'text-green-400' : receta.status === 'rejected' ? 'text-orange-400' : 'text-yellow-300'}`}>
                        Status: {receta.status} {receta.validationMessage && `(${receta.validationMessage})`}
                      </div>
                    )}
                    {receta.status === 'rejected' && (
                      <div className="mt-2">
                        <p className="alert alert-info text-sm">
                          Receta rechazada: {receta.validationMessage || 'Motivo no especificado'}
                        </p>
                        <button className="mt-2 px-3 py-2" onClick={() => handleRetryUpload(idx)}>
                          Corregir y volver a subir
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </ul>
              <div className="mt-3">
                <label className="text-sm flex items-start gap-2">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>Declaro bajo juramento que la información y los documentos presentados son auténticos y válidos, asumiendo toda la responsabilidad legal.</span>
                </label>
              </div>
              <button
                className="mt-4 px-4 py-2"
                onClick={handleSubmit}
                disabled={
                  recetas.length === 0 ||
                  isLoading ||
                  !user ||
                  !consent
                }
              >
                Subir todas las recetas y continuar
              </button>
            </div>
          )}
        </>
      )}
      <div className="mt-4">
        <Link className="btn-orange inline-block px-4 py-2" to="/cart">Volver al carrito</Link>
      </div>
    </div>
  );
};

export default Prescription;
