<script setup>
import { ref, onMounted, watch, h, computed } from "vue";
import { useReporteActions } from "~/composables/Usuarios/Reporte.js";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import ExportarPDFs from "~/components/paginas/ExportarPDFs.vue";
import { useClientesStore } from '~/stores/Formularios/Clientes';
import { useTecnicosStore } from '~/stores/Formularios/Tecnicos/Tecnico';
import Reporte from "~/components/paginas/Forms/Reporte.vue";
import { storeToRefs } from "pinia";
import PDFReporte from "~/components/paginas/PDFReporte.vue";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeReportes = useReporteStore()
const clienteStore = useClientesStore()
const tecnicoStore = useTecnicosStore()
const refresh = ref(1);
const showModal = ref(false);

const { Reportes } = storeToRefs(storeReportes)

async function llamadatos(cambio = false) {
    await storeReportes.traer(true, cambio);
    varView.datosActualizados()
}

const {
    verReporte,
    eliminarReportes,
    editarReporte,
    cerrar
} = useReporteActions({
    varView,
    notificaciones,
    llamadatos,
    refresh,
    show: showModal,
});

watch(() => showModal.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
            refresh.value++;
        }
    }
);

onMounted(async () => {
    await storeReportes.traer(false, false);
    await clienteStore.traer(true, true)
    await tecnicoStore.traer(true, true)
});

const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'equipo.nombre', header: 'Equipo' },
    { accessorKey: 'tipo', header: 'Tipo' },
    { accessorKey: 'tecnico.nombre', header: 'Técnico' },
    { accessorKey: 'cliente.nombre', header: 'Cliente' },
    { accessorKey: 'fecha', header: 'Fecha', sorted: true},
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')
            const color =
                estado === 'realizada' ? 'success' :
                    estado === 'En Revisión' ? 'warning' :
                        estado === 'eliminada' ? 'error' :
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

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Reportes de Mantenimientos',
        data: Reportes,
        llamadatos: llamadatos,
        columns: columns,
        excel: true,
        buttons: [
            { texto: 'Exportar', icon: 'lucide-file-text', accion: () => { varView.showExportarPDFs = true }, color: 'primary', variant: 'subtle' }
        ],
        filtros: [
            { columna: 'fecha_mes', columnaReal: 'fecha', placeholder: 'Mes', tipo: 'mes' },
            { columna: 'fecha_año', columnaReal: 'fecha', placeholder: 'Año', tipo: 'año' },
            { columna: 'estado', placeholder: 'Estado' },
        ],
    }
})
</script>

<template>
    <FondoDefault>
        <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
        <PDFReporte/>

    </FondoDefault>
    <Reporte v-if="varView.showNuevoRegistro"></Reporte>
    <ExportarPDFs v-if="varView.showExportarPDFs"></ExportarPDFs>
</template>
