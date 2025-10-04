export const especialidades = [
  "Cardiología", "Pediatría", "Dermatología", "Neurología", "Oncología", "Ginecología",
  "Traumatología", "Oftalmología", "Endocrinología", "Psiquiatría", "Urología", "Otorrinolaringología",
  "Nefrología", "Neumología", "Gastroenterología", "Cirugía", "Reumatología", "Medicina Interna",
  "Infectología", "Radiología"
]

export const tipos_productos = [
  "Antibiotico",
  "Antiinflamatorio",
  "Antihistaminico",
  "Antimicotico",
  "Dermocosmetica",
  "Antigripal",
  "Analgesico",
  "Vitaminas",
  "Broncodilatador",
  "Antiacido"
]

export const UserRole = {
  CLIENTE: 'CLIENTE',
  ADMIN: 'ADMIN'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]
