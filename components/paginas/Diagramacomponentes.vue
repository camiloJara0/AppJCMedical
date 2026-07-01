<script setup lang="ts">
import type { EstadoComponente } from './Reporte'
import { useEstadoSalud } from './useEstadoSalud';

const props = defineProps<{
  componentes: EstadoComponente[]
  nombreEquipo?: string
}>()

const { meta, resumen } = useEstadoSalud()

const total = computed(() => props.componentes.length)
const conteo = computed(() => resumen(props.componentes))

// Distribuye cada componente en un círculo alrededor del equipo.
// Coordenadas en % del contenedor (0-100) para que el layout sea fluido
// sin necesitar medir el tamaño real del recuadro con JS.
const RADIO = 40
const pines = computed(() =>
  props.componentes.map((c, i) => {
    const angulo = (i / Math.max(total.value, 1)) * 2 * Math.PI - Math.PI / 2
    const x = 50 + RADIO * Math.cos(angulo)
    const y = 50 + RADIO * Math.sin(angulo)
    return {
      ...c,
      x,
      y,
      // si el pin cae en la mitad superior, la tarjeta de detalle se abre
      // hacia abajo para no salirse del contenedor
      abajo: y < 42
    }
  })
)

const activoId = ref<number | null>(null)
function activar(id: number) {
  activoId.value = id
}
function desactivar(id: number) {
  if (activoId.value === id) activoId.value = null
}
function alternar(id: number) {
  activoId.value = activoId.value === id ? null : id
}

const MAPA_ICONOS: Record<string, string> = {
  monitor: 'i-lucide-monitor',
  ventilador: 'i-lucide-wind',
  desfibrilador: 'i-lucide-zap',
  incubadora: 'i-lucide-baby',
  'bomba de infusión': 'i-lucide-droplet',
  ecografo: 'i-lucide-radar',
  'rayos x': 'i-lucide-scan-line',
  electrocardiografo: 'i-lucide-heart-pulse',
  esterilizador: 'i-lucide-flame',
}


function icono(nombreEquipo: string) {
    const clave = Object.keys(MAPA_ICONOS).find((k) =>
      nombreEquipo.toLowerCase().includes(k)
    )
    return clave ? MAPA_ICONOS[clave] : 'i-lucide-hospital' // genérico si no matchea nada
}
</script>

<template>
  <UCard >
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <div>
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">
            Estado del equipo por componente
          </h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">
            {{ nombreEquipo ?? 'Equipo' }} · {{ total }} componente{{ total === 1 ? '' : 's' }} evaluados
          </p>
        </div>
        <div class="hidden sm:flex items-center gap-3 text-xs">
          <span class="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <span class="size-2 rounded-full bg-emerald-500" /> {{ conteo.bueno }}
          </span>
          <span class="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <span class="size-2 rounded-full bg-amber-500" /> {{ conteo.regular }}
          </span>
          <span class="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <span class="size-2 rounded-full bg-rose-500" /> {{ conteo.malo }}
          </span>
        </div>
      </div>
    </template>

    <!-- Diagrama orbital: desde md hacia arriba -->
    <div class="hidden md:block">
      <div class="relative mx-auto aspect-square w-full max-w-105">
        <!-- líneas guía tipo plano técnico, en coordenadas 0-100 -->
        <svg
          class="absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <line
            v-for="p in pines"
            :key="'linea-' + p.id"
            x1="50"
            y1="50"
            :x2="p.x"
            :y2="p.y"
            class="stroke-neutral-300 dark:stroke-neutral-700"
            stroke-width="0.4"
            stroke-dasharray="1.6 1.6"
          />
        </svg>

        <!-- silueta genérica del equipo, en el centro -->
        <div
          class="absolute left-1/2 top-1/2 flex size-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <UIcon :name="icono(nombreEquipo ?? '')" class="size-7 text-neutral-400 dark:text-neutral-500" />
          <span class="max-w-20 truncate text-center text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
            {{ nombreEquipo ?? 'Equipo' }}
          </span>
        </div>

        <!-- un pin por componente -->
        <div
          v-for="p in pines"
          :key="p.id"
          class="absolute z-10"
          :style="{ left: p.x + '%', top: p.y + '%', transform: 'translate(-50%, -50%)' }"
          @mouseenter="activar(p.id)"
          @mouseleave="desactivar(p.id)"
        >
          <button
            type="button"
            class="group relative z-1 flex size-6 items-center justify-center rounded-full ring-4 ring-white transition hover:scale-110 focus:outline-none focus-visible:scale-110 dark:ring-neutral-900"
            :class="meta(p.estado).dot"
            @click="alternar(p.id)"
            @focus="activar(p.id)"
            @blur="desactivar(p.id)"
            :aria-label="`${p.componente.nombre}: ${meta(p.estado).label}`"
          >
            <span class="sr-only">{{ p.componente.nombre }}</span>
          </button>

          <!-- tarjeta de detalle: nombre, estado y observación -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <div
              v-if="activoId === p.id"
              class="absolute left-1/2 z-50 w-52 -translate-x-1/2 rounded-lg border bg-white p-3 text-left shadow-lg dark:bg-neutral-900"
              :class="[meta(p.estado).border, p.abajo ? 'top-full mt-2' : 'bottom-full mb-2']"
            >
              <div class="flex items-center gap-1.5">
                <UIcon :name="meta(p.estado).icon" class="size-3.5" :class="meta(p.estado).text" />
                <span class="text-xs font-semibold" :class="meta(p.estado).text">
                  {{ meta(p.estado).label }}
                </span>
              </div>
              <p class="mt-1 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                {{ p.componente.nombre }}
              </p>
              <p class="mt-1 text-xs leading-snug text-neutral-500 dark:text-neutral-400">
                {{ p.observacion ?? 'Sin observaciones registradas.' }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Alternativa en móvil: lista táctil en vez de órbita apretada -->
    <div class="grid grid-cols-1 gap-2 md:hidden">
      <button
        v-for="p in pines"
        :key="'m-' + p.id"
        type="button"
        class="flex items-start gap-3 rounded-lg border p-3 text-left transition"
        :class="[meta(p.estado).border, activoId === p.id ? meta(p.estado).bg : 'bg-white dark:bg-neutral-900']"
        @click="alternar(p.id)"
      >
        <span class="mt-1 size-2.5 shrink-0 rounded-full" :class="meta(p.estado).dot" />
        <span class="flex-1">
          <span class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {{ p.componente.nombre }}
            </span>
            <span class="text-xs font-medium" :class="meta(p.estado).text">
              {{ meta(p.estado).label }}
            </span>
          </span>
          <span
            v-if="activoId === p.id"
            class="mt-1 block text-xs leading-snug text-neutral-500 dark:text-neutral-400"
          >
            {{ p.observacion ?? 'Sin observaciones registradas.' }}
          </span>
        </span>
      </button>
    </div>

    <template #footer>
      <p class="text-xs text-neutral-400 dark:text-neutral-500">
        Pasa el cursor (o toca en móvil) sobre un punto para ver su observación.
      </p>
    </template>
  </UCard>
</template>