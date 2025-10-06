import { apiGet } from '../apiConfig';

const ORQ_API_URL = import.meta.env.VITE_API_ORQUESTADOR || '';

export interface CompraProductoDetalle {
  id?: number | string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  requiere_receta?: boolean;
}

export async function validateRecetaOrchestrator(token: string, recetaId: string): Promise<any> {
  if (!ORQ_API_URL) throw new Error('VITE_API_ORQUESTADOR no configurado');
  const url = `${ORQ_API_URL}/orchestrator/recetas/validar/${encodeURIComponent(recetaId)}`;
  const dni = localStorage.getItem('userDNI') || '';
  const body = { estado: 'validada', datos_adicionales: dni ? { dni } : {} };
  console.log('[validateRecetaOrchestrator] PUT', url, 'body:', body);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let errorData: any = text;
    try { errorData = JSON.parse(text); } catch {}
    throw new Error(`PUT ${url} failed: ${res.status} ${JSON.stringify(errorData)}`);
  }
  return res.json();
}

export interface CompraDetallada {
  id?: number | string;
  fecha?: string;
  total?: number;
  productos: CompraProductoDetalle[];
}

export interface ComprasDetalladasResponse {
  compras: CompraDetallada[];
}

export async function getMisComprasDetalladas(token: string): Promise<CompraDetallada[]> {
  if (!ORQ_API_URL) throw new Error('VITE_API_ORQUESTADOR no configurado');
  const url = `${ORQ_API_URL}/orchestrator/compras/me`;
  console.log('[getMisComprasDetalladas] GET', url);
  const res = await apiGet<any>(url, { headers: { Authorization: `Bearer ${token}` } });
  if (Array.isArray(res)) return res as CompraDetallada[];
  if (res && Array.isArray(res.compras)) return res.compras as CompraDetallada[];
  if (res && Array.isArray(res.results)) return res.results as CompraDetallada[];
  return [];
}

export interface RegistrarCompraPayload {
  productos: number[];
  cantidades: number[];
  dni: string;
  datos_adicionales?: Record<string, any>;
}

export async function registerCompraOrquestada(token: string, payload: RegistrarCompraPayload): Promise<any> {
  if (!ORQ_API_URL) throw new Error('VITE_API_ORQUESTADOR no configurado');
  const url = `${ORQ_API_URL}/orchestrator/compras`;
  console.log('[registerCompraOrquestada] POST', url);
  
  // Preparar el payload asegurando que el DNI esté en ambos lugares para compatibilidad
  const body = {
    productos: payload.productos,
    cantidades: payload.cantidades,
    datos_adicionales: {
      ...(payload.datos_adicionales || {}),
      dni: payload.dni, // Asegurar que DNI esté en datos_adicionales
    },
  };
  
  console.log('[registerCompraOrquestada] Enviando payload:', JSON.stringify(body, null, 2));
  
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch {
      errorData = { error: text };
    }
    throw new Error(`POST ${url} failed: ${res.status} ${JSON.stringify(errorData)}`);
  }
  return res.json();
}