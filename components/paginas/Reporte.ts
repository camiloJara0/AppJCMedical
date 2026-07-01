// types/reporte.ts
// Tipos que reflejan la forma en que la API entrega un reporte de mantenimiento.
// Ajusta los campos opcionales (?) según lo que tu backend garantice siempre.

export type EstadoSalud = 'bueno' | 'regular' | 'malo'

export interface Componente {
  id: number
  nombre: string
  sistema_id: number
  estado?: string
}

export interface EstadoComponente {
  id: number
  reporte_id: number
  componente_id: number
  estado: EstadoSalud
  observacion: string | null
  componente: Componente
}

export interface Actividad {
  id: number
  reporte_id: number
  descripcion: string
}

export interface Accesorio {
  id: number
  reporte_id: number
  nombre: string
  estado: string
}

export interface Repuesto {
  id: number
  reporte_id: number
  nombre: string
}

export interface Material {
  id: number
  reporte_id: number
  nombre: string
  cantidad?: number
  unidad?: string
}

export interface Medicion {
  id: number
  reporte_id: number
  nombre: string
  valor?: string | number
  unidad?: string
}

export interface Cliente {
  id: number
  nombre: string
  correo?: string
  telefono?: string
}

export interface Equipo {
  id: number
  nombre: string
  marca: string
  modelo: string
  serie: string
  placa: string
  ubicacion: string
  registro_sanitario?: string
}

export interface Tecnico {
  id: number
  nombre: string
  telefono?: string
  sello?: string
}

export interface ResultadoReporte {
  id: number
  estado: string
  observacion: string | null
}

export interface FirmaRecibido {
  id: number
  nombre: string
  cargo: string
  firma: string
}

export interface Reporte {
  id: number
  fecha: string
  tipo: string
  estado: string
  cliente: Cliente
  equipo: Equipo
  tecnico: Tecnico
  actividades: Actividad[]
  estado_componente: EstadoComponente[]
  accesorios: Accesorio[]
  repuestos: Repuesto[]
  materiales: Material[]
  mediciones: Medicion[]
  resultado_reporte: ResultadoReporte
  firma_recibido?: FirmaRecibido
}