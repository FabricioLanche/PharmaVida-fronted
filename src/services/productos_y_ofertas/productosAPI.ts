import { API, apiGet, apiPost } from '../apiConfig'

const base = API.productosOfertas

export function fetchProductos() {
  return apiGet(`${base}/productos`)
}

export function createProducto(payload: any) {
  return apiPost(`${base}/productos`, payload)
}
