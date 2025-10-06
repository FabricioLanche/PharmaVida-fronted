export interface RecetaProducto {
  id: number;
  nombre: string;
  cantidad: number;
}

export interface Recetas {
  pacientedni: string
  medicocmp: string
  fechaemision: string
  productos: RecetaProducto[]
  archivopdf: string
  estadovalidacion: string
}