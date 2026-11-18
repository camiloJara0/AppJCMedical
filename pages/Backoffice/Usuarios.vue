<script setup>
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import TablaBackoffice from '~/components/organism/Backoffice/TablaBackoffice.vue'
import { backoffice } from '~/Core/Backoffice/api'

definePageMeta({ middleware: 'backoffice', layout: 'default' })

const notificaciones = useNotificacionesStore()
const tabla = ref(null)

// ---- Formulario crear/editar ----
const mostrarForm = ref(false)
const editandoId = ref(null)
const guardando = ref(false)
const formulario = reactive({
    nombre: '',
    correo: '',
    contraseña: '',
    rol: 'Tecnico',
    rol_id: null,
    estado: 'activo'
})

const roles = ref([])

function abrirCrear() {
    editandoId.value = null
    Object.assign(formulario, {
        nombre: '',
        correo: '',
        contraseña: '',
        rol: 'Tecnico',
        rol_id: null,
        estado: 'activo'
    })
    mostrarForm.value = true
}

function abrirEditar(usuario) {
    editandoId.value = usuario.id
    Object.assign(formulario, {
        nombre: usuario.nombre ?? '',
        correo: usuario.correo ?? '',
        contraseña: '',
        rol: usuario.rol,
        rol_id: usuario.rol_id ?? null,
        estado: usuario.estado
    })
    mostrarForm.value = true
}

async function guardar() {
    guardando.value = true
    try {
        const cuerpo = {
            nombre: formulario.nombre,
            correo: formulario.correo,
            rol: formulario.rol,
            rol_id: formulario.rol_id || null,
            estado: formulario.estado
        }

        if (formulario.contraseña) {
            cuerpo.contraseña = formulario.contraseña
        }

        if (editandoId.value) {
            await backoffice.actualizarUsuario(editandoId.value, cuerpo)
            notificar('success', 'Usuario actualizado')
        } else {
            if (!formulario.contraseña || formulario.contraseña.length < 6) {
                throw new Error('La contraseña es obligatoria (mínimo 6 caracteres)')
            }
            await backoffice.crearUsuario(cuerpo)
            notificar('success', 'Usuario creado')
        }

        mostrarForm.value = false
        await tabla.value?.refrescar()
    } catch (e) {
        notificar('error', e.message || 'No se pudo guardar el usuario')
    } finally {
        guardando.value = false
    }
}

// ---- Sesiones ----
const mostrarSesiones = ref(false)
const sesiones = ref([])
const usuarioSesiones = ref(null)

async function verSesiones(usuario) {
    usuarioSesiones.value = usuario
    try {
        const respuesta = await backoffice.sesionesUsuario(usuario.id)
        sesiones.value = respuesta?.data ?? []
        mostrarSesiones.value = true
    } catch (e) {
        notificar('error', e.message || 'No se pudieron cargar las sesiones')
    }
}

async function revocarSesiones() {
    if (!usuarioSesiones.value) return
    try {
        const respuesta = await backoffice.revocarSesiones(usuarioSesiones.value.id)
        notificar('success', respuesta.message ?? 'Sesiones revocadas')
        sesiones.value = []
        await tabla.value?.refrescar()
    } catch (e) {
        notificar('error', e.message || 'No se pudieron revocar las sesiones')
    }
}

// ---- Estado ----
async function suspender(usuario) {
    if (usuario.rol === 'SuperAdmin') {
        notificar('warning', 'Un SuperAdmin no se puede suspender')
        return
    }

    notificaciones.options = {
        icono: 'warning',
        titulo: '¿Suspender usuario?',
        html: `Se suspenderá <span>${usuario.correo}</span> y se revocarán sus sesiones.`,
        confirmtext: 'Sí, suspender',
        canceltext: 'Atrás'
    }

    const respuesta = await notificaciones.alertRespuesta()
    if (respuesta !== 'confirmado') return

    try {
        await backoffice.suspenderUsuario(usuario.id, { motivo_suspension: 'Suspendido desde el Backoffice' })
        notificar('success', 'Usuario suspendido')
        await tabla.value?.refrescar()
    } catch (e) {
        notificar('error', e.message || 'No se pudo suspender')
    }
}

async function reactivar(usuario) {
    try {
        await backoffice.reactivarUsuario(usuario.id)
        notificar('success', 'Usuario reactivado')
        await tabla.value?.refrescar()
    } catch (e) {
        notificar('error', e.message || 'No se pudo reactivar')
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
    { accessorKey: 'nombre', header: 'Nombre', sorted: true },
    { accessorKey: 'correo', header: 'Correo', sorted: true },
    {
        accessorKey: 'rol',
        header: 'Rol',
        cell: ({ row }) => h(UBadge, {
            variant: 'subtle',
            color: row.original.rol === 'SuperAdmin' ? 'error' : row.original.rol === 'Admin' ? 'warning' : 'info'
        }, () => row.original.rol)
    },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => h(UBadge, {
            variant: 'subtle',
            color: row.original.estado === 'activo' ? 'success' : 'neutral'
        }, () => row.original.estado)
    },
    {
        accessorKey: 'ultimo_acceso_at',
        header: 'Último acceso',
        cell: ({ row }) => h('span', { class: 'text-xs text-gray-500' },
            formatearFecha(row.original.ultimo_acceso_at))
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

function accionesDeFila(usuario) {
    const acciones = [
        { type: 'label', label: 'Acciones' },
        { label: 'Editar', icon: 'i-lucide-pencil', onSelect: () => abrirEditar(usuario) },
        { label: 'Sesiones', icon: 'i-lucide-key-round', onSelect: () => verSesiones(usuario) },
        { type: 'separator' }
    ]

    if (usuario.estado === 'activo') {
        acciones.push({
            label: 'Suspender',
            icon: 'i-lucide-user-x',
            onSelect: () => suspender(usuario)
        })
    } else {
        acciones.push({
            label: 'Reactivar',
            icon: 'i-lucide-user-check',
            onSelect: () => reactivar(usuario)
        })
    }

    return acciones
}

function formatearFecha(valor) {
    if (!valor) return '-'
    return String(valor).replace('T', ' ').slice(0, 16)
}

async function cargarRoles() {
    try {
        const respuesta = await backoffice.roles()
        roles.value = (respuesta?.data ?? []).map(r => ({ label: r.nombre, value: r.id }))
    } catch {
        roles.value = []
    }
}

const opcionesEstado = [
    { label: 'Todos', value: 'all' },
    { label: 'Activos', value: 'activo' },
    { label: 'Inactivos', value: 'inactivo' }
]

const opcionesRol = [
    { label: 'Todos', value: 'all' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Tecnico', value: 'Tecnico' },
    { label: 'SuperAdmin', value: 'SuperAdmin' }
]

const propiedadesTabla = computed(() => ({
    titulo: 'Gestión de usuarios',
    subtitulo: 'Usuarios con acceso a la aplicación',
    columns,
    cargador: backoffice.usuarios,
    filtros: [
        { columna: 'estado', placeholder: 'Estado', valor: '', opciones: opcionesEstado },
        { columna: 'rol', placeholder: 'Rol', valor: '', opciones: opcionesRol }
    ],
    botones: [
        { label: 'Nuevo usuario', icono: 'lucide-plus', accion: abrirCrear }
    ]
}))

onMounted(cargarRoles)
</script>

<template>
    <FondoDefault>
        <div class="max-w-7xl mx-auto">
            <TablaBackoffice ref="tabla" v-bind="propiedadesTabla" />
        </div>

        <!-- Modal crear/editar usuario -->
        <UModal v-model:open="mostrarForm" :title="editandoId ? 'Editar usuario' : 'Nuevo usuario'"
            :ui="{ content: 'max-w-lg' }">
            <template #body>
                <div class="flex flex-col gap-4">
                    <UFormField label="Nombre" required>
                        <UInput v-model="formulario.nombre" placeholder="Nombre completo" class="w-full" />
                    </UFormField>

                    <UFormField label="Correo" required>
                        <UInput v-model="formulario.correo" type="email" placeholder="correo@ejemplo.com"
                            class="w-full" />
                    </UFormField>

                    <UFormField :label="editandoId ? 'Nueva contraseña (opcional)' : 'Contraseña'"
                        :required="!editandoId" :hint="editandoId ? 'Déjalo vacío para no cambiarla' : ''">
                        <UInput v-model="formulario.contraseña" type="password" class="w-full" />
                    </UFormField>

                    <div class="grid grid-cols-2 gap-4">
                        <UFormField label="Rol" required>
                            <USelect v-model="formulario.rol" :items="[
                                { label: 'Admin', value: 'Admin' },
                                { label: 'Tecnico', value: 'Tecnico' }
                            ]" class="w-full" />
                        </UFormField>

                        <UFormField label="Rol de permisos (opcional)">
                            <USelect v-model="formulario.rol_id" :items="[{ label: 'Ninguno', value: null }, ...roles]"
                                class="w-full" />
                        </UFormField>
                    </div>

                    <UFormField label="Estado">
                        <USelect v-model="formulario.estado" :items="[
                            { label: 'Activo', value: 'activo' },
                            { label: 'Inactivo', value: 'inactivo' }
                        ]" class="w-full" />
                    </UFormField>
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton color="neutral" variant="ghost" label="Cancelar" @click="mostrarForm = false" />
                    <UButton color="primary" :label="editandoId ? 'Guardar cambios' : 'Crear usuario'"
                        :loading="guardando" @click="guardar" />
                </div>
            </template>
        </UModal>

        <!-- Modal sesiones -->
        <UModal v-model:open="mostrarSesiones" :title="`Sesiones de ${usuarioSesiones?.correo ?? ''}`"
            :ui="{ content: 'max-w-2xl' }">
            <template #body>
                <div v-if="sesiones.length" class="flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                    <div v-for="sesion in sesiones" :key="sesion.id" class="py-2 text-sm">
                        <div class="flex items-center justify-between gap-2">
                            <span class="font-medium">{{ sesion.name }}</span>
                            <UBadge variant="subtle" color="neutral">{{ sesion.ip_address ?? 'IP desconocida' }}</UBadge>
                        </div>
                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {{ sesion.user_agent ?? 'Agente desconocido' }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            Creada: {{ formatearFecha(sesion.created_at) }} ·
                            Expira: {{ formatearFecha(sesion.expires_at) }}
                        </p>
                    </div>
                </div>
                <p v-else class="text-sm text-gray-500">El usuario no tiene sesiones activas.</p>
            </template>

            <template #footer>
                <div class="flex justify-end gap-2 w-full">
                    <UButton color="error" variant="soft" label="Revocar todas"
                        :disabled="!sesiones.length" @click="revocarSesiones" />
                    <UButton color="neutral" variant="ghost" label="Cerrar" @click="mostrarSesiones = false" />
                </div>
            </template>
        </UModal>
    </FondoDefault>
</template>
