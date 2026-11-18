<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import TablaBackoffice from '~/components/organism/Backoffice/TablaBackoffice.vue'
import { backoffice } from '~/Core/Backoffice/api'

definePageMeta({ middleware: 'backoffice', layout: 'default' })

const notificaciones = useNotificacionesStore()
const tabla = ref(null)

// ---- Formulario crear/editar rol ----
const mostrarForm = ref(false)
const editandoId = ref(null)
const guardando = ref(false)
const nombreRol = ref('')
const secciones = ref([])
const seleccionadas = ref([])

const gruposPermisos = computed(() => {
    const grupos = {}

    secciones.value.forEach(seccion => {
        const base = seccion.nombre.replace(/_(get|post|put|delete|access)$/, '')
        if (!grupos[base]) grupos[base] = []
        grupos[base].push(seccion)
    })

    return Object.entries(grupos)
        .map(([base, lista]) => ({
            base,
            lista: lista.sort((a, b) => a.nombre.localeCompare(b.nombre))
        }))
        .sort((a, b) => a.base.localeCompare(b.base))
})

function abrirCrear() {
    editandoId.value = null
    nombreRol.value = ''
    seleccionadas.value = []
    mostrarForm.value = true
}

async function abrirEditar(rol) {
    editandoId.value = rol.id
    nombreRol.value = rol.nombre

    try {
        const respuesta = await backoffice.permisosRol(rol.id)
        const asignados = respuesta?.asignados ?? []
        seleccionadas.value = asignados.map(String)
        mostrarForm.value = true
    } catch (e) {
        notificar('error', e.message || 'No se pudieron cargar los permisos del rol')
    }
}

function alternar(id) {
    const valor = String(id)
    const indice = seleccionadas.value.indexOf(valor)
    if (indice >= 0) seleccionadas.value.splice(indice, 1)
    else seleccionadas.value.push(valor)
}

async function guardar() {
    guardando.value = true
    try {
        const permisos = seleccionadas.value.map(Number)

        if (editandoId.value) {
            await backoffice.actualizarRol(editandoId.value, { nombre: nombreRol.value })
            await backoffice.sincronizarPermisos(editandoId.value, { permisos })
            notificar('success', 'Rol actualizado')
        } else {
            const respuesta = await backoffice.crearRol({ nombre: nombreRol.value })
            const idNuevo = respuesta?.data?.id
            if (idNuevo && permisos.length) {
                await backoffice.sincronizarPermisos(idNuevo, { permisos })
            }
            notificar('success', 'Rol creado')
        }

        mostrarForm.value = false
        await tabla.value?.refrescar()
    } catch (e) {
        notificar('error', e.message || 'No se pudo guardar el rol')
    } finally {
        guardando.value = false
    }
}

async function eliminar(rol) {
    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Eliminar rol?',
        html: `Se eliminará el rol <span>${rol.nombre}</span> y sus permisos.`,
        confirmtext: 'Sí, eliminar',
        canceltext: 'Atrás'
    }

    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    try {
        await backoffice.eliminarRol(rol.id)
        notificar('success', 'Rol eliminado')
        await tabla.value?.refrescar()
    } catch (e) {
        notificar('error', e.message || 'No se pudo eliminar el rol')
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

// ---- Columnas ----
const columns = [
    { accessorKey: 'id', header: 'ID', sorted: true },
    { accessorKey: 'nombre', header: 'Rol', sorted: true },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => h(UBadge, {
            variant: 'subtle',
            color: row.original.estado === 'activo' ? 'success' : 'neutral'
        }, () => row.original.estado)
    },
    {
        accessorKey: 'permisos_count',
        header: 'Permisos',
        cell: ({ row }) => h('span', { class: 'text-sm' }, String(row.original.permisos_count ?? 0))
    },
    {
        id: 'actions',
        cell: ({ row }) => h('div', { class: 'text-right' }, h(UDropdownMenu, {
            content: { align: 'end' },
            items: accionesDeFila(row.original)
        }, () => h(UButton, {
            icon: 'i-lucide-ellipsis-vertical',
            color: 'neutral',
            variant: 'ghost'
        })))
    }
]

function accionesDeFila(rol) {
    const esSuperAdmin = rol.nombre === 'SuperAdmin'

    const acciones = [
        { type: 'label', label: 'Acciones' },
        { label: 'Editar permisos', icon: 'i-lucide-shield', onSelect: () => abrirEditar(rol) },
        { type: 'separator' }
    ]

    if (esSuperAdmin) {
        acciones.push({
            label: 'Protegido (seeders)',
            icon: 'i-lucide-lock',
            disabled: true
        })
    } else {
        acciones.push({
            label: 'Eliminar',
            icon: 'i-lucide-trash-2',
            onSelect: () => eliminar(rol)
        })
    }

    return acciones
}

const propiedadesTabla = computed(() => ({
    titulo: 'Roles y permisos',
    subtitulo: 'Los roles otorgan acceso a secciones de la aplicación y al Backoffice',
    columns,
    cargador: () => backoffice.roles(),
    conBusqueda: false,
    filtros: [],
    botones: [
        { label: 'Nuevo rol', icono: 'lucide-plus', accion: abrirCrear }
    ]
}))

onMounted(async () => {
    try {
        const respuesta = await backoffice.secciones()
        secciones.value = respuesta?.data ?? []
    } catch {
        secciones.value = []
    }
})
</script>

<template>
    <FondoDefault>
        <div class="max-w-7xl mx-auto">
            <TablaBackoffice ref="tabla" v-bind="propiedadesTabla" />
        </div>

        <UModal v-model:open="mostrarForm" :title="editandoId ? `Editar rol: ${nombreRol}` : 'Nuevo rol'"
            :ui="{ content: 'max-w-2xl' }">
            <template #body>
                <div class="flex flex-col gap-4">
                    <UFormField label="Nombre del rol" required>
                        <UInput v-model="nombreRol" placeholder="Ej. Supervisor" class="w-full"
                            :disabled="editandoId !== null" />
                    </UFormField>

                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <p class="text-sm font-medium">Permisos ({{ seleccionadas.length }})</p>
                            <UButton size="xs" variant="soft" color="neutral"
                                label="Limpiar selección" @click="seleccionadas = []" />
                        </div>

                        <div class="max-h-72 overflow-y-auto border rounded-lg p-3 flex flex-col gap-3">
                            <div v-for="grupo in gruposPermisos" :key="grupo.base">
                                <p class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
                                    {{ grupo.base }}
                                </p>
                                <div class="flex flex-wrap gap-x-4 gap-y-1">
                                    <UCheckbox v-for="permiso in grupo.lista" :key="permiso.id"
                                        :model-value="seleccionadas.includes(String(permiso.id))"
                                        :label="permiso.nombre" size="sm"
                                        @update:model-value="alternar(permiso.id)" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton color="neutral" variant="ghost" label="Cancelar" @click="mostrarForm = false" />
                    <UButton color="primary" :label="editandoId ? 'Guardar cambios' : 'Crear rol'"
                        :loading="guardando" @click="guardar" />
                </div>
            </template>
        </UModal>
    </FondoDefault>
</template>
