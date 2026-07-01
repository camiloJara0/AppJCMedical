<script setup lang="ts">
import type { Accesorio, Material, Repuesto } from './Reporte'

const props = defineProps<{
  repuestos: Repuesto[]
  materiales: Material[]
  accesorios: Accesorio[]
}>()

const grupos = computed(() => [
  {
    id: 'repuestos',
    titulo: 'Repuestos instalados',
    icono: 'i-lucide-wrench',
    items: props.repuestos.map((r) => ({ id: r.id, nombre: r.nombre, detalle: null as string | null }))
  },
  {
    id: 'materiales',
    titulo: 'Materiales usados',
    icono: 'i-lucide-box',
    items: props.materiales.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      detalle: m.cantidad ? `${m.cantidad} ${m.unidad ?? ''}`.trim() : null
    }))
  },
  {
    id: 'accesorios',
    titulo: 'Accesorios revisados',
    icono: 'i-lucide-package',
    items: props.accesorios.map((a) => ({ id: a.id, nombre: a.nombre, detalle: a.estado }))
  }
])

const hayContenido = computed(() => grupos.value.some((g) => g.items.length > 0))
</script>

<template>
  <UCard >
    <template #header>
      <div>
        <h3 class="text-sm font-semibold text-neutral-900 dark:text-white">Mesa de trabajo</h3>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          Lo que el técnico usó o revisó durante la visita
        </p>
      </div>
    </template>

    <div v-if="hayContenido" class="space-y-5">
      <div v-for="grupo in grupos" :key="grupo.id" v-show="grupo.items.length > 0">
        <div class="mb-2 flex items-center gap-1.5">
          <UIcon :name="grupo.icono" class="size-4 text-neutral-400" />
          <h4 class="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {{ grupo.titulo }}
          </h4>
          <span class="text-xs text-neutral-400">({{ grupo.items.length }})</span>
        </div>
        <ul class="divide-y divide-neutral-100 rounded-lg border border-neutral-100 dark:divide-neutral-800 dark:border-neutral-800">
          <li
            v-for="item in grupo.items"
            :key="item.id"
            class="flex items-center justify-between gap-3 px-3 py-2 text-sm"
          >
            <span class="text-neutral-700 dark:text-neutral-200">{{ item.nombre }}</span>
            <UBadge v-if="item.detalle" color="neutral" variant="subtle" size="xs">
              {{ item.detalle }}
            </UBadge>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
      <UIcon name="i-lucide-clipboard-x" class="size-6 text-neutral-300 dark:text-neutral-700" />
      <p class="text-sm text-neutral-500 dark:text-neutral-400">
        No se registraron repuestos, materiales ni accesorios en esta visita.
      </p>
    </div>
  </UCard>
</template>