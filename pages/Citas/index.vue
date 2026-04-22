<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue'
import PDFServicio from '~/components/paginas/PDFServicio.vue'
import Cita from '~/components/paginas/Cita.vue'
import Reporte from '~/components/paginas/Reporte.vue'

import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder'
import { CalendarioBuilder, CitasBuilder } from '~/build/Constructores/CalendarioBuilder'
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { ref, onMounted } from 'vue'
import { CardBuilder } from '~/build/Constructores/CardBuilder'
import { TablaBuilder } from '~/build/Constructores/TablaBuilder'
import { useCitaActions } from '~/composables/Usuarios/Cita'
import { useSistemasStore } from '~/stores/Formularios/Sistemas/Sistema'
import TablaNuxt from '~/components/organism/Table/TablaNuxt.vue'
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue'
import { eliminarCita } from '~/Core/Citas/DeleteCitas'


const varView = useVarView()
const citasStore = useCitasStore();
const citas = ref([]);

const calendarioCitasStore = useCalendarioCitas();
const storeSistemas = useSistemasStore()
const show = ref(false);
const sistemas = ref([])
const refresh = ref(1);

onMounted(async () => {
    citas.value = await citasStore.traer(false)
    await llamadatos()
    // Rellenar fecha del formulario
    citasStore.Formulario.Cita.fecha = calendarioCitasStore.fecha.split('/').reverse().join('-')

    sistemas.value = await storeSistemas.traer();
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

async function llamadatos() {
    citas.value = await citasStore.traer();
    varView.datosActualizados()
}
// Watch para actualizar citas al agregar nueva
watch(() => varView.showNuevaCita,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
        }
    }
);

watch(() => varView.showActualizarCita,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => varView.showNuevoRegistro,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
        }
    }
);

// Funciones para manejar la visibilidad de los formularios
// Funciones para manejar visibilidad de Pagina
const showFila = () => {
    varView.showEnFila = !varView.showEnFila
};

const showCalendario = () => {
    varView.showCalendario = !varView.showCalendario
};

function citaEliminada(cita) {
    if (cita.estado == 'Inactiva') {
        return 'borrar'
    } else if (cita.estado == 'cancelada') {
        return 'observacion eliminada'
    }
}

function isCancelarCita(cita) {
    if (cita.estado == 'cancelada') {
        showMotivoCancelacion(cita)
    } else {
        cancelarCita(cita)
    }
}

function isActualizarCita(cita) {
    if (cita.estado == 'Inactiva') {
        return 'actualizar'
    }
}

function citaRealizada(cita) {
    if (cita.estado == 'Realizada') {
        return 'observacion completada'
    } else if (cita.estado == 'Inactiva') {
        return 'completar'
    }
}

function isActivarCita(cita) {
    if (cita.estado == 'Realizada') {
        showObservacion(cita)
    } else if (cita.estado == 'Inactiva') {
        activarCita(cita)
    }
}

// Construccion de pagina
const builderCalendario = new CalendarioBuilder()

const propiedades = computed(() => {

    const builderCitas = new CitasBuilder()
    const tablabuilder = new TablaBuilder()
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
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }


    pagina
        .setFondo('FondoDefault')
    if (!varView.showEnFila) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de tu Agenda',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    { text: 'En Lista', icon: 'fa-solid fa-table', color: 'neutral', variant: 'subtle', action: showFila },
                    { text: 'Calendario', icon: 'fa-solid fa-calendar', color: varView.showCalendario ? 'primary' : 'neutral', variant: 'subtle', action: showCalendario },
                    puedePost ? { text: 'Agendar', icon: 'fa-solid fa-plus', color: 'primary', action: agregarCita } : '',
                ]
            })
            .addComponente('Citas', builderCitas
                .setCitas(citas)
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
                    .setCitas(citas)
                )
        } else {
            pagina
                .setContenedor('grid grid-cols-1 gap-3')
        }
    } else if (varView.showEnFila) {
        pagina
            .setHeaderPage({
                titulo: 'Calendario de tu Agenda',
                descripcion: 'Visualiza y administra la agenda de citas.',
                button: [
                    { text: 'En Lista', icon: 'fa-solid fa-table', color: 'bg-blue-700', action: showFila },
                    puedePost ? { text: 'Agendar', icon: 'fa-solid fa-plus', color: 'bg-blue-500', action: agregarCita } : '',
                ]
            })
            .setContenedor('grid grid-cols-1 gap-3')
        if (varView.showEnTabla) {
            pagina
                .addComponente('TablaNuxt', tablabuilder
                    .setColumnas([
                        { titulo: 'fecha', value: 'Fecha', tamaño: 110, ordenar: true },
                        { titulo: 'name_paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                        { titulo: 'name_medico', value: 'Profesional', tamaño: 200 },
                        { titulo: 'motivo', value: 'Motivo', tamaño: 200 },
                        { titulo: 'servicio', value: 'Servicio', tamaño: 200 },
                        { titulo: 'estado', value: 'Estado', tamaño: 100, ordenar: true },
                    ])
                    .setHeaderTabla({
                        color: 'bg-[var(--color-default)] text-white',
                        buscador: true,
                        excel: true,
                        filtros: [
                            { columna: 'servicio', placeholder: 'Servicio', },
                            { columna: 'estado', placeholder: 'Estado', },
                            { columna: 'name_medico', placeholder: 'Profesional' },
                            { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
                            { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
                        ],
                        noBuscarPor: ['name_medico']
                    })
                    .setDatos(citas)
                    .setAcciones(
                        {
                            icons: [
                                { icon: isActualizarCita, action: actualizarCita },
                                { icon: citaEliminada, action: isCancelarCita },
                                { icon: citaRealizada, action: isActivarCita },
                            ], botones: true
                        }
                    )
                )
        } else {
            pagina
                .addComponente('Citas', builderCitas
                    .setCitas(citas)
                    .setShowTodas(true)
                )
        }

    }
    return pagina.build()
})

const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre_tecnico', header: 'Técnico' },
    { accessorKey: 'nombre_cliente', header: 'Cliente' },
    { accessorKey: 'nombre_equipo', header: 'Equipo' },
    { accessorKey: 'tipo', header: 'Tipo' },
    { accessorKey: 'fecha', header: 'Fecha' },
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
    if(cita.estado !== 'inactiva') {
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

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestionar Citas',
        agregar: agregarCita,
        data: citas,
        columns: columns,
        buttons: [
            { icon: 'lucide-table', accion: showFila, texto: 'En lista', color: 'neutral', variant: 'subtle'}
        ],
        filtros: [
            {columna: 'nombre_cliente', placeholder: 'Cliente'},
            {columna: 'tipo', placeholder: 'Tipo'},
            {columna: 'estado', placeholder: 'Estado'},
            {columna: 'nombre_equipo', placeholder: 'Equipo'},
        ]
    }
})
// console.log(propiedades)
</script>

<template>
    <Pagina v-if="!varView.showEnFila" :Propiedades="propiedades" :key="refresh" />
    <FondoDefault v-if="varView.showEnFila">
        <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
    </FondoDefault>
    <PDFServicio v-if="varView.showPDFServicio"></PDFServicio>
    <Cita />
    <Reporte v-if="varView.showNuevoRegistro" />
</template>