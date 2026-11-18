<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { backoffice } from '~/Core/Backoffice/api'

definePageMeta({ middleware: 'backoffice', layout: 'default' })

const notificaciones = useNotificacionesStore()

const dias = ref(7)
const metricas = ref(null)
const rutas = ref([])
const sesiones = ref(null)
const cargando = ref(false)

const totalCards = computed(() => {
    if (!metricas.value) return []

    const t = metricas.value.totales

    return [
        { titulo: 'Peticiones', valor: t.peticiones, icono: 'i-lucide-activity', color: 'primary' },
        { titulo: 'Errores 5xx', valor: t.errores, icono: 'i-lucide-triangle-alert', color: 'error' },
        { titulo: 'Promedio (ms)', valor: t.duracion_promedio_ms, icono: 'i-lucide-timer', color: 'info' },
        { titulo: 'Logins', valor: t.logins, icono: 'i-lucide-log-in', color: 'success' },
        { titulo: 'Reportes', valor: t.reportes, icono: 'i-lucide-file-text', color: 'warning' },
        { titulo: 'Citas', valor: t.citas, icono: 'i-lucide-calendar', color: 'neutral' }
    ]
})

const actividad = computed(() => {
    const serie = metricas.value?.diarias ?? []
    const maximo = Math.max(1, ...serie.map(s => Number(s.total_peticiones || 0)))

    return serie.map(s => ({
        fecha: String(s.fecha).slice(5),
        peticiones: Number(s.total_peticiones || 0),
        errores: Number(s.total_errores || 0),
        porcentaje: Math.round((Number(s.total_peticiones || 0) / maximo) * 100)
    }))
})

async function cargar() {
    cargando.value = true
    try {
        const params = { dias: dias.value }
        const [resumen, porRuta, estadoSesiones] = await Promise.all([
            backoffice.metricas(params),
            backoffice.metricasRutas(params),
            backoffice.sesiones()
        ])

        metricas.value = resumen
        rutas.value = porRuta?.data ?? []
        sesiones.value = estadoSesiones
    } catch (e) {
        notificar('error', e.message || 'No se pudieron cargar las métricas')
    } finally {
        cargando.value = false
    }
}

async function podar() {
    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Eliminar sesiones expiradas?',
        html: 'Se eliminarán todos los tokens expirados de la base de datos.',
        confirmtext: 'Sí, eliminar',
        canceltext: 'Atrás'
    }

    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    try {
        const resultado = await backoffice.podarSesiones()
        notificar('success', resultado.message ?? 'Sesiones eliminadas')
        await cargar()
    } catch (e) {
        notificar('error', e.message || 'No se pudieron eliminar')
    }
}

function notificar(icono, texto) {
    notificaciones.options = {
        position: 'top-end',
        texto,
        background: icono === 'success' ? '#6bc517' : '#d33',
        tiempo: 2500
    }
    notificaciones.mensaje()
}

function formatearFecha(valor) {
    if (!valor) return '-'
    return String(valor).replace('T', ' ').slice(0, 16)
}

const columnasRutas = [
    { accessorKey: 'ruta', header: 'Ruta', sorted: true },
    { accessorKey: 'metodo', header: 'Método' },
    { accessorKey: 'total', header: 'Total', sorted: true },
    {
        accessorKey: 'promedio_ms',
        header: 'Promedio (ms)',
        cell: ({ row }) => h('span', { class: 'tabular-nums' }, Math.round(Number(row.original.promedio_ms || 0)))
    },
    {
        accessorKey: 'maximo_ms',
        header: 'Máximo (ms)',
        cell: ({ row }) => h('span', { class: 'tabular-nums' }, row.original.maximo_ms)
    },
    {
        accessorKey: 'fallos',
        header: 'Fallos 5xx',
        cell: ({ row }) => h('span', {
            class: Number(row.original.fallos) > 0 ? 'text-red-500 font-semibold tabular-nums' : 'tabular-nums'
        }, String(row.original.fallos))
    },
    {
        accessorKey: 'rechazos',
        header: '4xx',
        cell: ({ row }) => h('span', { class: 'tabular-nums' }, String(row.original.rechazos))
    }
]

const columnasLentas = [
    { accessorKey: 'ruta', header: 'Ruta' },
    { accessorKey: 'metodo', header: 'Método' },
    {
        accessorKey: 'estado_http',
        header: 'HTTP',
        cell: ({ row }) => h(UBadge, {
            variant: 'subtle',
            color: row.original.estado_http >= 500 ? 'error' : row.original.estado_http >= 400 ? 'warning' : 'success'
        }, () => String(row.original.estado_http))
    },
    {
        accessorKey: 'duracion_ms',
        header: 'Duración (ms)',
        cell: ({ row }) => h('span', { class: 'tabular-nums' }, row.original.duracion_ms)
    },
    {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => h('span', { class: 'text-xs text-gray-500' }, formatearFecha(row.original.created_at))
    }
]

const columnasSesiones = [
    { accessorKey: 'correo', header: 'Usuario', cell: ({ row }) => h('span', { class: 'text-sm' }, row.original.correo ?? '-') },
    { accessorKey: 'rol', header: 'Rol' },
    { accessorKey: 'ip_address', header: 'IP', cell: ({ row }) => h('span', { class: 'text-xs' }, row.original.ip_address ?? '-') },
    {
        accessorKey: 'user_agent',
        header: 'Dispositivo',
        cell: ({ row }) => h('span', { class: 'block max-w-[260px] truncate text-xs text-gray-500' },
            row.original.user_agent ?? '-')
    },
    {
        accessorKey: 'last_used_at',
        header: 'Último uso',
        cell: ({ row }) => h('span', { class: 'text-xs text-gray-500' }, formatearFecha(row.original.last_used_at))
    },
    {
        accessorKey: 'expires_at',
        header: 'Expira',
        cell: ({ row }) => h('span', { class: 'text-xs text-gray-500' }, formatearFecha(row.original.expires_at))
    }
]

const opcionesDias = [
    { label: 'Último día', value: 1 },
    { label: '7 días', value: 7 },
    { label: '14 días', value: 14 },
    { label: '30 días', value: 30 },
    { label: '90 días', value: 90 }
]

onMounted(cargar)
</script>

<template>
    <FondoDefault>
        <div class="max-w-7xl mx-auto flex flex-col gap-5">
            <!-- Encabezado -->
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-bold">Métricas de la API</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Rendimiento, uso y sesiones activas
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <USelect v-model="dias" :items="opcionesDias" class="w-40" @update:model-value="cargar" />
                    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft" label="Actualizar"
                        :loading="cargando" @click="cargar" />
                </div>
            </div>

            <!-- Totales -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <UCard v-for="tarjeta in totalCards" :key="tarjeta.titulo" class="gap-1">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs uppercase text-gray-500 dark:text-gray-400">{{ tarjeta.titulo }}</p>
                            <p class="text-2xl font-bold">{{ tarjeta.valor }}</p>
                        </div>
                        <UIcon :name="tarjeta.icono" class="size-6 text-gray-400" />
                    </div>
                </UCard>
            </div>

            <!-- Actividad -->
            <UCard>
                <template #header>
                    <h2 class="font-semibold">Peticiones por día</h2>
                </template>

                <div v-if="actividad.length" class="flex flex-col gap-3">
                    <div v-for="dia in actividad" :key="dia.fecha" class="flex items-center gap-3 text-sm">
                        <span class="w-12 text-gray-500 dark:text-gray-400">{{ dia.fecha }}</span>
                        <div class="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                            <div class="h-full bg-primary-500 rounded transition-all"
                                :style="{ width: dia.porcentaje + '%' }" />
                        </div>
                        <span class="w-24 text-right tabular-nums">
                            {{ dia.peticiones }} req
                            <span v-if="dia.errores" class="text-red-500">· {{ dia.errores }} err</span>
                        </span>
                    </div>
                </div>
                <p v-else class="text-sm text-gray-500">Sin datos en el rango seleccionado.</p>
            </UCard>

            <!-- Rutas -->
            <UCard>
                <template #header>
                    <h2 class="font-semibold">Uso por ruta</h2>
                </template>

                <UTable v-if="rutas.length" :data="rutas" :columns="columnasRutas" class="max-h-96" sticky />
                <p v-else class="text-sm text-gray-500">Sin datos.</p>
            </UCard>

            <!-- Lentas y fallos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <UCard>
                    <template #header>
                        <h2 class="font-semibold">Peticiones más lentas</h2>
                    </template>

                    <UTable v-if="metricas?.lentas?.length" :data="metricas.lentas" :columns="columnasLentas" />
                    <p v-else class="text-sm text-gray-500">Sin datos.</p>
                </UCard>

                <UCard>
                    <template #header>
                        <h2 class="font-semibold">Fallos recientes (5xx)</h2>
                    </template>

                    <UTable v-if="metricas?.fallos?.length" :data="metricas.fallos" :columns="columnasLentas" />
                    <p v-else class="text-sm text-gray-500">Sin fallos registrados.</p>
                </UCard>
            </div>

            <!-- Sesiones -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <h2 class="font-semibold">
                            Sesiones activas
                            <UBadge variant="subtle" color="info" class="ml-2">
                                {{ sesiones?.total_activos ?? 0 }}
                            </UBadge>
                            <span class="text-xs text-gray-500 ml-2">
                                {{ sesiones?.expirados_hoy ?? 0 }} expiraron hoy
                            </span>
                        </h2>
                        <UButton color="error" variant="soft" icon="i-lucide-trash-2" size="sm"
                            label="Podar expiradas" @click="podar" />
                    </div>
                </template>

                <UTable v-if="sesiones?.data?.length" :data="sesiones.data" :columns="columnasSesiones"
                    class="max-h-96" sticky />
                <p v-else class="text-sm text-gray-500">No hay sesiones registradas.</p>
            </UCard>
        </div>
    </FondoDefault>
</template>
