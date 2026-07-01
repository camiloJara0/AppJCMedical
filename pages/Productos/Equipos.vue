<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { ref, onMounted, watch } from "vue";
import { useEquipoActions } from "~/composables/Usuarios/Equipo.js";
import { useEquiposBuilder } from "~/build/Equipos/useEquiposBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useEquiposStore } from "~/stores/Formularios/Equipos/Equipo";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import { useTipo_equiposStore } from "~/stores/Formularios/Tipo_equipos/Tipo_equipo";
import { useClientesStore } from "~/stores/Formularios/Clientes";
import Cliente from "~/components/paginas/Forms/Cliente.vue";
import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";
import { useReporteActions } from "~/composables/Usuarios/Reporte";
import PDFReporte from "~/components/paginas/PDFReporte.vue";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import UltimoReporte from "~/components/paginas/UltimoReporte.vue";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeEquipos = useEquiposStore()
const storeTipoEquipos = useTipo_equiposStore()
const storeClientes = useClientesStore()
const storeCitas = useCitasStore()

const refresh = ref(1);
const active = ref(false);
const isEditing = ref(false);
const tiposEquipos = ref([])
const clientes = ref([])
const showHistorial = ref(false)
const equipoSeleccionado = ref()
const storeReportes = useReporteStore()
const reportes = ref([])
const citasActivas = ref([])
const ultimoReporte = ref({})

const { Equipos } = storeToRefs(storeEquipos)

async function llamadatos(cambio = false) {
    await storeEquipos.traer(true, cambio);
    varView.datosActualizados()
}

const {
    agregarEquipo,
    verEquipo,
    cerrar,
    eliminarEquipos
} = useEquipoActions({
    storeEquipos,
    varView,
    notificaciones,
    llamadatos,
    refresh,
    show: active,
    isEditing
});

const {
    verReporte,
    editarReporte,
} = useReporteActions({
    varView,
    notificaciones,
    llamadatos,
    refresh,
    show: false,
});

watch(() => active.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
            refresh.value++;
        }
    }
);

onMounted(async () => {
    await storeEquipos.traer(false);
    const listaTipoEquipos = await storeTipoEquipos.traer(true, true, true);
    tiposEquipos.value = listaTipoEquipos.map(c => { return { label: c.nombre, value: c.id } })

    const listaClientes = await storeClientes.traer(true, true, true);
    clientes.value = listaClientes.map(c => { return { label: c.nombre, value: c.id } })
    clientes.value.unshift({ label: 'Agregar Cliente', icon: 'i-lucide-plus', onSelect: () => { storeClientes.showNuevoCliente = true }, })
    await llamadatos();
});

const propiedadesFormulario = computed(() =>
    useEquiposBuilder({
        storeId: "RegistroEquipo",
        storePinia: "Equipos",
        cerrar: cerrar,
        active,
        isEditing,
        tiposEquipos: tiposEquipos.value,
        clientes: clientes.value,
    })
)

// Tabla de Equipos
const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'marca', header: 'Marca' },
    { accessorKey: 'modelo', header: 'Modelo' },
    { accessorKey: 'serie', header: 'Serie' },
    { accessorKey: 'ubicacion', header: 'Ubicación' },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')

            const color =
                estado === 'activo'
                    ? 'success'
                    : estado === 'inactivo'
                        ? 'neutral'
                        : 'warning'
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
                { class: 'text-right flex gap-1' },
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
                ),
                h('div', { class: 'text-right' }, h(UButton, {
                    icon: 'i-lucide-arrow-right',
                    color: 'primary',
                    variant: 'ghost',
                    onClick: () => seleccionarEquipo(row.original)
                }))
            )
    },
]

function getRowItems(row) {
    const categoria = row.original

    return [
        {
            type: 'label',
            label: 'Acciones'
        },
        {
            label: 'Editar',
            onSelect() {
                verEquipo(categoria)
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarEquipos(categoria)
            }
        }
    ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Equipos',
        agregar: agregarEquipo,
        llamadatos: llamadatos,
        data: Equipos,
        columns: columns,
        filtros: [
            { columna: 'ubicacion', placeholder: 'Ubicacion' },
            { columna: 'marca', placeholder: 'Marca' },
            { columna: 'estado', placeholder: 'Estado' },
        ],
    }
})

// Tabla de Reportes
const columnsReporte = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'tipo', header: 'Tipo' },
    { accessorKey: 'tecnico.nombre', header: 'Técnico' },
    { accessorKey: 'cliente.nombre', header: 'Cliente' },
    { accessorKey: 'fecha', header: 'Fecha', sorted: true },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const reporte = row.original
            const estado = reporte.resultado_reporte?.estado || 'Sin Estado'
            const color =
            estado === 'Requiere Reemplazo' ? 'warning' :
                estado === 'No Reparable' ? 'error' :
                    estado === 'Reparado' ? 'success' : 'Mantenimiento Realizado' ? 'success' : 'Sin Falla' ? 'success' :
                            'neutral'
            return h(UBadge, { variant: 'subtle', color, class: 'capitalize' }, () => estado)
        }
    },
    {
        id: 'actions',
        cell: ({ row }) =>
            h(
                'div',
                { class: 'text-right' },
                row.original.estado !== 'realizada' && row.original.estado !== 'En Revisión' && row.original.estado !== 'eliminada' ?
                    h(
                        UButton,
                        {
                            icon: 'i-lucide-pencil',
                            color: 'warning',
                            variant: 'ghost',
                            label: 'open',
                            onClick: () => editarReporte(row.original)
                        },
                        () => 'Editar'
                    ) :
                    h(
                        UButton,
                        {
                            icon: 'i-lucide-eye',
                            color: 'primary',
                            variant: 'ghost',
                            label: 'open',
                            onClick: () => verReporte(row.original)
                        },
                        () => 'Ver'
                    ),

            )
    }
]

// Tabla Citas
const columnsCitas = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'tecnico.nombre', header: 'Técnico' },
    { accessorKey: 'cliente.nombre', header: 'Cliente' },
    {
        accessorKey: 'equipo_id',
        header: 'Equipo',
        cell: ({ row }) => {
            const data = row.original
            // Caso: equipo único
            if (data.equipo && data.equipo.nombre) {
                const nombre = data.equipo.nombre
                return nombre.length > 35 ? nombre.substring(0, 35) + '...' : nombre
            }

            // Caso: varios equipos
            if (data.equipos && data.equipos.length > 0) {
                return 'Varios Equipos'
            }

            // Caso: ninguno
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
]



async function seleccionarEquipo(equipo) {
    equipoSeleccionado.value = equipo;
    storeEquipos.Formulario.Equipo = JSON.parse(JSON.stringify(equipo));

    await cargarHistorial(equipo.id);
    showHistorial.value = true;
}

async function cargarHistorial(id) {
    reportes.value = storeReportes.Reportes.filter((r) => {
        return r.equipo_id === id && r.estado === 'realizada'
    })

    citasActivas.value = storeCitas.Citas.filter((c) => {
        if (Array.isArray(c.equipo_id)) {
            return c.equipo_id.includes(id) && c.estado === 'inactiva';
        }
        return c.equipo_id === id && c.estado === 'inactiva';
    })

    ultimoReporte.value = reportes.value.reduce((latest, current) => {
        const latestDate = new Date(latest.fecha);
        const currentDate = new Date(current.fecha);
        return currentDate > latestDate ? current : latest;
    }, reportes.value[0] || null)
}

const fechaLegible = computed(() =>
    new Date(ultimoReporte.value.fecha + 'T00:00:00').toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
)
</script>

<template>
    <FondoDefault>
        <Form :Propiedades="propiedadesFormulario" />
        <Cliente />
        <PDFReporte />

        <TablaNuxt v-if="!showHistorial" :Propiedades="propiedadesTabla" />

        <div v-else-if="showHistorial && equipoSeleccionado" class="space-y-4">

            <div class="space-y-4">

                <!-- Paciente -->
                <UCard
                    class="bg-linear-to-r from-(--color-default-500) to-(--color-default-600) text-white shadow-lg border-0">

                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <!-- Datos -->
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <div
                                    class="size-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <i class="fa-solid fa-gears text-lg"></i>
                                </div>

                                <div>
                                    <h2 class="font-semibold text-sm md:text-base truncate">
                                        {{ equipoSeleccionado.nombre }}
                                    </h2>

                                    <div class="flex gap-3 items-center">
                                        <p class="text-sm text-neutral-100 dark:text-neutral-100">
                                            {{ equipoSeleccionado.marca }} {{ equipoSeleccionado.modelo }} · {{
                                                equipoSeleccionado.ubicacion }}
                                        </p>

                                        <!-- <div class="flex flex-wrap items-center gap-2">
                                            <UBadge color="primary" variant="soft" class="font-mono">
                                                Placa {{ equipoSeleccionado.placa }}
                                            </UBadge>
                                            <UBadge color="neutral" variant="subtle" class="font-mono">
                                                Serie {{ equipoSeleccionado.serie }}
                                            </UBadge>
                                            <UBadge color="primary" variant="subtle">
                                                <UIcon name="i-lucide-calendar" class="mr-1 size-3.5" />
                                                {{ fechaLegible }}
                                            </UBadge>
                                        </div> -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <!-- Botón volver -->
                            <UButton icon="i-lucide-arrow-left" color="white" variant="soft"
                                @click="showHistorial = false">
                                Regresar
                            </UButton>
                        </div>

                    </div>

                </UCard>

            </div>

            <div>
                <!-- Secciones Principales con Tabs -->
                <UTabs :items="[
                    { slot: 'mantenimientos', label: 'Mantenimientos', icon: 'i-lucide-clipboard' },
                    { slot: 'trabajos', label: 'Trabajos', icon: 'i-lucide-calendar' },
                    { slot: 'estado', label: 'Estado', icon: 'i-lucide-file-text' },
                ]" class="w-full">
                    <!-- Reportes -->
                    <template #mantenimientos>
                        <div class="space-y-4 pt-4">
                            <div class="space-y-4">
                                <TablaNuxt :key="`reportes-${refreshKey}`" :Propiedades="{
                                    titulo: 'Historial de reportes',
                                    data: reportes,
                                    columns: columnsReporte,
                                }" />
                            </div>
                        </div>
                    </template>

                    <!-- Citas -->
                    <template #trabajos>
                        <div class="space-y-4 pt-4">
                            <div class="space-y-4">
                                <TablaNuxt :key="`reportes-${refreshKey}`" :Propiedades="{
                                    titulo: 'Trabajos pendientes',
                                    data: citasActivas,
                                    columns: columnsCitas,
                                }" />
                            </div>
                        </div>
                    </template>

                    <!-- Ultimo Reporte -->
                    <template #estado>
                        <div class=" space-y-6 p-4">
                            <UltimoReporte v-if="ultimoReporte" :reporte="ultimoReporte" />
                            <p v-else class="text-sm text-neutral-500">Este equipo aún no tiene reportes.</p>
                        </div>
                    </template>

                </UTabs>
            </div>

        </div>
    </FondoDefault>
</template>
