<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import TablaBackoffice from '~/components/organism/Backoffice/TablaBackoffice.vue'
import { backoffice } from '~/Core/Backoffice/api'

definePageMeta({ middleware: 'backoffice', layout: 'default' })

const notificaciones = useNotificacionesStore()
const tabla = ref(null)
const acciones = ref([])

// ---- Detalle ----
const mostrarDetalle = ref(false)
const detalle = ref(null)
const respaldo = ref(null)
const cargandoDetalle = ref(false)

const accionesFiltro = computed(() => [
    { label: 'Todas', value: 'all' },
    ...acciones.value.map(a => ({ label: a, value: a }))
])

async function verDetalle(registro) {
    mostrarDetalle.value = true
    cargandoDetalle.value = true
    detalle.value = null
    respaldo.value = null

    try {
        const respuesta = await backoffice.auditoriaDetalle(registro.id)
        detalle.value = respuesta?.data ?? null
        respaldo.value = respuesta?.respaldo ?? null
    } catch (e) {
        notificar('error', e.message || 'No se pudo cargar el detalle')
        mostrarDetalle.value = false
    } finally {
        cargandoDetalle.value = false
    }
}

async function restaurar() {
    if (!detalle.value) return

    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Restaurar registro?',
        html: `Se restaurará el registro <span>#${detalle.value.registro_id}</span> de la tabla <span>${detalle.value.tabla}</span> con los datos del respaldo.`,
        confirmtext: 'Sí, restaurar',
        canceltext: 'Atrás'
    }

    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    try {
        await backoffice.restaurarAuditoria(detalle.value.id)
        notificar('success', 'Registro restaurado')
        mostrarDetalle.value = false
        await tabla.value?.refrescar()
    } catch (e) {
        notificar('error', e.message || 'No se pudo restaurar')
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

const colorAccion = {
    crear: 'success',
    actualizar: 'warning',
    eliminar: 'error',
    suspender: 'error',
    reactivar: 'success',
    login: 'info',
    logout: 'neutral',
    restaurar: 'info'
}

const columns = [
    { accessorKey: 'id', header: 'ID', sorted: true },
    {
        accessorKey: 'accion',
        header: 'Acción',
        cell: ({ row }) => h(UBadge, {
            variant: 'subtle',
            color: colorAccion[row.original.accion] ?? 'neutral'
        }, () => row.original.accion)
    },
    {
        accessorKey: 'nombre',
        header: 'Usuario',
        cell: ({ row }) => h('span', { class: 'text-sm' },
            row.original.nombre ?? row.original.correo ?? 'Sistema')
    },
    {
        accessorKey: 'tabla',
        header: 'Tabla',
        cell: ({ row }) => h('span', { class: 'text-xs' },
            `${row.original.tabla ?? '-'} #${row.original.registro_id ?? '-'}`)
    },
    {
        accessorKey: 'ip',
        header: 'IP',
        cell: ({ row }) => h('span', { class: 'text-xs text-gray-500' }, row.original.ip ?? '-')
    },
    {
        accessorKey: 'created_at',
        header: 'Fecha',
        cell: ({ row }) => h('span', { class: 'text-xs text-gray-500' },
            formatearFecha(row.original.created_at))
    },
    {
        id: 'actions',
        cell: ({ row }) => h('div', { class: 'text-right' }, h(UButton, {
            icon: 'i-lucide-eye',
            color: 'neutral',
            variant: 'ghost',
            size: 'sm',
            onClick: () => verDetalle(row.original)
        }))
    }
]

function formatearFecha(valor) {
    if (!valor) return '-'
    return String(valor).replace('T', ' ').slice(0, 16)
}

const propiedadesTabla = computed(() => ({
    titulo: 'Auditoría de operaciones',
    subtitulo: 'Registro completo de acciones sobre los datos',
    columns,
    cargador: backoffice.auditoria,
    filtros: [
        { columna: 'accion', placeholder: 'Acción', valor: '', opciones: accionesFiltro.value }
    ]
}))

onMounted(async () => {
    try {
        const respuesta = await backoffice.auditoria({ por_pagina: 100 })
        acciones.value = [...new Set((respuesta?.data ?? []).map(r => r.accion))]
    } catch {
        acciones.value = []
    }
})
</script>

<template>
    <FondoDefault>
        <div class="max-w-7xl mx-auto">
            <TablaBackoffice ref="tabla" v-bind="propiedadesTabla" />
        </div>

        <UModal v-model:open="mostrarDetalle" title="Detalle de la operación" :ui="{ content: 'max-w-2xl' }">
            <template #body>
                <div v-if="cargandoDetalle" class="py-10 flex justify-center">
                    <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-gray-400" />
                </div>

                <div v-else-if="detalle" class="flex flex-col gap-4 text-sm">
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <p class="text-xs text-gray-500">Acción</p>
                            <UBadge :color="colorAccion[detalle.accion] ?? 'neutral'" variant="subtle">
                                {{ detalle.accion }}
                            </UBadge>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Registro</p>
                            <p>{{ detalle.tabla ?? '-' }} #{{ detalle.registro_id ?? '-' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Usuario</p>
                            <p>{{ detalle.nombre ?? 'Sistema' }}<span
                                    v-if="detalle.correo"> ({{ detalle.correo }})</span></p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Origen</p>
                            <p>{{ detalle.ip ?? '-' }} · {{ detalle.ruta ?? '-' }}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-xs text-gray-500">Fecha</p>
                            <p>{{ formatearFecha(detalle.created_at) }}</p>
                        </div>
                    </div>

                    <div v-if="detalle.datos_anteriores">
                        <p class="text-xs font-semibold text-gray-500 mb-1">Datos anteriores</p>
                        <pre
                            class="text-xs bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-x-auto max-h-40">{{ JSON.stringify(detalle.datos_anteriores, null, 2) }}</pre>
                    </div>

                    <div v-if="detalle.datos_nuevos">
                        <p class="text-xs font-semibold text-gray-500 mb-1">Datos nuevos</p>
                        <pre
                            class="text-xs bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-x-auto max-h-40">{{ JSON.stringify(detalle.datos_nuevos, null, 2) }}</pre>
                    </div>

                    <div v-if="respaldo">
                        <p class="text-xs font-semibold text-gray-500 mb-1">Respaldo disponible</p>
                        <pre
                            class="text-xs bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-x-auto max-h-40">{{ JSON.stringify(respaldo.datos, null, 2) }}</pre>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton v-if="respaldo" color="warning" variant="soft" icon="i-lucide-undo-2"
                        label="Restaurar respaldo" @click="restaurar" />
                    <UButton color="neutral" variant="ghost" label="Cerrar" @click="mostrarDetalle = false" />
                </div>
            </template>
        </UModal>
    </FondoDefault>
</template>
