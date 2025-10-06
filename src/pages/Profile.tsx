import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/authContext';
import { getUserMe, updateUserMe, type UpdateUserDto } from '../services/usuarios_y_compras/usuariosAPI';
import { getMisComprasDetalladas, type CompraDetallada } from '../services/orchestrator/orchestratorAPI';

const Profile: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateUserDto>({ nombre: '', apellido: '', email: '', distrito: '' });
  const [compras, setCompras] = useState<CompraDetallada[]>([]);
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const me = await getUserMe(token);
        setForm({ nombre: (me as any).nombre || '', apellido: (me as any).apellido || '', email: (me as any).email || '', distrito: (me as any).distrito || '' });
        // Cargar historial de compras
        const comprasDetalladas = await getMisComprasDetalladas(token);
        setCompras(comprasDetalladas);
      } catch (e: any) {
        setError(e?.message || 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('authToken');
    if (!token) return;
    try {
      setLoading(true);
      const updated = await updateUserMe(token, form);
      // Update local UI with normalized fields
      setForm({ nombre: (updated as any).nombre || '', apellido: (updated as any).apellido || '', email: (updated as any).email || '', distrito: (updated as any).distrito || '' });
    } catch (e: any) {
      setError(e?.message || 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const role = (user as any)?.rol || (user as any)?.role || 'CLIENTE';
  const dni = (user as any)?.dni || (() => {
    try {
      const me = JSON.parse(localStorage.getItem('user') || '{}');
      return me?.dni;
    } catch {
      return localStorage.getItem('userDNI');
    }
  })() || localStorage.getItem('userDNI');

  return (
    <div className="page">
      <h1 className="text-2xl font-bold mb-3">Perfil de usuario</h1>
      {error && <div className="alert alert-info mb-3">{error}</div>}
      {loading ? (
        <div className="text-sm text-[var(--pv-muted)]">Cargando...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <h2 className="font-semibold mb-2">Mis datos</h2>
            <div className="text-sm text-[var(--pv-muted)]">Rol: {role}</div>
            <form className="mt-3 space-y-2" onSubmit={onSubmit}>
              <div>
                <label>DNI</label>
                <input name="dni" value={dni || ''} readOnly />
              </div>
              <div>
                <label>Nombre</label>
                <input name="nombre" value={form.nombre || ''} onChange={onChange} />
              </div>
              <div>
                <label>Apellido</label>
                <input name="apellido" value={form.apellido || ''} onChange={onChange} />
              </div>
              <div>
                <label>Email</label>
                <input name="email" type="email" value={form.email || ''} onChange={onChange} />
              </div>
              <div>
                <label>Distrito</label>
                <input name="distrito" value={form.distrito || ''} onChange={onChange} />
              </div>
              <button type="submit" disabled={isLoading || loading} className="px-4 py-2">Guardar</button>
            </form>
          </div>
          <div className="card">
            <h2 className="font-semibold mb-2">Historial de compras</h2>
            {(!compras || compras.length === 0) ? (
              <div className="text-sm text-[var(--pv-muted)]">Aún no has realizado ninguna compra.</div>
            ) : (
              <ul className="space-y-2">
                {compras.map((compra, idx) => {
                  const key = compra.id ?? idx;
                  const isOpen = !!expanded[key];
                  const fecha = compra.fecha ? new Date(compra.fecha).toLocaleString() : `Compra #${key}`;
                  return (
                    <li key={String(key)} className="border border-[var(--pv-border)] rounded-lg">
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 flex items-center justify-between"
                        onClick={() => setExpanded(prev => ({ ...prev, [key]: !isOpen }))}
                      >
                        <span className="font-medium">{fecha}</span>
                        <span className="text-sm text-[var(--pv-muted)]">{isOpen ? 'Ocultar' : 'Ver detalles'}</span>
                      </button>
                      {isOpen && (
                        <div className="px-3 pb-3">
                          <table>
                            <thead>
                              <tr>
                                <th>Producto</th>
                                <th>Cant.</th>
                                <th>P. Unit</th>
                                <th>Total</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const detalle: any[] = Array.isArray((compra as any).productos_detalle)
                                  ? (compra as any).productos_detalle
                                  : Array.isArray((compra as any).productos)
                                    ? (compra as any).productos.map((pid: any, idx: number) => ({
                                        producto_id: pid,
                                        nombre: `Producto ${pid}`,
                                        cantidad: ((compra as any).cantidades?.[idx]) ?? 1,
                                        precio: 0,
                                        requiere_receta: false,
                                      }))
                                    : [];
                                return detalle.map((p: any, i: number) => {
                                  const nombre = p.nombre || `ID ${p.producto_id || p.id || i}`;
                                  const cantidad = Number(p.cantidad ?? 0);
                                  const unit = Number((p.precio_unitario ?? p.precio ?? 0));
                                  const total = unit * cantidad;
                                  return (
                                    <tr key={i}>
                                      <td>{nombre}</td>
                                      <td>{isNaN(cantidad) ? '-' : cantidad}</td>
                                      <td>S/.{isNaN(unit) ? '0.00' : unit.toFixed(2)}</td>
                                      <td>S/.{isNaN(total) ? '0.00' : total.toFixed(2)}</td>
                                      <td>{p.requiere_receta ? <span title="Requiere receta">🧾</span> : null}</td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
