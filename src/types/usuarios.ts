export interface User {
  id: number
  dni: number
  apellido: string
  distrito: string
  email: string
  nombre: string
  role: 'CLIENTE' | 'ADMIN'
}
