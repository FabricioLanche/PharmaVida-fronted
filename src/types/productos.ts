// Se restaura la definición de tipos original.
export interface Producto {
  id: number;
  nombre: string;
  // Otros campos que existieran previamente.
  precio: number;
  descripcion: string;
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