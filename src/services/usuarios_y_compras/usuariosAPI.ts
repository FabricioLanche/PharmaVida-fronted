import { API, apiGet, apiPost } from '../apiConfig'

const base = API.usuariosCompras

export function fetchUsuarios() {
  return apiGet(`${base}/usuarios`)
}

export function createUsuario(payload: any) {
  return apiPost(`${base}/usuarios`, payload)
}
