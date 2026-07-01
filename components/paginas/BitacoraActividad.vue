<script setup lang="ts">
import type { Actividad, ResultadoReporte, Tecnico } from './Reporte'

const props = defineProps<{
  actividades: Actividad[]
  resultado: ResultadoReporte
  tecnico: Tecnico
  fecha: string
  tipo: string
}>()

const fechaLegible = computed(() =>
  new Date(props.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
)

// El texto de resultado_reporte.estado lo escribe libremente el backend/técnico
// ("Aprobado", "Requiere Reemplazo", "Fuera de servicio"...), así que se clasifica
// por palabras clave en vez de esperar un enum cerrado.
// Clases completas y estáticas (no interpoladas) para que Tailwind
// las detecte en el build; interpolar "border-${color}-400" se pierde en purge.
const ESTILOS_RESULTADO = {
  amber: { color: 'warning' as const, icon: 'i-lucide-clock-alert', borde: 'border-amber-400' },
  rose: { color: 'error' as const, icon: 'i-lucide-circle-x', borde: 'border-rose-400' },
  emerald: { color: 'success' as const, icon: 'i-lucide-check-circle-2', borde: 'border-emerald-400' }
}

const resultadoMeta = computed(() => {
  const texto = props.resultado?.estado?.toLowerCase() || 'Sin estado'
  if (texto.includes('requiere') || texto.includes('pendiente')) return ESTILOS_RESULTADO.amber
  if (texto.includes('no') || texto.includes('inoperativo') || texto.includes('malo')) return ESTILOS_RESULTADO.rose
  return ESTILOS_RESULTADO.emerald
})
</script>

<template>
  <UCard >
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">Bitácora de la visita</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
            {{ tipo }} · {{ fechaLegible }}
          </p>
        </div>
        <UBadge :color="resultadoMeta.color"  variant="subtle" size="md">
          <UIcon :name="resultadoMeta.icon" class="mr-1 size-3.5" />
          {{ resultado?.estado || 'Sin estado' }}
        </UBadge>
      </div>
    </template>

    <div class="space-y-5">
      <!-- descripción de lo realizado -->
      <div v-for="act in actividades" :key="act.id" class="flex gap-3">
        <UIcon name="i-lucide-file-text" class="mt-0.5 size-4 shrink-0 text-neutral-400" />
        <p class="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
          {{ act.descripcion }}
        </p>
      </div>

      <!-- observación de cierre, si la hay -->
      <div
        v-if="resultado?.observacion"
        class="flex gap-3 rounded-lg border-l-2 pl-3"
        :class="resultadoMeta.borde"
      >
        <UIcon name="i-lucide-message-square-text" class="mt-0.5 size-4 shrink-0 text-neutral-400" />
        <p class="text-sm italic leading-relaxed text-neutral-500 dark:text-neutral-400">
          {{ resultado?.observacion }}
        </p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
        <UIcon name="i-lucide-user-round" class="size-3.5" />
        Realizado por <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ tecnico.nombre }}</span>
      </div>
    </template>
  </UCard>
</template>