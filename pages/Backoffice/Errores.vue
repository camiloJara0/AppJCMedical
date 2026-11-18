<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import TablaBackoffice from '~/components/organism/Backoffice/TablaBackoffice.vue'
import { backoffice } from '~/Core/Backoffice/api'

definePageMeta({ middleware: 'backoffice', layout: 'default' })

const notificaciones = useNotificacionesStore()
const tabla = ref(null)

// ---- Detalle ----
const mostrarDetalle = ref(false)
const detalle = ref(null)
const cargandoDetalle = ref(false)
const enviando = ref(false)

async function verDetalle(registro) {
    mostrarDetalle.value = true
    cargandoDetalle.value = true
    detalle.value = null

    try {
        const respuesta = await backoffice.errores({ por_pagina: 100 })
        detalle.value = (respuesta?.data ?? []).find(e => e.id === registro.id) ?? registro
    } catch (e) {
        notificar('error', e.message || 'No se pudo cargar el detalle')
        mostrarDetalle.value = false
    } finally {
        cargandoDetalle.value = false
    }
}

async function cambiarEstado(accion) {
    if (!detalle.value) return
    enviando.value = true

    try {
        if (accion === 'resolver') {
            await backoffice.resolverError(detalle.value.id)
            notificar('success', 'Error marcado como resuelto')
        } else {
            await backoffice.reabrirError(detalle.value.id)
            notificar('success', 'Error reabierto')
        }
        mostrarDetalle.value = false
        await tabla.value?.refrescar()
    } catch (e) {
        notificar('error', e.message || 'No se pudo actualizar el error')
    } finally {
        enviando.value = false
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

const columns = [
    { accessorKey: 'id', header: 'ID', sorted: true },
    {
        accessorKey: 'nivel',
        header: 'Nivel',
        cell: ({ row }) => h(UBadge, {
            variant: 'subtle',
            color: row.original.nivel === 'error' ? 'error' : 'warning'
        }, () => row.original.nivel)
    },
    {
        accessorKey: 'mensaje',
        header: 'Mensaje',
        cell: ({ row }) => h('span', { class: 'block max-w-[380px] truncate text-sm' }, row.original.mensaje)
    },
    {
        accessorKey: 'ruta',
        header: 'Ruta',
        cell: ({ row }) => h('span', { class: 'text-xs text-gray-500' }, row.original.ruta ?? '-')
    },
    {
        accessorKey: 'veces',
        header: 'Veces',
        cell: ({ row }) => h(UBadge, { variant: 'subtle', color: 'neutral' }, () => `${row.original.veces}×`)
    },
    {
        accessorKey: 'resuelto_en',
        header: 'Estado',
        cell: ({ row }) => h(UBadge, {
            variant: 'subtle',
            color: row.original.resuelto_en ? 'success' : 'error'
        }, () => row.original.resuelto_en ? 'Resuelto' : 'Pendiente')
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
    titulo: 'Errores de la aplicación',
    subtitulo: 'Errores del backend y los reportados por los clientes',
    columns,
    cargador: backoffice.errores,
    filtros: [
        {
            columna: 'nivel',
            placeholder: 'Nivel',
            valor: '',
            opciones: [
                { label: 'Todos', value: 'all' },
                { label: 'Error', value: 'error' },
                { label: 'Warning', value: 'warning' },
                { label: 'Info', value: 'info' }
            ]
        },
        {
            columna: 'estado',
            placeholder: 'Estado',
            valor: '',
            opciones: [
                { label: 'Todos', value: 'all' },
                { label: 'Pendientes', value: 'pendiente' },
                { label: 'Resueltos', value: 'resuelto' }
            ]
        }
    ]
}))
</script>

<template>
    <FondoDefault>
        <div class="max-w-7xl mx-auto">
            <TablaBackoffice ref="tabla" v-bind="propiedadesTabla" />
        </div>

        <UModal v-model:open="mostrarDetalle" title="Detalle del error" :ui="{ content: 'max-w-2xl' }">
            <template #body>
                <div v-if="cargandoDetalle" class="py-10 flex justify-center">
                    <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-gray-400" />
                </div>

                <div v-else-if="detalle" class="flex flex-col gap-4 text-sm">
                    <div class="flex items-center justify-between">
                        <UBadge :color="detalle.nivel === 'error' ? 'error' : 'warning'" variant="subtle">
                            {{ detalle.nivel }}
                        </UBadge>
                        <UBadge :color="detalle.resuelto_en ? 'success' : 'error'" variant="subtle">
                            {{ detalle.resuelto_en ? 'Resuelto' : 'Pendiente' }}
                        </UBadge>
                    </div>

                    <div>
                        <p class="text-xs text-gray-500">Mensaje</p>
                        <p class="font-medium break-words">{{ detalle.mensaje }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <p class="text-xs text-gray-500">Ruta</p>
                            <p>{{ detalle.ruta ?? '-' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Método</p>
                            <p>{{ detalle.metodo ?? '-' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">IP</p>
                            <p>{{ detalle.ip ?? '-' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Repeticiones</p>
                            <p>{{ detalle.veces }}×</p>
                        </div>
                        <div v-if="detalle.archivo">
                            <p class="text-xs text-gray-500">Archivo</p>
                            <p class="break-all">{{ detalle.archivo }}:{{ detalle.linea ?? '?' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500">Fecha</p>
                            <p>{{ formatearFecha(detalle.created_at) }}</p>
                        </div>
                    </div>

                    <div v-if="detalle.stack_trace">
                        <p class="text-xs text-gray-500 mb-1">Stack trace</p>
                        <pre
                            class="text-xs bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap">{{ detalle.stack_trace }}</pre>
                    </div>

                    <div v-if="detalle.contexto">
                        <p class="text-xs text-gray-500 mb-1">Contexto</p>
                        <pre
                            class="text-xs bg-gray-100 dark:bg-gray-800 rounded p-3 overflow-auto max-h-40 whitespace-pre-wrap">{{ detalle.contexto }}</pre>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton v-if="!detalle?.resuelto_en" color="success" variant="soft" icon="i-lucide-check"
                        label="Marcar resuelto" :loading="enviando" @click="cambiarEstado('resolver')" />
                    <UButton v-else color="warning" variant="soft" icon="i-lucide-rotate-ccw"
                        label="Reabrir" :loading="enviando" @click="cambiarEstado('reabrir')" />
                    <UButton color="neutral" variant="ghost" label="Cerrar" @click="mostrarDetalle = false" />
                </div>
            </template>
        </UModal>
    </FondoDefault>
</template>
