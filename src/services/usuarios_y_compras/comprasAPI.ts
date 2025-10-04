import { API, apiGet, apiPost } from '../apiConfig'

const base = API.usuariosCompras

export function fetchCompras() {
  return apiGet(`${base}/compras`)
}

export function createCompra(payload: any) {
  return apiPost(`${base}/compras`, payload)
}
