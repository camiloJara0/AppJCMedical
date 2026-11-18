<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { backoffice } from '~/Core/Backoffice/api'

definePageMeta({ middleware: 'backoffice', layout: 'default' })

const varView = useVarView()
const notificaciones = useNotificacionesStore()

const datos = ref(null)
const salud = ref(null)
const errorCarga = ref('')

const tarjetas = computed(() => {
    if (!datos.value) return []

    const d = datos.value

    return [
        {
            titulo: 'Usuarios activos',
            valor: d.usuarios?.activos ?? 0,
            detalle: `${d.usuarios?.total ?? 0} en total · ${d.usuarios?.tecnicos ?? 0} técnicos`,
            icono: 'i-lucide-users',
            color: 'text-primary-500'
        },
        {
            titulo: 'Reportes hoy',
            valor: d.operacion?.reportes_hoy ?? 0,
            detalle: `${d.operacion?.reportes_total ?? 0} históricos`,
            icono: 'i-lucide-file-text',
            color: 'text-green-500'
        },
        {
            titulo: 'Citas hoy',
            valor: d.operacion?.citas_hoy ?? 0,
            detalle: `${d.operacion?.citas_total ?? 0} históricas`,
            icono: 'i-lucide-calendar',
            color: 'text-amber-500'
        },
        {
            titulo: 'Sesiones activas',
            valor: d.usuarios?.sesiones_activas ?? 0,
            detalle: `${d.rendimiento?.logins_hoy ?? 0} logins hoy`,
            icono: 'i-lucide-key-round',
            color: 'text-gray-500'
        },
        {
            titulo: 'Peticiones hoy',
            valor: d.rendimiento?.peticiones_hoy ?? 0,
            detalle: variacionTexto.value,
            icono: 'i-lucide-activity',
            color: 'text-sky-500'
        },
        {
            titulo: 'Errores pendientes',
            valor: d.errores?.pendientes ?? 0,
            detalle: `${d.errores?.hoy ?? 0} nuevos hoy`,
            icono: 'i-lucide-triangle-alert',
            color: 'text-red-500'
        }
    ]
})

const variacionTexto = computed(() => {
    const v = datos.value?.rendimiento?.variacion_vs_ayer
    if (v === null || v === undefined) return 'Sin dato previo'
    return `${v > 0 ? '+' : ''}${v}% frente a ayer`
})

const ultimasAcciones = computed(() => datos.value?.ultimas_acciones ?? [])
const erroresRecientes = computed(() => datos.value?.errores_recientes ?? [])

const actividad = computed(() => {
    const serie = datos.value?.actividad_14_dias ?? []
    const maximo = Math.max(1, ...serie.map(s => Number(s.total_peticiones || 0)))
    return serie.map(s => ({
        fecha: String(s.fecha).slice(5),
        peticiones: Number(s.total_peticiones || 0),
        errores: Number(s.total_errores || 0),
        porcentaje: Math.round((Number(s.total_peticiones || 0) / maximo) * 100)
    }))
})

async function cargar() {
    varView.cargando = true
    errorCarga.value = ''

    try {
        const [panel, estado] = await Promise.all([
            backoffice.dashboard(),
            backoffice.salud()
        ])

        datos.value = panel
        salud.value = estado
    } catch (e) {
        errorCarga.value = e.message || 'No se pudo cargar el panel'
        notificaciones.options = {
            icono: 'error',
            titulo: 'Error al cargar',
            texto: errorCarga.value,
            tiempo: 3500
        }
        notificaciones.simple()
    } finally {
        varView.cargando = false
    }
}

onMounted(cargar)

const fechaFormateada = (valor) => (valor ? String(valor).replace('T', ' ').slice(0, 16) : '-')
</script>

<template>
    <FondoDefault>
        <div class="max-w-7xl mx-auto flex flex-col gap-6">
            <!-- Encabezado -->
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-bold">Backoffice</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Panel de control técnico · SuperAdmin
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <UBadge v-if="salud" :color="salud.estado === 'saludable' ? 'success' : 'warning'" variant="subtle">
                        {{ salud.estado === 'saludable' ? 'Sistema saludable' : `${salud.incidencias} incidencia(s)` }}
                    </UBadge>
                    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft" label="Actualizar"
                        :loading="varView.cargando" @click="cargar" />
                </div>
            </div>

            <UAlert v-if="errorCarga" color="error" variant="subtle" :title="errorCarga"
                icon="i-lucide-circle-alert" />

            <!-- Tarjetas -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <UCard v-for="tarjeta in tarjetas" :key="tarjeta.titulo" class="gap-2">
                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                {{ tarjeta.titulo }}
                            </p>
                            <p class="text-3xl font-bold mt-1">{{ tarjeta.valor }}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ tarjeta.detalle }}</p>
                        </div>
                        <UIcon :name="tarjeta.icono" class="size-8" :class="tarjeta.color" />
                    </div>
                </UCard>
            </div>

            <!-- Salud del sistema -->
            <UCard v-if="salud">
                <template #header>
                    <div class="flex items-center justify-between">
                        <h2 class="font-semibold">Salud del sistema</h2>
                        <UBadge :color="salud.estado === 'saludable' ? 'success' : 'warning'" variant="subtle">
                            {{ salud.estado }}
                        </UBadge>
                    </div>
                </template>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div v-for="check in Object.values(salud.checks)" :key="check.nombre"
                        class="flex items-center gap-2 text-sm">
                        <UIcon :name="check.ok ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
                            :class="check.ok ? 'text-green-500' : 'text-red-500'" class="size-5" />
                        <span>{{ check.nombre }}</span>
                    </div>
                </div>
            </UCard>

            <!-- Actividad -->
            <UCard>
                <template #header>
                    <h2 class="font-semibold">Actividad de los últimos 14 días</h2>
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
                <p v-else class="text-sm text-gray-500">Sin actividad registrada en el rango.</p>
            </UCard>

            <!-- Últimas acciones y errores -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <UCard>
                    <template #header>
                        <h2 class="font-semibold">Últimas acciones auditadas</h2>
                    </template>

                    <div v-if="ultimasAcciones.length" class="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                        <div v-for="accion in ultimasAcciones" :key="accion.id" class="py-2 text-sm">
                            <div class="flex items-center justify-between gap-2">
                                <span class="font-medium">{{ accion.nombre || 'Sistema' }}</span>
                                <UBadge color="neutral" variant="subtle">{{ accion.accion }}</UBadge>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                {{ accion.tabla || '-' }} #{{ accion.registro_id ?? '-' }} ·
                                {{ fechaFormateada(accion.created_at) }}
                            </p>
                        </div>
                    </div>
                    <p v-else class="text-sm text-gray-500">Todavía no hay acciones registradas.</p>
                </UCard>

                <UCard>
                    <template #header>
                        <h2 class="font-semibold">Errores recientes</h2>
                    </template>

                    <div v-if="erroresRecientes.length" class="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                        <div v-for="error in erroresRecientes" :key="error.id" class="py-2 text-sm">
                            <div class="flex items-center justify-between gap-2">
                                <span class="truncate">{{ error.mensaje }}</span>
                                <UBadge :color="error.nivel === 'error' ? 'error' : 'warning'" variant="subtle">
                                    {{ error.veces }}×
                                </UBadge>
                            </div>
                            <p class="text-xs text-gray-500 dark:text-gray-400">
                                {{ error.ruta || '-' }} · {{ fechaFormateada(error.created_at) }}
                            </p>
                        </div>
                    </div>
                    <p v-else class="text-sm text-gray-500">No hay errores pendientes.</p>
                </UCard>
            </div>
        </div>
    </FondoDefault>
</template>
