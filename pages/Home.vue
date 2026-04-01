<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';

import { onMounted, ref } from 'vue';
import { ca } from '@nuxt/ui/runtime/locale/index.js';

const varView = useVarView()
const apiRest = useApiRest()
const showCita = ref(false)
const refresh = ref(1)
const footer = useSeccionFooter();

watch(() => showCita.value,
    async (estado) => {
        if (!estado) {
            varView.cargando = true
            const apiRest = useApiRest()
            await apiRest.getData('Cita', 'citas')
            refresh.value++
            varView.cargando = false
        }
    }
);

onMounted(async () => {
    varView.cargando = true;
    sessionStorage.removeItem('activeButton');
    sessionStorage.removeItem('seccionIdActivo')
    footer.cambiarSecciones([]);
    varView.cargando = false;
});

const chartData = [
  {
    Fecha: 'Ene',
    numero: 12
  },
  {
    Fecha: 'Feb',
    numero: 19
  },
  {
    Fecha: 'Mar',
    numero: 8
  },
  {
    Fecha: 'Abr',
    numero: 15
  },
  {
    Fecha: 'May',
    numero: 10
  },
  {
    Fecha: 'Jun',
    numero: 14
  }
]

const categories = {
  fechas: {name: 'Fecha', color: '#3b82f6'},
  numero: {name: 'numero', color: '#ef4444'}
}

const xFormatter = (i) => categories[i]

const estadoCategories = {
  estado: {name: 'Estado', color: '#3b82f6'},
  cantidad: {name: 'Cantidad', color: '#ef4444'}
}

const estadoData = [
  {
    estado: 'Operativos',
    cantidad: 80
  },
  {
    estado: 'En Mantenimiento',
    cantidad: 30
  },
  {
    estado: 'Fuera de Servicio',
    cantidad: 18
  }
]

const columns = [
  { accessorKey: 'equipo', header: 'equipo' },
  { accessorKey: 'tipo', header: 'tipo' },
  { accessorKey: 'estado', header: 'estado' },
  { accessorKey: 'fecha', header: 'fecha' }
]

const rows = [
  { equipo: 'Monitor Cardíaco', tipo: 'Diagnóstico', estado: 'Operativo', fecha: '2026-03-20' },
  { equipo: 'Ventilador', tipo: 'Soporte Vital', estado: 'Mantenimiento', fecha: '2026-03-18' },
  { equipo: 'Rayos X', tipo: 'Imagenología', estado: 'Fuera de Servicio', fecha: '2026-03-15' }
]

</script>

<template>

    <FondoDefault>
<!-- Header -->
<div class="relative mx-3 min-h-40 rounded-xl bg-cover bg-center flex items-center justify-center"
     style="background-image: url('public/headerLogin.jpg');">

    <!-- Overlay -->
    <span class="absolute inset-0 rounded-xl bg-linear-to-br from-blue-800/80 to-black/60"></span>

    <!-- Content -->
    <div class="relative text-center text-white px-4">
        <h1 class="text-3xl font-bold mb-2">Bienvenido, Administrador</h1>
        <p class="text-lg">Modulo de control de la aplicación</p>
    </div>
</div>

  <div class="p-6 space-y-6 dark:text-gray-50 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard Biomédico</h1>
        <p class="text-sm text-gray-500 dark:text-gray-300">Gestión de inventario, cotizaciones y mantenimientos</p>
      </div>
      <UButton color="primary" label="Nueva Cotización" />
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <div class="flex justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-300">Equipos Totales</p>
            <h2 class="text-2xl font-bold">128</h2>
          </div>
          <UIcon name="i-heroicons-cpu-chip" class="text-primary text-3xl" />
        </div>
      </UCard>

      <UCard>
        <div class="flex justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-300">Mantenimientos Pendientes</p>
            <h2 class="text-2xl font-bold text-warning">23</h2>
          </div>
          <UIcon name="i-heroicons-wrench-screwdriver" class="text-warning text-3xl" />
        </div>
      </UCard>

      <UCard>
        <div class="flex justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-300">Cotizaciones Activas</p>
            <h2 class="text-2xl font-bold text-info">15</h2>
          </div>
          <UIcon name="i-heroicons-document-text" class="text-info text-3xl" />
        </div>
      </UCard>

      <UCard>
        <div class="flex justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-300">Equipos Críticos</p>
            <h2 class="text-2xl font-bold text-danger">5</h2>
          </div>
          <UIcon name="i-heroicons-exclamation-triangle" class="text-danger text-3xl" />
        </div>
      </UCard>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <UCard>
        <h3 class="font-semibold mb-4">Mantenimientos por Mes</h3>
        <LineChart
          :data="chartData"
          :height="300"
          y-label="Mantenimientos"
          :x-num-ticks="6"
          :y-num-ticks="4"
          :categories="categories"
          :x-formatter="xFormatter"
          :y-grid-line="true"
          :curve-type="CurveType.Linear"
          :legend-position="LegendPosition.TopRight"
          :hide-legend="false"
        />
      </UCard>

      <UCard>
        <h3 class="font-semibold mb-4">Estado de Equipos</h3>
        <BarChart
          :data="estadoData"
          :height="300"
          y-label="Cantidad"
          :categories="estadoCategories"
          :y-axis="['cantidad']"
          :radius="4"
        />
      </UCard>
    </div>

    <!-- Table Section -->
    <UCard>
      <div class="flex justify-between mb-4">
        <h3 class="font-semibold">Últimos Mantenimientos</h3>
        <UInput placeholder="Buscar..." />
      </div>

      <UTable :data="rows" :columns="columns" />
    </UCard>
  </div>
    </FondoDefault>
</template>