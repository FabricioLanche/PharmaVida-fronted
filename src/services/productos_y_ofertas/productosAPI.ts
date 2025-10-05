import { apiGet } from "../apiConfig";
import { type Producto } from "../../types/productos";

const PRODUCTOS_API_URL = import.meta.env.VITE_API_PRODUCTOS_OFERTAS;

export async function searchProducts(query: string): Promise<Producto[]> {
    // Lógica de búsqueda original
    console.log("Buscando productos con:", query);
    return [];
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
