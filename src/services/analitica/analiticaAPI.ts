import { API, apiGet } from '../apiConfig'

const base = API.analitica

export function fetchAnalitica(path: string) {
  return apiGet(`${base}/${path}`)
}
