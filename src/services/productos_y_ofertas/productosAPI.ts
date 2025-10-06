import { apiGet } from "../apiConfig";
import { type Producto } from "../../types/productos";

const PRODUCTOS_API_URL = import.meta.env.VITE_API_PRODUCTOS_OFERTAS;

export interface ProductosPaginadosResponse {
  total: number;
  page: number;
  pagesize: number;
  productos: Producto[];
}

// Llamado unificado a /productos/paged con filtros combinados (si backend lo soporta)
export async function listarFiltrado(options: {
  nombre?: string;
  tipo?: string;
  requiere_receta?: boolean;
  minimo?: number; // stock mínimo
  page?: number;
  pagesize?: number;
}): Promise<ProductosPaginadosResponse> {
  const params = new URLSearchParams();
  const page = options.page ?? 1;
  const pagesize = options.pagesize ?? 25;
  params.set('page', String(page));
  params.set('pagesize', String(pagesize));
  if (options.nombre && options.nombre.trim()) params.set('nombre', options.nombre.trim());
  if (options.tipo && options.tipo.trim()) params.set('tipo', options.tipo.trim());
  if (typeof options.requiere_receta === 'boolean') params.set('requiere_receta', String(options.requiere_receta));
  if (typeof options.minimo === 'number') params.set('minimo', String(options.minimo));
  const url = `${PRODUCTOS_API_URL}/productos/paged?${params.toString()}`;
  const res = await apiGet<ProductosPaginadosResponse>(url);
  return normalizePagedResponse(res);
}

export async function fetchProductos(page = 1, pagesize = 25): Promise<Producto[]> {
  try {
    const res = await apiGet<any>(`${PRODUCTOS_API_URL}/productos/paged?page=${page}&pagesize=${pagesize}`);
    // Backend devuelve { total, page, pagesize, productos: Producto[] }
    if (Array.isArray(res)) return res as Producto[];
    if (res && Array.isArray(res.productos)) return res.productos as Producto[];
    // Si por alguna razón no cumple el contrato, devolver arreglo vacío para evitar .map error
    return [];
  } catch (e) {
    // Fallback: probar listar productos que no requieren receta como muestra
    try {
      const alt = await apiGet<any>(`${PRODUCTOS_API_URL}/productos/receta?requiere_receta=false&page=${page}&pagesize=${pagesize}`);
      if (alt && Array.isArray(alt.productos)) return alt.productos as Producto[];
    } catch (_) {
      // Ignorar, retornaremos arreglo vacío
    }
    return [];
  }
}

export async function fetchProductosPorReceta(requiere_receta: boolean, page = 1, pagesize = 25): Promise<Producto[]> {
  const res = await apiGet<any>(`${PRODUCTOS_API_URL}/productos/receta?requiere_receta=${requiere_receta}&page=${page}&pagesize=${pagesize}`);
  return Array.isArray(res?.productos) ? (res.productos as Producto[]) : [];
}

// Nuevos helpers paginados
export async function searchProductosPorNombre(nombre: string, page = 1, pagesize = 25): Promise<ProductosPaginadosResponse> {
  const res = await apiGet<ProductosPaginadosResponse>(`${PRODUCTOS_API_URL}/productos/nombre?nombre=${encodeURIComponent(nombre)}&page=${page}&pagesize=${pagesize}`);
  return normalizePagedResponse(res);
}

export async function listarProductosPaginado(page = 1, pagesize = 25): Promise<ProductosPaginadosResponse> {
  const res = await apiGet<ProductosPaginadosResponse>(`${PRODUCTOS_API_URL}/productos/paged?page=${page}&pagesize=${pagesize}`);
  return normalizePagedResponse(res);
}

export async function listarPorTipo(tipo: string, page = 1, pagesize = 25): Promise<ProductosPaginadosResponse> {
  const res = await apiGet<ProductosPaginadosResponse>(`${PRODUCTOS_API_URL}/productos/tipo?tipo=${encodeURIComponent(tipo)}&page=${page}&pagesize=${pagesize}`);
  return normalizePagedResponse(res);
}

export async function listarStockBajo(minimo = 10, page = 1, pagesize = 25): Promise<ProductosPaginadosResponse> {
  const res = await apiGet<ProductosPaginadosResponse>(`${PRODUCTOS_API_URL}/productos/stock-bajo?minimo=${minimo}&page=${page}&pagesize=${pagesize}`);
  return normalizePagedResponse(res);
}

export async function listarPorReceta(requiere_receta: boolean, page = 1, pagesize = 25): Promise<ProductosPaginadosResponse> {
  const res = await apiGet<ProductosPaginadosResponse>(`${PRODUCTOS_API_URL}/productos/receta?requiere_receta=${requiere_receta}&page=${page}&pagesize=${pagesize}`);
  return normalizePagedResponse(res);
}

function normalizePagedResponse(res: any): ProductosPaginadosResponse {
  if (Array.isArray(res)) {
    return { total: res.length, page: 1, pagesize: res.length, productos: res as Producto[] };
  }
  if (res && Array.isArray(res.productos)) {
    return res as ProductosPaginadosResponse;
  }
  return { total: 0, page: 1, pagesize: 25, productos: [] };
}
