import { API, apiGet, apiPost, apiPostFormData } from '../apiConfig' // Import apiPostFormData

const base = API.recetasMedicos

export function fetchRecetas() {
  return apiGet(`${base}/recetas`)
}

export function createReceta(payload: any) {
  return apiPost(`${base}/recetas`, payload)
}

// New function to handle prescription uploads
export async function uploadPrescription(formData: FormData) {
  // The base URL is already defined as API.recetasMedicos
  // The endpoint for upload is '/api/recetas/upload'
  // We use apiPostFormData to correctly handle FormData uploads
  return apiPostFormData(`${base}/recetas/upload`, formData);
}