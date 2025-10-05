import { apiGet } from "../apiConfig";
import { Producto } from "../../types/productos";

const PRODUCTOS_API_URL = import.meta.env.VITE_API_PRODUCTOS_OFERTAS;

export async function searchProducts(query: string): Promise<Producto[]> {
    // Lógica de búsqueda original
    console.log("Buscando productos con:", query);
    return []; 
}