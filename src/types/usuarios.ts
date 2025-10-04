export interface Usuarios {
  id: number
  dni: number
  apellido: string
  distrito: string
  email: string
  nombre: string
  role: 'CLIENTE' | 'ADMIN'
}
