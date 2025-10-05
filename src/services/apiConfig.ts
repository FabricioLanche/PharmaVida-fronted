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

export async function apiPut<T>(url: string, body: any, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), ...init })
  if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`)
  return res.json()
}

export async function apiPostFormData<T>(url: string, body: FormData, init?: RequestInit): Promise<T> {
  // When using FormData, the 'Content-Type' header should typically be omitted
  // as the browser will set it to 'multipart/form-data' with the correct boundary.
  const { headers, ...restInit } = init || {};

  const fetchHeaders = new Headers(headers);
  fetchHeaders.delete('Content-Type');

  const res = await fetch(url, { method: 'POST', body: body, headers: fetchHeaders, ...restInit });

  if (!res.ok) {
    // Attempt to get more specific error message from response body if available
    let errorDetails = `POST ${url} failed with status: ${res.status}`;
    try {
      // Try to parse JSON response for error details
      const errorData = await res.json();
      if (errorData && errorData.message) {
        errorDetails = `POST ${url} failed: ${errorData.message} (Status: ${res.status})`;
      } else if (typeof errorData === 'string') {
        errorDetails = `POST ${url} failed: ${errorData} (Status: ${res.status})`;
      } else {
        // If JSON is not a string or object with message, use status text
        errorDetails = `POST ${url} failed: ${res.statusText} (Status: ${res.status})`;
      }
    } catch (e) {
      // If response is not JSON, use the status text
      errorDetails = `POST ${url} failed: ${res.statusText} (Status: ${res.status})`;
    }
    throw new Error(errorDetails);
  }
  // Handle cases where the response might be empty or not JSON
  const text = await res.text();
  if (!text) {
    return {} as T; // Return empty object if response is empty
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    // If parsing fails, it might be a non-JSON response, return as is or throw
    // For now, assuming successful non-JSON response is unlikely for API POST, but good to handle.
    // If the API is expected to return non-JSON on success, this part needs adjustment.
    // For now, we'll assume success means JSON.
    throw new Error(`Failed to parse JSON response from ${url}: ${e}`);
  }
}