<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'
import Form from '~/components/organism/Forms/Form.vue'
import PDFServicio from '~/components/paginas/PDFServicio.vue'
import Cita from '~/components/paginas/Forms/Cita.vue'
import Reporte from '~/components/paginas/Forms/Reporte.vue'

import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { CalendarioBuilder, CitasBuilder } from '~/build/Constructores/CalendarioBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { useSolicitudesCitasStore } from '~/stores/Formularios/SolicitudesCitas'
import { ref, onMounted, watch, h } from 'vue'
import { CardBuilder } from '~/build/Constructores/CardBuilder'
import { useCitaActions } from '~/composables/Usuarios/Cita'
import { useSolicitudCitaActions } from '~/composables/Usuarios/SolicitudCita'
import { useSolicitudCitaBuilder } from '~/build/SolicitudesCitas/useSolicitudCitaBuilder'
import { useSistemasStore } from '~/stores/Formularios/Sistemas/Sistema'
import { useTecnicosStore } from '~/stores/Formularios/Tecnicos/Tecnico'
import { useClientesStore } from '~/stores/Formularios/Clientes'
import { useEquiposStore } from '~/stores/Formularios/Equipos/Equipo'
import TablaNuxt from '~/components/organism/Table/TablaNuxt.vue'
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { eliminarCita } from '~/Core/Citas/DeleteCitas'
import { useReporteStore } from '~/stores/Formularios/Reportes/Reporte'
import { storeToRefs } from 'pinia'
import ReporteVariosEquipos from '~/components/paginas/ReporteVariosEquipos.vue'
import AccionDerivada from '~/components/paginas/AccionDerivada.vue'

const varView = useVarView()
const citasStore = useCitasStore();
const storeSolicitudes = useSolicitudesCitasStore()
const tecnicosStore = useTecnicosStore()
const clienteStore = useClientesStore()
const equipoStore = useEquiposStore()

const calendarioCitasStore = useCalendarioCitas();
const storeSistemas = useSistemasStore()
const storeReportes = useReporteStore()
const show = ref(false);
const showSolicitudesModal = ref(false);
const showConvertirCitaModal = ref(false);
const sistemas = ref([])
const refresh = ref(1);

// Formulario para convertir en cita
const formConvertirCita = ref({
  tecnico_id: '',
  fecha: '',
  hora: '',
})

const {showActividadDerivada} = storeToRefs(varView)
const { Citas } = storeToRefs(citasStore)
const { SolicitudesCitas } = storeToRefs(storeSolicitudes)

onMounted(async () => {
    await citasStore.traer(false)
    await storeSolicitudes.traer(false)
    await llamadatos()
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')
    sistemas.value = await storeSistemas.traer();
    await tecnicosStore.traer(false);
    await clienteStore.traer(false);
    await equipoStore.traer(false);
});

const {
    fecha,
    meses,
    fechaActual
} = storeToRefs(calendarioCitasStore);

const {
    cancelarCita,
    actualizarCita,
    showMotivoCancelacion,
    showObservacion,
    activarCita,
    agregarCita,
    cerrar,
} = useCitaActions({
    llamadatos,
    refresh,
    show: varView.showNuevaCita,
    isEditing: varView.isEditing,
    fecha
})

const {
    verSolicitud,
    responderSolicitud,
    cerrar: cerrarSolicitud,
    eliminarSolicitudModal,
} = useSolicitudCitaActions({
    llamadatos: async () => await storeSolicitudes.traer(true, true),
    refresh,
    show: showSolicitudesModal,
    isEditing: varView.isEditing,
})

async function llamadatos(cambio = false) {
    await citasStore.traer(true, cambio);
    varView.datosActualizados()
}

watch(() => varView.showNuevaCita,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
        }
    }
);

watch(() => varView.showNuevoRegistro,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
            await storeReportes.traer(true, true);
        }
    }
);

watch(() => showSolicitudesModal.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await storeSolicitudes.traer(true, true);
        }
    }
);

// Funciones de vista - MUTUAMENTE EXCLUSIVAS
function showFila() {
    varView.showEnFila = true
    varView.showCalendario = false
    varView.showSolicitudes = false
}

function showCalendarioView() {
    varView.showCalendario = !varView.showCalendario
    varView.showEnFila = false
    varView.showSolicitudes = false
}

function showSolicitudesView() {
    varView.showSolicitudes = true
    varView.showEnFila = false
    varView.showCalendario = false
    storeSolicitudes.traer(true, true)
}

function showAgendaView() {
    varView.showSolicitudes = false
    varView.showEnFila = false
    varView.showCalendario = true
}

// Convertir solicitud en cita
async function abrirConvertirEnCita(solicitud) {
    storeSolicitudes.SolicitudCitaSeleccionada = JSON.parse(JSON.stringify(solicitud))

    // Pre-llenar datos del formulario
    formConvertirCita.value = {
      tecnico_id: '',
      fecha: new Date().toISOString().split('T')[0],
      hora: '08:00',
    }

    showConvertirCitaModal.value = true
    varView.showSolicitudes = false
}

async function confirmarConvertirEnCita() {
    const solicitud = storeSolicitudes.SolicitudCitaSeleccionada
    if (!solicitud) return

    if (!formConvertirCita.value.tecnico_id) {
      const notificaciones = useNotificacionesStore()
      notificaciones.options.icono = 'warning'
      notificaciones.options.titulo = 'Campo requerido'
      notificaciones.options.texto = 'Selecciona un técnico'
      notificaciones.options.tiempo = 3000
      notificaciones.simple()
      return
    }

    if (!formConvertirCita.value.fecha) {
      const notificaciones = useNotificacionesStore()
      notificaciones.options.icono = 'warning'
      notificaciones.options.titulo = 'Campo requerido'
      notificaciones.options.texto = 'Selecciona una fecha'
      notificaciones.options.tiempo = 3000
      notificaciones.simple()
      return
    }

    const config = useRuntimeConfig()
    const token = localStorage.getItem('token')

    // Buscar o crear cliente
    let cliente_id = solicitud.cliente_id
    if (!cliente_id && solicitud.NIT) {
      // Intentar crear el cliente
      try {
        const respCliente = await fetch(`${config.public.api}/api/cliente`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            nombre: solicitud.nombre_contacto,
            correo: solicitud.correo,
            telefono: solicitud.telefono,
            NIT: solicitud.NIT,
            estado: 'activo',
          })
        })
        if (respCliente.ok) {
          const dataCliente = await respCliente.json()
          cliente_id = dataCliente.id
        }
      } catch (e) {
        console.error('Error al crear cliente:', e)
      }
    }

    // Buscar o crear equipo
    let equipo_id = solicitud.equipo_id
    if (!equipo_id && solicitud.serial_equipo) {
      try {
        // Necesitamos un tipo_equipo_id, usar uno por defecto o buscar
        const tiposResp = await fetch(`${config.public.api}/api/tipo_equipo`, {
          headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}` }
        })
        let tipoEquipoId = 1
        if (tiposResp.ok) {
          const tipos = await tiposResp.json()
          if (tipos.length > 0) tipoEquipoId = tipos[0].id
        }

        const respEquipo = await fetch(`${config.public.api}/api/equipo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            cliente_id: cliente_id,
            tipo_equipo_id: tipoEquipoId,
            nombre: solicitud.tipo_equipo_descripcion || solicitud.marca + ' ' + solicitud.modelo,
            marca: solicitud.marca,
            modelo: solicitud.modelo,
            serie: solicitud.serial_equipo,
            estado: 'activo',
          })
        })
        if (respEquipo.ok) {
          const dataEquipo = await respEquipo.json()
          equipo_id = dataEquipo.id
        }
      } catch (e) {
        console.error('Error al crear equipo:', e)
      }
    }

    // Crear la cita
    try {
      const respCita = await fetch(`${config.public.api}/api/cita`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tecnico_id: formConvertirCita.value.tecnico_id,
          cliente_id: cliente_id,
          equipo_id: equipo_id,
          tipo: solicitud.tipo_cita,
          fecha: formConvertirCita.value.fecha,
          hora: formConvertirCita.value.hora,
        })
      })

      if (respCita.ok) {
        // Actualizar estado de la solicitud
        await storeSolicitudes.actualizar({
          id: solicitud.id,
          estado: 'convertida_cita',
          respuesta_admin: `Convertida en cita el ${new Date().toLocaleDateString('es-CO')}`,
        })

        const notificaciones = useNotificacionesStore()
        notificaciones.options.icono = 'success'
        notificaciones.options.titulo = '¡Cita creada!'
        notificaciones.options.texto = 'La solicitud fue convertida en cita exitosamente'
        notificaciones.options.tiempo = 3000
        notificaciones.simple()

        showConvertirCitaModal.value = false
        storeSolicitudes.SolicitudCitaSeleccionada = null
        await storeSolicitudes.traer(true, true)
        await llamadatos(true)
      }
    } catch (e) {
      console.error('Error al crear cita:', e)
      const notificaciones = useNotificacionesStore()
      notificaciones.options.icono = 'error'
      notificaciones.options.titulo = 'Error'
      notificaciones.options.texto = 'No se pudo crear la cita'
      notificaciones.options.tiempo = 3000
      notificaciones.simple()
    }
}

function cerrarConvertirCita() {
    showConvertirCitaModal.value = false
    storeSolicitudes.SolicitudCitaSeleccionada = null
    varView.showSolicitudes = true
}

// Construccion de pagina
const builderCalendario = new CalendarioBuilder()

const propiedades = computed(() => {

    const builderCitas = new CitasBuilder()
    const pagina = new ComponenteBuilder()

    const puedeVer = true;
    const puedeGet = true;
    const puedePost = true

    if (!puedeVer && !puedePost && !puedeGet) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', new CardBuilder()
                .setCards(
                    [
                        {
                            header: {
                                html: `<div class="flex flex-col items-center justify-center h-full text-gray-500">
                                <i class="fa-solid fa-user-lock text-6xl mb-4"></i>
                                <h2 class="text-lg font-semibold">Acceso restringido</h2>
                                <p class="text-sm text-center">
                                    No tienes permisos para acceder a este módulo.
                                </p>
                                </div>`,
                            },
                        },
                        {

                        },
                        {

                        }
                    ]
                )
                .setcontenedorCards('flex flex-col')
                .setContenedor('w-full')
                .setTamaño('flex sm:flex-row justify-center items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Agenda de citas.')
                .setheaderHtml(`<NuxtLink to="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</NuxtLink>`)
                .build()
            )
        return pagina.build()
    }

    pagina
        .setFondo('FondoDefault')

        .setHeaderPage({
            titulo: 'Calendario de tu Agenda',
            descripcion: 'Visualiza y administra la agenda de citas.',
            button: [
                { icon: 'fa-solid fa-calendar-check', accion: showSolicitudesView, text: 'Solicitudes', color: 'warning', variant: 'subtle' },
                { text: 'En Lista', icon: 'fa-solid fa-table', color: 'neutral', variant: 'subtle', action: showFila },
                { text: 'Calendario', icon: 'fa-solid fa-calendar', color: varView.showCalendario ? 'primary' : 'neutral', variant: 'subtle', action: showCalendarioView },
                puedePost ? { text: 'Agendar', icon: 'fa-solid fa-plus', color: 'primary', action: agregarCita } : '',
            ]
        })
        .addComponente('Citas', builderCitas
            .setCitas(Citas)
            .setShowTodas(false)
            .setFiltros([
                { columna: 'servicio', placeholder: 'Servicio', },
                { columna: 'estado', placeholder: 'Estado', },
                { columna: 'name_medico', placeholder: 'Profesional' },
                { columna: 'fecha', placeholder: 'Mes', tipo: 'mes' }
            ])
        )
    if (varView.showCalendario) {
        pagina
            .setContenedor('grid lg:grid-cols-[1.7fr_1fr] md:grid-cols-[1fr_1fr] grid-cols-1 lg:gap-6 gap-3')
            .addComponente('Calendario', builderCalendario
                .setCitas(Citas)
                .setEstilos('order-1')
            )
    } else {
        pagina
            .setContenedor('grid grid-cols-1 gap-3')
    }
    return pagina.build()
})

// Columnas de Citas
const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'tecnico.nombre', header: 'Técnico' },
    { accessorKey: 'cliente.nombre', header: 'Cliente' },
    { 
        accessorKey: 'equipo_id', 
        header: 'Equipo',
        cell: ({ row }) => {
            const data = row.original
            if (data.equipo && data.equipo.nombre) {
            const nombre = data.equipo.nombre
            return nombre.length > 35 ? nombre.substring(0, 35) + '...' : nombre
            }
            if (data.equipos && data.equipos.length > 0) {
            return 'Varios Equipos'
            }
            return 'Sin equipo'
        }
    },
    { accessorKey: 'tipo', header: 'Tipo' },
    { accessorKey: 'fecha', header: 'Fecha', sorted: true },
    { accessorKey: 'hora', header: 'Hora' },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')
            const color =
                estado === 'realizada'
                    ? 'success'
                    : estado === 'inactiva'
                        ? 'neutral'
                        : 'error'
            return h(
                UBadge,
                { variant: 'subtle', color, class: 'capitalize' },
                () => estado
            )
        }
    },
    {
        id: 'actions',
        cell: ({ row }) =>
            h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: { align: 'end' },
                        items: getRowItems(row)
                    },
                    () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost'
                        })
                )
            )
    },
]

function getRowItems(row) {
    const cita = row.original
    if (cita.estado !== 'inactiva') {
        return [
            { type: 'label', label: 'Acciones' },
            {
                label: 'Observacion',
                onSelect() {
                    cita.estado === 'realizada' ? showObservacion(cita) : showMotivoCancelacion(cita)
                }
            },
        ]
    }
    return [
        { type: 'label', label: 'Acciones' },
        {
            label: 'Realizar',
            onSelect() {
                activarCita(cita)
            }
        },
        {
            label: 'Editar',
            onSelect() {
                actualizarCita(cita)
            }
        },
        { type: 'separator' },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarCita(cita)
            }
        },
        cita.ultimo_estado ? {
            label: 'Motivo Edicion',
            onSelect() {
                showMotivoEdicion(cita)
            }
        } : ''
    ]
}

// Columnas de Solicitudes de Cita
const columnsSolicitudes = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre_contacto', header: 'Contacto' },
    { accessorKey: 'NIT', header: 'NIT' },
    {
        accessorKey: 'serial_equipo',
        header: 'Serial Equipo',
        cell: ({ row }) => {
            const val = row.getValue('serial_equipo')
            return val || 'No registrado'
        }
    },
    {
        accessorKey: 'tipo_cita',
        header: 'Tipo Cita',
        cell: ({ row }) => {
            const tipo = row.getValue('tipo_cita')
            const labels = {
                mantenimiento: 'Mantenimiento',
                revision: 'Revisión',
                reparacion: 'Reparación',
                otro: 'Otro'
            }
            return labels[tipo] || tipo
        }
    },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')
            const color =
                estado === 'atendida'
                    ? 'success'
                    : estado === 'convertida_cita'
                        ? 'info'
                        : estado === 'rechazada'
                            ? 'error'
                            : estado === 'en_revision'
                                ? 'warning'
                                : 'neutral'
            return h(
                UBadge,
                { variant: 'subtle', color, class: 'capitalize' },
                () => estado.replace('_', ' ')
            )
        }
    },
    {
        accessorKey: 'created_at',
        header: 'Fecha Solicitud',
        cell: ({ row }) => {
            const fecha = row.getValue('created_at')
            if (!fecha) return ''
            return new Date(fecha).toLocaleDateString('es-CO')
        }
    },
    {
        id: 'actions',
        cell: ({ row }) =>
            h(
                'div',
                { class: 'text-right' },
                h(
                    UDropdownMenu,
                    {
                        content: { align: 'end' },
                        items: getRowItemsSolicitud(row)
                    },
                    () =>
                        h(UButton, {
                            icon: 'i-lucide-ellipsis-vertical',
                            color: 'neutral',
                            variant: 'ghost'
                        })
                )
            )
    },
]

function getRowItemsSolicitud(row) {
    const solicitud = row.original
    return [
        { type: 'label', label: 'Acciones' },
        {
            label: 'Responder',
            onSelect() {
                responderSolicitud(solicitud)
            }
        },
        {
            label: 'Convertir en Cita',
            onSelect() {
                abrirConvertirEnCita(solicitud)
            }
        },
        { type: 'separator' },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarSolicitudModal(solicitud)
            }
        }
    ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestionar Citas',
        agregar: agregarCita,
        llamadatos: llamadatos,
        data: Citas,
        columns: columns,
        buttons: [
            { icon: 'lucide-calendar-check', accion: showSolicitudesView, texto: 'Solicitudes', color: 'warning', variant: 'subtle' },
            { icon: 'lucide-table', accion: showAgendaView, texto: 'Agenda', color: 'neutral', variant: 'subtle' },
        ],
        filtros: [
            { columna: 'cliente.nombre', placeholder: 'Cliente' },
            { columna: 'tipo', placeholder: 'Tipo' },
            { columna: 'estado', placeholder: 'Estado' },
            { columna: 'equipo.nombre', placeholder: 'Equipo' },
        ]
    }
})

const propiedadesTablaSolicitudes = computed(() => {
    return {
        titulo: 'Solicitudes de Citas',
        llamadatos: async () => await storeSolicitudes.traer(true, true),
        data: SolicitudesCitas,
        columns: columnsSolicitudes,
        buttons: [
            { icon: 'lucide-calendar', accion: showAgendaView, texto: 'Agenda', color: 'warning', variant: 'subtle' },
            { icon: 'lucide-table', accion: showFila, texto: 'En lista', color: 'neutral', variant: 'subtle' },
        ],
        filtros: [
            { columna: 'nombre_contacto', placeholder: 'Contacto' },
            { columna: 'NIT', placeholder: 'NIT' },
            { columna: 'tipo_cita', placeholder: 'Tipo Cita' },
            { columna: 'estado', placeholder: 'Estado' },
        ]
    }
})

const propiedadesForm = computed(() => {
    return useSolicitudCitaBuilder({
        storeId: "ActualizarSolicitudCita",
        storePinia: "SolicitudCita",
        cerrar: cerrarSolicitud,
        active: showSolicitudesModal,
    })
})

// Computed para selects del modal convertir
const tecnicosList = computed(() => tecnicosStore.Tecnicos || [])
const solicitudSeleccionada = computed(() => storeSolicitudes.SolicitudCitaSeleccionada)
</script>

<template>
    <!-- Vista Calendario / Pagina -->
    <Pagina v-if="!varView.showEnFila && !varView.showSolicitudes" :Propiedades="propiedades" :key="refresh" />

    <!-- Vista Tabla de Citas -->
    <FondoDefault v-if="varView.showEnFila && !varView.showSolicitudes">
        <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
    </FondoDefault>

    <!-- Vista Solicitudes -->
    <FondoDefault v-if="varView.showSolicitudes">
        <TablaNuxt :Propiedades="propiedadesTablaSolicitudes"></TablaNuxt>
        <Form :Propiedades="propiedadesForm">
            <div class="p-4">
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-semibold text-gray-500">Contacto:</span>
                        <p>{{ storeSolicitudes.Formulario.SolicitudCita.nombre_contacto }}</p>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-500">NIT:</span>
                        <p>{{ storeSolicitudes.Formulario.SolicitudCita.NIT || 'No registrado' }}</p>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-500">Correo:</span>
                        <p>{{ storeSolicitudes.Formulario.SolicitudCita.correo || 'No registrado' }}</p>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-500">Teléfono:</span>
                        <p>{{ storeSolicitudes.Formulario.SolicitudCita.telefono || 'No registrado' }}</p>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-500">Serial:</span>
                        <p>{{ storeSolicitudes.Formulario.SolicitudCita.serial_equipo || 'No registrado' }}</p>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-500">Marca/Modelo:</span>
                        <p>{{ storeSolicitudes.Formulario.SolicitudCita.marca || '' }} {{ storeSolicitudes.Formulario.SolicitudCita.modelo || '' }}</p>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-500">Tipo Cita:</span>
                        <p class="capitalize">{{ storeSolicitudes.Formulario.SolicitudCita.tipo_cita }}</p>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-500">Estado:</span>
                        <p class="capitalize">{{ storeSolicitudes.Formulario.SolicitudCita.estado?.replace('_', ' ') }}</p>
                    </div>
                </div>
                <div class="mt-4">
                    <span class="font-semibold text-gray-500">Motivo:</span>
                    <p class="mt-1 text-gray-700">{{ storeSolicitudes.Formulario.SolicitudCita.motivo || 'No especificado' }}</p>
                </div>
            </div>
        </Form>
    </FondoDefault>

    <!-- Modal Convertir en Cita -->
    <FondoDefault v-if="showConvertirCitaModal">
        <div class="w-full max-w-lg">
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <i class="fa-solid fa-calendar-check text-blue-500 text-xl"></i>
                            <div>
                                <h3 class="font-bold text-lg">Convertir en Cita</h3>
                                <p class="text-sm text-gray-500" v-if="solicitudSeleccionada">
                                    {{ solicitudSeleccionada.nombre_contacto }} - {{ solicitudSeleccionada.serial_equipo || solicitudSeleccionada.marca || 'Sin equipo' }}
                                </p>
                            </div>
                        </div>
                        <UButton icon="i-lucide-x" color="neutral" variant="ghost" @click="cerrarConvertirCita" />
                    </div>
                </template>

                <div class="space-y-4">
                    <!-- Info de la solicitud -->
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm">
                        <div class="grid grid-cols-2 gap-2">
                            <div><span class="text-gray-500">Tipo:</span> <span class="capitalize">{{ solicitudSeleccionada?.tipo_cita }}</span></div>
                            <div><span class="text-gray-500">NIT:</span> {{ solicitudSeleccionada?.NIT || 'N/A' }}</div>
                            <div class="col-span-2"><span class="text-gray-500">Motivo:</span> {{ solicitudSeleccionada?.motivo || 'N/A' }}</div>
                        </div>
                    </div>

                    <!-- Selector de Técnico -->
                    <USelectMenu
                        v-model="formConvertirCita.tecnico_id"
                        :items="tecnicosList.map(t => ({ label: t.nombre, value: t.id }))"
                        placeholder="Seleccionar técnico"
                        label="Técnico *"
                    />

                    <!-- Fecha -->
                    <UInput
                        v-model="formConvertirCita.fecha"
                        type="date"
                        label="Fecha *"
                        placeholder="Fecha de la cita"
                    />

                    <!-- Hora -->
                    <UInput
                        v-model="formConvertirCita.hora"
                        type="time"
                        label="Hora"
                        placeholder="Hora de la cita"
                    />
                </div>

                <template #footer>
                    <div class="flex justify-end gap-2">
                        <UButton label="Cancelar" color="neutral" variant="subtle" @click="cerrarConvertirCita" />
                        <UButton label="Crear Cita" color="primary" icon="i-lucide-check" @click="confirmarConvertirEnCita" />
                    </div>
                </template>
            </UCard>
        </div>
    </FondoDefault>

    <ReporteVariosEquipos/>
    <PDFServicio v-if="varView.showPDFServicio"></PDFServicio>
    <AccionDerivada v-if="varView.showActividadDerivada"></AccionDerivada>
    <Cita />
    <Reporte v-if="varView.showNuevoRegistro" />
</template>
