import { API, apiGet } from '../apiConfig'

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/$/, '')
  const p = path.replace(/^\//, '')
  return `${b}/${p}`
}

export async function fetchAnalitica(path: string): Promise<any[]> {
  const base = API.analitica
  if (!base) throw new Error('VITE_API_ANALITICA no configurado')
  const url = joinUrl(base, path)
  const res = await apiGet<any>(url)
  if (Array.isArray(res)) return res
  if (res && Array.isArray(res.data)) return res.data
  if (res && Array.isArray(res.items)) return res.items
  return []
}

export async function fetchAnaliticaRaw(path: string): Promise<any> {
  const base = API.analitica
  if (!base) throw new Error('VITE_API_ANALITICA no configurado')
  const url = joinUrl(base, path)
  return apiGet<any>(url)
}
