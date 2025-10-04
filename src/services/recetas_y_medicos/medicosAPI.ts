import { API, apiGet, apiPost } from '../apiConfig'

const base = API.recetasMedicos

export function fetchMedicos() {
  return apiGet(`${base}/medicos`)
}

export function createMedico(payload: any) {
  return apiPost(`${base}/medicos`, payload)
}
