import { API, apiGet, apiPost } from '../apiConfig'

const base = API.recetasMedicos

export function fetchRecetas() {
  return apiGet(`${base}/recetas`)
}

export function createReceta(payload: any) {
  return apiPost(`${base}/recetas`, payload)
}
