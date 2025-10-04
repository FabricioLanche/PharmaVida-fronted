import { API, apiGet, apiPost } from '../apiConfig'

const base = API.productosOfertas

export function fetchOfertas() {
  return apiGet(`${base}/ofertas`)
}

export function createOferta(payload: any) {
  return apiPost(`${base}/ofertas`, payload)
}
