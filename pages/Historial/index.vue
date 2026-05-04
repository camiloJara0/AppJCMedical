<script setup>
import { ref, onMounted, watch, h, computed } from "vue";
import { useReporteActions } from "~/composables/Usuarios/Reporte.js";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import FondoBlur from "~/components/atoms/Fondos/FondoBlur.vue";
import { imprimirReporte } from "~/Core/Reportes/ImpirmirReporte";
import ExportarPDFs from "~/components/paginas/ExportarPDFs.vue";
import { useClientesStore } from '~/stores/Formularios/Clientes';
import { useTecnicosStore } from '~/stores/Formularios/Tecnicos/Tecnico';
import Reporte from "~/components/paginas/Reporte.vue";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeReportes = useReporteStore()
const clienteStore = useClientesStore()
const tecnicoStore = useTecnicosStore()
const reportes = ref([]);
const refresh = ref(1);
const showModal = ref(false);

async function llamadatos(cambio = false) {
    reportes.value = await storeReportes.traer(true, false, cambio);
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

watch(() => varView.showNuevoRegistro,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos(true);
            refresh.value++;
        }
    }
);

onMounted(async () => {
    reportes.value = await storeReportes.traer();
    await clienteStore.traer(true, true)
    await tecnicoStore.traer(true, true)
    await llamadatos();
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
        data: reportes,
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

const reporte = computed(() => storeReportes.Formulario)
</script>

<template>
    <FondoDefault>
        <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>

        <!-- Modal Reportes con Nuxt UI -->
        <FondoBlur v-if="showModal">
            <div class="rounded-lg shadow-lg animate-fadeIn md:w-[60%] w-[90%]">
                <UCard :ui="{ divide: 'divide-y divide-gray-100 dark:divide-gray-800 ' }">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-bold">Detalle del Reporte</h2>
                            <div class="flex gap-1">
                                <UButton v-if="reporte.Reporte.estado !== 'eliminada'" color="error" variant="ghost"
                                    icon="i-lucide-trash" class="cursor-pointer" loading-auto
                                    @click="eliminarReportes(reporte.Reporte)" />
                                <UButton color="primary" variant="ghost" icon="i-lucide-printer" class="cursor-pointer"
                                    loading-auto @click="imprimirReporte(reporte.Reporte?.id)" />
                                <UButton color="neutral" variant="ghost" icon="i-heroicons-x-mark-20-solid"
                                    class="cursor-pointer" @click="cerrar()" />
                            </div>
                        </div>
                    </template>

                    <div class="space-y-6 overflow-y-auto max-h-[60vh]">
                        <!-- Información General -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                <i class="fa-solid fa-info-circle"></i> Información General
                            </h3>
                            <div class="grid grid-cols-2 gap-4">
                                <div class="border-l-4 border-blue-500 pl-4">
                                    <p class="text-xs text-gray-500 uppercase">ID Reporte</p>
                                    <p class="font-semibold">{{ reporte.Reporte?.id || '-' }}</p>
                                </div>
                                <div class="border-l-4 border-green-500 pl-4">
                                    <p class="text-xs text-gray-500 uppercase">Fecha</p>
                                    <p class="font-semibold">{{ reporte.Reporte?.fecha || '-' }}</p>
                                </div>
                                <div class="border-l-4 border-purple-500 pl-4">
                                    <p class="text-xs text-gray-500 uppercase">Cliente</p>
                                    <p class="font-semibold">{{ reporte.cliente?.nombre || '-' }}</p>
                                </div>
                                <div class="border-l-4 border-orange-500 pl-4">
                                    <p class="text-xs text-gray-500 uppercase">Técnico</p>
                                    <p class="font-semibold">{{ reporte.tecnico?.nombre || '-' }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Equipo -->
                        <div v-if="reporte.equipo" class="space-y-4">
                            <h3 class="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                <i class="fa-solid fa-cogs"></i> Equipo - Cliente
                            </h3>
                            <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <p class="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                                <p class="font-bold text-lg">{{ reporte.equipo.nombre || '-' }}</p>
                                <p class="text-md font-medium">Marca: {{ reporte.equipo.marca || '-' }}, Modelo: {{
                                    reporte.equipo.modelo ||
                                    '-' }}, Serie: {{ reporte.equipo.serie || '-' }}, Placa: {{ reporte.equipo.placa ||
                                    '-' }}</p>
                                <p class="text-md">Estado: {{ reporte.equipo.estado || '-' }}</p>

                                <p class="text-sm text-gray-600 dark:text-gray-400 pt-3">Cliente</p>
                                <p class="font-bold text-lg">{{ reporte.cliente?.nombre || '-' }}</p>
                                <p class="font-semibold">{{ reporte.cliente?.telefono || '-' }} - {{
                                    reporte.cliente?.correo || '-' }}</p>
                            </div>
                        </div>

                        <!-- Componentes -->
                        <div v-if="Object.keys(reporte.componentes || {}).length > 0" class="space-y-4">
                            <h3 class="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                <i class="fa-solid fa-microchip"></i> Estado de Componentes
                            </h3>
                            <div class="grid grid-cols-2 gap-3">
                                <div v-for="(comp, id) in reporte.componentes" :key="id" class="border rounded-lg p-3">
                                    <div class="flex items-center justify-between mb-2 w-full ">
                                        <p class="font-semibold text-sm truncate">{{ comp.componente?.nombre }} - {{ comp.id }}</p>
                                        <UBadge
                                            :color="comp.estado === 'bueno' ? 'success' : comp.estado === 'regular' ? 'warning' : 'error'"
                                            variant="subtle">
                                            {{ comp.estado || '-' }}
                                        </UBadge>
                                    </div>
                                    <p v-if="comp.observacion" class="text-xs text-gray-600 italic">{{ comp.observacion
                                        }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Materiales Utilizados -->
                        <div v-if="reporte.materiales?.length > 0" class="space-y-4">
                            <h3 class="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                <i class="fa-solid fa-boxes-stacked"></i> Materiales Utilizados
                            </h3>
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr class="border-b">
                                            <th class="text-left py-2">Descripción</th>
                                            <th class="text-right py-2">Cantidad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(mat, idx) in reporte.materiales" :key="idx"
                                            class="border-b hover:bg-gray-50">
                                            <td class="py-2">{{ mat.descripcion }}</td>
                                            <td class="text-right font-semibold">{{ mat.cantidad }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Mediciones -->
                        <div v-if="reporte.mediciones?.length > 0" class="space-y-4">
                            <h3 class="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                <i class="fa-solid fa-ruler"></i> Mediciones Realizadas
                            </h3>
                            <div class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr class="border-b">
                                            <th class="text-left py-2">Variable</th>
                                            <th class="text-center py-2">Unidad</th>
                                            <th class="text-center py-2">Medido</th>
                                            <th class="text-center py-2">Esperado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(med, idx) in reporte.mediciones" :key="idx"
                                            class="border-b hover:bg-gray-50">
                                            <td class="py-2">{{ med.variable }}</td>
                                            <td class="text-center">{{ med.unidad }}</td>
                                            <td class="text-center font-semibold">{{ med.valor_medido }}</td>
                                            <td class="text-center">{{ med.valor_esperado }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Repuestos Requeridos -->
                        <div v-if="reporte.repuestos?.length > 0" class="space-y-4">
                            <h3 class="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                <i class="fa-solid fa-screwdriver-wrench"></i> Repuestos/Accesorios Requeridos
                            </h3>
                            <div class="flex flex-wrap gap-2">
                                <UBadge v-for="(rep, idx) in reporte.repuestos" :key="idx" variant="soft" color="blue">
                                    {{ rep.nombre }}
                                </UBadge>
                            </div>
                        </div>

                        <!-- Actividades -->
                        <div v-if="reporte.actividades" class="space-y-4">
                            <h3 class="text-lg font-semibold text-blue-600 flex items-center gap-2">
                                <i class="fa-solid fa-list-check"></i> Actividades Realizadas
                            </h3>
                            <div class="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                                <p class="text-sm whitespace-pre-wrap">{{ reporte.actividades.descripcion }}</p>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <div class="flex justify-end gap-3">
                            <UButton color="neutral" variant="soft" @click="cerrar()">
                                Cerrar
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </div>
        </FondoBlur>

    </FondoDefault>
    <Reporte v-if="varView.showNuevoRegistro"></Reporte>
    <ExportarPDFs v-if="varView.showExportarPDFs"></ExportarPDFs>
</template>
