<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';

import { onMounted, ref } from 'vue';
import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";
import { traerDashboard } from '~/composables/Usuarios/Dashboard';

const varView = useVarView()
const apiRest = useApiRest()
const showCita = ref(false)
const refresh = ref(1)
const footer = useSeccionFooter();
const rol = ref('')
const storeReportes = useReporteStore()
const reportes = ref([]);
const datos = ref([])

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

async function llamadatos() {
    const ultimosReportes = await storeReportes.traer(false);
    reportes.value = ultimosReportes.slice(0,3)
    varView.datosActualizados()
}

onMounted(async () => {
  varView.cargando = true;
  const ultimosReportes = await storeReportes.traer();
  reportes.value = ultimosReportes.slice(0,3)
  rol.value = varView.getRol
  sessionStorage.removeItem('activeButton');
  sessionStorage.removeItem('seccionIdActivo')
  footer.cambiarSecciones([]);

  llamadatos()
  datos.value = await traerDashboard()
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
  fechas: { name: 'Fecha', color: '#3b82f6' },
  numero: { name: 'numero', color: '#ef4444' }
}

const xFormatter = (i) => categories[i]

const estadoCategories = {
  estado: { name: 'Estado', color: '#3b82f6' },
  cantidad: { name: 'Cantidad', color: '#ef4444' }
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
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'equipo.nombre', header: 'Equipo' },
    { accessorKey: 'tipo', header: 'Tipo' },
    { accessorKey: 'cliente.nombre', header: 'Cliente' },
    { accessorKey: 'fecha', header: 'Fecha', sorted: true},
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')
            const color =
                estado === 'realizada' ? 'success' :
                    estado === 'En Revisión' ? 'warning' :
                        estado === 'eliminada' ? 'error' :
                            'neutral'
            return h(UBadge, { variant: 'subtle', color, class: 'capitalize' }, () => estado)
        }
    },
]

// tecnicos
const chartDataT = [
  { semana: 'Semana 1', mantenimientos: 5 },
  { semana: 'Semana 2', mantenimientos: 8 },
  { semana: 'Semana 3', mantenimientos: 6 },
  { semana: 'Semana 4', mantenimientos: 7 }
]
const categoriesT = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4']
const tipoData = [
  { tipo: 'Preventivo', cantidad: 10 },
  { tipo: 'Correctivo', cantidad: 6 },
  { tipo: 'Predictivo', cantidad: 3 }
]
const tipoCategories = ['Preventivo', 'Correctivo', 'Predictivo']
const rowsT = [
  { equipo: 'Ventilador Mecánico', fecha: '2026-04-05', estado: 'Completado' },
  { equipo: 'Monitor Signos Vitales', fecha: '2026-04-06', estado: 'En curso' },
  { equipo: 'Bomba de Infusión', fecha: '2026-04-07', estado: 'Pendiente' }
]
const columnsT = [
  { accessorKey: 'equipo', header: 'Equipo' },
  { accessorKey: 'fecha', header: 'Fecha' },
  { accessorKey: 'estado', header: 'Estado' }
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
        <h1 class="text-3xl font-bold mb-2">{{ rol == 'Admin' ? 'Bienvenido, Administrador' : 'Bienvenido Tecnico' }}</h1>
        <p class="text-lg">Modulo de control de la aplicación</p>
      </div>
    </div>

    <div v-if="rol == 'Admin'" class="p-6 space-y-6 dark:text-gray-50 min-h-screen">
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
              <h2 class="text-2xl font-bold">{{ datos.equipos }}</h2>
            </div>
            <UIcon name="i-heroicons-cpu-chip" class="text-primary text-3xl" />
          </div>
        </UCard>

        <UCard>
          <div class="flex justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-300">Mantenimientos Pendientes</p>
              <h2 class="text-2xl font-bold text-warning">{{ datos.mantenimientosPendientes }}</h2>
            </div>
            <UIcon name="i-heroicons-wrench-screwdriver" class="text-warning text-3xl" />
          </div>
        </UCard>

        <UCard>
          <div class="flex justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-300">Cotizaciones Activas</p>
              <h2 class="text-2xl font-bold text-info">{{ datos.cotizaciones }}</h2>
            </div>
            <UIcon name="i-heroicons-document-text" class="text-info text-3xl" />
          </div>
        </UCard>

        <UCard>
          <div class="flex justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-300">Equipos Críticos</p>
              <h2 class="text-2xl font-bold text-danger">{{ datos.equiposCriticos }}</h2>
            </div>
            <UIcon name="i-heroicons-exclamation-triangle" class="text-danger text-3xl" />
          </div>
        </UCard>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard>
          <h3 class="font-semibold mb-4">Mantenimientos por Mes</h3>
          <LineChart :data="datos.chartData || chartData" :height="300" y-label="Mantenimientos" :x-num-ticks="6" :y-num-ticks="4"
            :categories="categories" :x-formatter="xFormatter" :y-grid-line="true" :curve-type="CurveType.Linear"
            :legend-position="LegendPosition.TopRight" :hide-legend="false" />
        </UCard>

        <UCard>
          <h3 class="font-semibold mb-4">Estado de Equipos</h3>
          <BarChart :data="datos.estadoData || estadoData" :height="300" y-label="Cantidad" :categories="estadoCategories"
            :y-axis="['cantidad']" :radius="4" />
        </UCard>
      </div>

      <!-- Table Section -->
      <UCard>
        <div class="flex justify-between mb-4">
          <h3 class="font-semibold">Últimos Mantenimientos</h3>
          <UInput placeholder="Buscar..." />
        </div>

        <UTable :data="reportes" :columns="columns" />
      </UCard>
    </div>

    <div v-else class="p-6 space-y-6 dark:text-gray-50 min-h-screen">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard Técnico</h1>
          <p class="text-sm text-gray-500 dark:text-gray-300">Seguimiento de tareas, mantenimientos y reportes</p>
        </div>
        <UButton color="primary" label="Nuevo Reporte" />
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard>
          <div class="flex justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-300">Tareas Asignadas</p>
              <h2 class="text-2xl font-bold">12</h2>
            </div>
            <UIcon name="i-heroicons-clipboard-document-check" class="text-primary text-3xl" />
          </div>
        </UCard>

        <UCard>
          <div class="flex justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-300">Mantenimientos Completados</p>
              <h2 class="text-2xl font-bold text-success">8</h2>
            </div>
            <UIcon name="i-heroicons-check-circle" class="text-success text-3xl" />
          </div>
        </UCard>

        <UCard>
          <div class="flex justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-300">Mantenimientos en Curso</p>
              <h2 class="text-2xl font-bold text-info">4</h2>
            </div>
            <UIcon name="i-heroicons-cog-6-tooth" class="text-info text-3xl" />
          </div>
        </UCard>

        <UCard>
          <div class="flex justify-between">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-300">Alertas Críticas</p>
              <h2 class="text-2xl font-bold text-danger">2</h2>
            </div>
            <UIcon name="i-heroicons-bell-alert" class="text-danger text-3xl" />
          </div>
        </UCard>
      </div>

      <!-- Charts Section -->
      <!-- <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard>
          <h3 class="font-semibold mb-4">Mantenimientos por Semana</h3>
          <LineChart :data="chartDataT" :height="300" y-label="Mantenimientos" :categories="categoriesT"
            :curve-type="CurveType.Linear" :legend-position="LegendPosition.TopRight" />
        </UCard>

        <UCard>
          <h3 class="font-semibold mb-4">Tipos de Mantenimiento</h3>
          <BarChart :data="tipoData" :height="300" y-label="Cantidad" :categories="tipoCategories"
            :y-axis="['cantidad']" :radius="4" />
        </UCard>
      </div> -->

      <!-- Table Section -->
      <UCard>
        <div class="flex justify-between mb-4">
          <h3 class="font-semibold">Tareas Recientes</h3>
          <UInput placeholder="Buscar..." />
        </div>

        <UTable :data="rowsT" :columns="columnsT" />
      </UCard>
    </div>

  </FondoDefault>
</template>