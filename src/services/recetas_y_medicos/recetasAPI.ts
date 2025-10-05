import { API, apiGet, apiPost, apiPostFormData, apiPut } from '../apiConfig'; // Import apiPut

const base = API.recetasMedicos;

export function fetchRecetas() {
  return apiGet(`${base}/recetas`);
}

export function createReceta(payload: any) {
  return apiPost(`${base}/recetas`, payload);
}

// Tipos alineados con el backend Node (recetas_cloud)
export interface RecetaProducto {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface RecetaDTO {
  _id: string;
  pacienteDNI: string;
  medicoCMP: string;
  fechaEmision: string;
  productos: RecetaProducto[];
  archivoPDF?: string;
  estadoValidacion: 'pendiente' | 'validada' | 'rechazada';
}

export interface UploadPrescriptionResponse {
  mensaje: string;
  receta: RecetaDTO;
}

export interface ValidatePrescriptionResponse {
  mensaje: string;
  receta: RecetaDTO;
}

// Subir receta (solo PDF) -> backend extrae campos
export async function uploadPrescription(formData: FormData): Promise<UploadPrescriptionResponse> {
  return apiPostFormData<UploadPrescriptionResponse>(`${base}/recetas/upload`, formData);
}

// Validar receta por ID (PUT /recetas/:id/validar)
export async function validatePrescription(prescriptionId: string): Promise<ValidatePrescriptionResponse> {
  return apiPut<ValidatePrescriptionResponse>(`${base}/recetas/${prescriptionId}/validar`, {});
}

// Obtener receta por ID
export async function getPrescriptionById(prescriptionId: string): Promise<RecetaDTO> {
  return apiGet<RecetaDTO>(`${base}/recetas/${prescriptionId}`);
}
