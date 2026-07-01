// composables/useEstadoSalud.ts
// Centraliza cómo se traduce un estado ('bueno' | 'regular' | 'malo' | cualquier
// variante de mayúsculas que llegue del backend) a color, texto e ícono.
// Usarlo en un solo lugar evita que cada componente invente su propia paleta.

import type { EstadoSalud } from './Reporte'

export interface EstadoMeta {
  label: string
  dot: string        // color sólido para puntos/pines
  text: string        // color de texto
  bg: string           // fondo suave para tarjetas/badges
  border: string      // borde a juego con el fondo suave
  ring: string         // anillo de foco/hover
  icon: string          // ícono lucide (i-lucide-*)
}

const MAPA: Record<EstadoSalud, EstadoMeta> = {
  bueno: {
    label: 'Bueno',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-200 dark:border-emerald-900',
    ring: 'ring-emerald-400/40',
    icon: 'i-lucide-check-circle-2'
  },
  regular: {
    label: 'Regular',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-200 dark:border-amber-900',
    ring: 'ring-amber-400/40',
    icon: 'i-lucide-alert-triangle'
  },
  malo: {
    label: 'Requiere atención',
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-200 dark:border-rose-900',
    ring: 'ring-rose-400/40',
    icon: 'i-lucide-circle-x'
  }
}

const DESCONOCIDO: EstadoMeta = {
  label: 'Sin evaluar',
  dot: 'bg-neutral-400',
  text: 'text-neutral-600 dark:text-neutral-400',
  bg: 'bg-neutral-50 dark:bg-neutral-900',
  border: 'border-neutral-200 dark:border-neutral-800',
  ring: 'ring-neutral-400/40',
  icon: 'i-lucide-help-circle'
}

export function useEstadoSalud() {
  function meta(estado: string | null | undefined): EstadoMeta {
    if (!estado) return DESCONOCIDO
    const key = estado.toLowerCase().trim() as EstadoSalud
    return MAPA[key] ?? DESCONOCIDO
  }

  // Resume una lista de estado_componente en conteos, útil para un encabezado
  // tipo "9 bien, 2 regular, 2 requieren atención".
  function resumen(items: { estado: string }[]) {
    const conteo = { bueno: 0, regular: 0, malo: 0, otros: 0 }
    for (const item of items) {
      const key = item.estado?.toLowerCase().trim()
      if (key === 'bueno' || key === 'regular' || key === 'malo') conteo[key]++
      else conteo.otros++
    }
    return conteo
  }

  return { meta, resumen }
}