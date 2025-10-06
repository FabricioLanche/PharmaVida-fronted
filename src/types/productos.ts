// Se restaura la definición de tipos original.
export interface Producto {
  id: number;
  nombre: string;
  tipo: string;
  precio: number;
  stock: number;
  requiere_receta: boolean; // <-- Usar booleano para facilidad en frontend
  descripcion: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Productos {
  id: number
  nombre: string
  tipo: string
  precio: number
  stock: number
  requiere_receta: number
  fecha_creacion: string
  fecha_actualizacion: string
}