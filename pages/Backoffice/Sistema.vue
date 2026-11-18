<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { backoffice } from '~/Core/Backoffice/api'

definePageMeta({ middleware: 'backoffice', layout: 'default' })

const notificaciones = useNotificacionesStore()

const pestana = ref('salud')
const opcionesPestana = [
    { label: 'Salud', value: 'salud' },
    { label: 'Logs', value: 'logs' },
    { label: 'Configuración', value: 'config' },
    { label: 'Respaldos', value: 'backup' }
]

const salud = ref(null)
const logs = ref(null)
const logFiltro = ref('')
const config = ref(null)
const configEntorno = ref(null)
const respaldos = ref(null)
const cargando = ref(false)
const enviando = ref(false)

const camposConfig = computed(() => {
    if (!config.value) return []

    const etiquetas = {
        sesiones_maximas_por_usuario: 'Sesiones máximas por usuario',
        retencion_auditoria_dias: 'Retención auditoría (días)',
        retencion_metricas_dias: 'Retención métricas (días)',
        retencion_errores_dias: 'Retención errores (días)',
        retencion_respaldos_dias: 'Retención respaldos (días)',
        podar_sesiones_en_login: 'Podar sesiones en login',
        registrar_metricas: 'Registrar métricas',
        notificar_errores_500: 'Registrar errores 500',
        duracion_token_horas: 'Duración del token (horas)',
        max_peticiones_por_minuto: 'Máx. peticiones por minuto'
    }

    return Object.entries(config.value).map(([clave, valor]) => ({
        clave,
        etiqueta: etiquetas[clave] ?? clave,
        esBooleano: typeof valor === 'boolean',
        valor
    }))
})

async function cargar() {
    cargando.value = true
    try {
        if (pestana.value === 'salud') {
            salud.value = await backoffice.salud()
        } else if (pestana.value === 'logs') {
            await cargarLogs()
        } else if (pestana.value === 'config') {
            const respuesta = await backoffice.configuracion()
            config.value = respuesta?.data ?? null
            configEntorno.value = respuesta?.entorno ?? null
        } else if (pestana.value === 'backup') {
            respaldos.value = await backoffice.respaldos()
        }
    } catch (e) {
        notificar('error', e.message || 'No se pudo cargar la sección')
    } finally {
        cargando.value = false
    }
}

async function cargarLogs() {
    const respuesta = await backoffice.logs({ lineas: 300, ...(logFiltro.value ? { buscar: logFiltro.value } : {}) })
    logs.value = respuesta
}

function cambiarPestana(valor) {
    pestana.value = valor
    cargar()
}

async function limpiarLogs() {
    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Limpiar el log?',
        html: 'Se vaciará laravel.log. Se creará un archivo de respaldo .bak antes.',
        confirmtext: 'Sí, limpiar',
        canceltext: 'Atrás'
    }

    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    try {
        await backoffice.limpiarLogs()
        notificar('success', 'Log limpiado')
        await cargarLogs()
    } catch (e) {
        notificar('error', e.message || 'No se pudo limpiar el log')
    }
}

async function guardarConfig() {
    enviando.value = true
    try {
        const respuesta = await backoffice.guardarConfiguracion(config.value)
        config.value = respuesta?.data ?? config.value
        notificar('success', 'Configuración guardada')
    } catch (e) {
        notificar('error', e.message || 'No se pudo guardar la configuración')
    } finally {
        enviando.value = false
    }
}

function alternarBooleano(clave) {
    config.value[clave] = !config.value[clave]
}

async function exportarTabla(tablaNombre) {
    try {
        const respuesta = await backoffice.exportarTabla({ tabla: tablaNombre })

        const blob = new Blob([JSON.stringify({ tabla: respuesta.tabla, filas: respuesta.datos }, null, 2)], {
            type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const enlace = document.createElement('a')
        enlace.href = url
        enlace.download = `respaldo_${tablaNombre}_${new Date().toISOString().slice(0, 10)}.json`
        enlace.click()
        URL.revokeObjectURL(url)

        notificar('success', `Exportadas ${respuesta.filas} filas de ${tablaNombre}`)
    } catch (e) {
        notificar('error', e.message || 'No se pudo exportar')
    }
}

async function podarRespaldos() {
    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Podar respaldos antiguos?',
        html: `Se eliminarán los respaldos de filas con más de <span>${config.value?.retencion_respaldos_dias ?? 30}</span> días.`,
        confirmtext: 'Sí, podar',
        canceltext: 'Atrás'
    }

    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    try {
        const resultado = await backoffice.podaRespaldos({
            dias: config.value?.retencion_respaldos_dias ?? 30
        })
        notificar('success', resultado.message ?? 'Respaldos eliminados')
        await cargar()
    } catch (e) {
        notificar('error', e.message || 'No se pudo podar')
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

const tamanoLegible = (bytes) => {
    if (!bytes && bytes !== 0) return '-'
    const unidades = ['B', 'KB', 'MB', 'GB']
    let valor = bytes
    let unidad = 0
    while (valor >= 1024 && unidad < unidades.length - 1) {
        valor /= 1024
        unidad++
    }
    return `${valor.toFixed(1)} ${unidades[unidad]}`
}

onMounted(cargar)
</script>

<template>
    <FondoDefault>
        <div class="max-w-7xl mx-auto flex flex-col gap-5">
            <!-- Encabezado -->
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 class="text-2xl font-bold">Sistema</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        Salud, logs, configuración y respaldos del servidor
                    </p>
                </div>

                <div class="flex items-center gap-2">
                    <USelect v-model="pestana" :items="opcionesPestana" class="w-44"
                        @update:model-value="cambiarPestana" />
                    <UButton icon="i-lucide-refresh-cw" color="neutral" variant="soft" label="Actualizar"
                        :loading="cargando" @click="cargar" />
                </div>
            </div>

            <!-- Salud -->
            <template v-if="pestana === 'salud'">
                <UCard v-if="salud">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="font-semibold">Estado del sistema</h2>
                            <UBadge :color="salud.estado === 'saludable' ? 'success' : 'warning'" variant="subtle">
                                {{ salud.estado }} · {{ salud.generado_en }}
                            </UBadge>
                        </div>
                    </template>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div v-for="check in Object.values(salud.checks)" :key="check.nombre"
                            class="flex items-center gap-2 text-sm border rounded-lg p-3">
                            <UIcon :name="check.ok ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
                                :class="check.ok ? 'text-green-500' : 'text-red-500'" class="size-5" />
                            <span>{{ check.nombre }}</span>
                        </div>
                    </div>
                </UCard>
            </template>

            <!-- Logs -->
            <template v-else-if="pestana === 'logs'">
                <UCard>
                    <template #header>
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h2 class="font-semibold">Log del servidor</h2>
                                <p v-if="logs" class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ logs.archivo }} · {{ tamanoLegible(logs.tamano_bytes) }} ·
                                    actualizado {{ logs.ultima_modificacion }}
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <UInput v-model="logFiltro" placeholder="Filtrar líneas..." icon="lucide-search"
                                    size="sm" @keydown.enter="cargarLogs" />
                                <UButton color="primary" variant="soft" size="sm" label="Buscar"
                                    @click="cargarLogs" />
                                <UButton color="error" variant="soft" icon="i-lucide-trash-2" size="sm"
                                    label="Limpiar" @click="limpiarLogs" />
                            </div>
                        </div>
                    </template>

                    <pre v-if="logs?.lineas?.length"
                        class="text-xs bg-gray-950 text-gray-100 rounded p-4 overflow-auto max-h-[60vh] whitespace-pre-wrap">{{ logs.lineas.join('\n') }}</pre>
                    <p v-else class="text-sm text-gray-500">El log está vacío.</p>
                </UCard>
            </template>

            <!-- Configuración -->
            <template v-else-if="pestana === 'config'">
                <UCard v-if="config">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="font-semibold">Configuración del Backoffice</h2>
                            <UButton color="primary" icon="i-lucide-save" label="Guardar"
                                :loading="enviando" @click="guardarConfig" />
                        </div>
                    </template>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <template v-for="campo in camposConfig" :key="campo.clave">
                            <UFormField v-if="campo.esBooleano" :label="campo.etiqueta">
                                <USwitch :model-value="campo.valor" @update:model-value="alternarBooleano(campo.clave)" />
                            </UFormField>

                            <UFormField v-else :label="campo.etiqueta">
                                <UInput :model-value="campo.valor" type="number" class="w-full"
                                    @update:model-value="v => config[campo.clave] = Number(v)" />
                            </UFormField>
                        </template>
                    </div>

                    <div v-if="configEntorno" class="mt-6 border-t pt-4">
                        <p class="text-xs font-semibold text-gray-500 mb-2">Entorno del servidor</p>
                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                            <div v-for="(valor, clave) in configEntorno" :key="clave">
                                <span class="text-gray-500 text-xs uppercase">{{ clave }}:</span>
                                <UBadge :color="clave === 'app_debug' && valor ? 'warning' : 'neutral'" variant="subtle">
                                    {{ valor }}
                                </UBadge>
                            </div>
                        </div>
                    </div>
                </UCard>
            </template>

            <!-- Respaldos -->
            <template v-else-if="pestana === 'backup'">
                <UCard v-if="respaldos">
                    <template #header>
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <div>
                                <h2 class="font-semibold">Respaldos</h2>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ respaldos.total_respaldos }} respaldos de filas guardados por la auditoría
                                </p>
                            </div>
                            <UButton color="warning" variant="soft" icon="i-lucide-eraser" size="sm"
                                label="Podar antiguos" @click="podarRespaldos" />
                        </div>
                    </template>

                    <div class="flex flex-col gap-2">
                        <div v-for="tablaInfo in respaldos.tablas" :key="tablaInfo.tabla"
                            class="flex items-center justify-between border rounded-lg p-3 text-sm">
                            <div>
                                <p class="font-medium">{{ tablaInfo.tabla }}</p>
                                <p class="text-xs text-gray-500">
                                    {{ tablaInfo.filas }} filas ·
                                    último respaldo {{ formatearFecha(tablaInfo.ultimo_respaldo) }}
                                </p>
                            </div>
                            <UButton size="sm" variant="soft" color="primary" icon="i-lucide-download"
                                label="Exportar" @click="exportarTabla(tablaInfo.tabla)" />
                        </div>
                    </div>
                </UCard>
            </template>
        </div>
    </FondoDefault>
</template>
