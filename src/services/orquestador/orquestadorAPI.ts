import { API, apiGet, apiPost } from '../apiConfig'

const base = API.orquestador

export function callOrquestador(path: string, payload?: any) {
  if (payload) return apiPost(`${base}/${path}`, payload)
  return apiGet(`${base}/${path}`)
}
