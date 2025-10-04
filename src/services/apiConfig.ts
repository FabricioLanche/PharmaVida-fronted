export const API = {
  usuariosCompras: import.meta.env.VITE_API_USUARIOS_COMPRAS || '',
  productosOfertas: import.meta.env.VITE_API_PRODUCTOS_OFERTAS || '',
  recetasMedicos: import.meta.env.VITE_API_RECETAS_MEDICOS || '',
  analitica: import.meta.env.VITE_API_ANALITICA || '',
  orquestador: import.meta.env.VITE_API_ORQUESTADOR || ''
}

export async function apiGet<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, ...init })
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return res.json()
}

export async function apiPost<T>(url: string, body: any, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...init })
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`)
  return res.json()
}
