<script setup>
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';

import { useCalendarioCitas } from '~/stores/Calendario.js'
import { computed, ref } from 'vue';
import { nombresMeses } from '~/data/Fechas.js'
import { storeToRefs } from 'pinia';
import { useCitaActions } from '~/composables/Usuarios/Cita';

const props = defineProps({
    citas: {
        type: Array,
        default: () => []
    },
    Propiedades: {
        type: [Array, Object],
        default: () => []
    }
});

const varView = useVarView();
const calendarioCitasStore = useCalendarioCitas();
const Citas = ref(props.Propiedades.citas);
const refresh = ref(0)
const showPendientes = ref(false)

const {
    fechaActual,
    fecha,
    dias,
    meses,
} = storeToRefs(calendarioCitasStore);

const {
    parseFechaISO,
    cancelarCita,
    actualizarCita,
    showMotivoCancelacion,
    showObservacion,
    activarCita,
    agregarCita,
    cerrar,
} = useCitaActions({
    llamadatos: () => {},
    refresh,
    show: varView.showNuevaCita,
    isEditing: varView.isEditing,
    fecha
})

// Citas filtradas segun dia seleccionado
const citasFiltradas = computed(() => {
    return Citas.value?.filter(cita => {
        if (!cita.fecha || cita.estado === 'cancelada') return false;

        const fechaInicio = new Date(cita.fecha);
        const fechaFin = cita.fechaHasta ? new Date(cita.fechaHasta) : null;
        const fechaSeleccionada = new Date(fecha.value.split('/').reverse().join('-'));

        if (fechaFin) {
            if (cita.estado === 'Inactiva' && fecha.value === fechaActual.value) {
                return fechaSeleccionada >= fechaInicio && fechaSeleccionada <= fechaFin;
            } else {
                return fechaSeleccionada.getTime() === fechaInicio.getTime();
            }
        } else {
            return fechaSeleccionada.getTime() === fechaInicio.getTime();
        }
    });
});


// Pendientes
const pendientes = computed(() => {
    return Citas.value?.filter(cita => {
        if (!cita.fecha) return false;
        const fechaInicio = new Date(cita.fecha);
        const fechaActualDate = new Date(fechaActual.value.split('/').reverse().join('-'));
        return fechaInicio < fechaActualDate && cita.estado === 'Inactiva';
    }) ?? [];
});

// Nombre del mes
const mes = computed(() => {
    const [dia, mes, anio] = fecha.value.split('/').map(Number);
    return nombresMeses[mes - 1]
});

// Fecha de la cita Hoy
const fechaCita = computed(() => {
    if (fechaActual.value === fecha.value) {
        return 'Hoy'
    } else {
        return `${fecha.value.split('-')[0]}`
    }
});

function vencida(cita) {
    if (!cita.fechaHasta) {
        cita.fechaHasta = cita.fecha
    }

    const now = new Date()
    const fechaHoy = parseFechaISO(now.toISOString().split('T')[0])
    const fechaHasta = parseFechaISO(cita.fechaHasta)

    return fechaHoy > fechaHasta
}

const contenedorCitas = ref(null)
function changeShowPendientes() {
    if (contenedorCitas.value) {
        contenedorCitas.value.scrollTop = 0
    }
    showPendientes.value = !showPendientes.value

}

</script>

<template>
    <!--Citas  -->
    <div ref="contenedorCitas" :class="props.Propiedades.estilos"
        class="pb-5 flex flex-col gap-3 shadow-md rounded-xl md:h-[64vh] h-[50vh] overflow-y-auto bg-white dark:bg-gray-700 scrollForm relative">
        <div class="flex justify-between items-center px-6 py-3 sticky top-0 bg-white dark:bg-gray-700 shadow-xs z-3">
            <p class="text-xl font-semibold">
                {{ calendarioCitasStore.diaSemana }}, {{ dias }} {{ mes }}
            </p>
            <ButtonRounded
                :color="!showPendientes ? 'bg-gray-400 dark:bg-gray-800 text-gray-700 dark:text-gray-400 w-fit! flex gap-1 px-2' : 'bg-blue-500 hover:bg-blue-600 text-white w-fit! flex gap-1 px-2'"
                tooltip="Mostrar/Ocultar Pendientes" tooltipPosition="top" @click="changeShowPendientes">
                <i :class="!showPendientes ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i> {{
                    pendientes.length.toLocaleString('es-ES') }}
            </ButtonRounded>
        </div>


        <!-- Citas de Hoy -->
        <div class="grid gap-2 px-4"
            :class="{ 'xl:grid-cols-3 lg:grid-cols-2': varView.showEnFila || !varView.showCalendario, 'xl:grid-cols-2 lg:grid-cols-1': !varView.showEnFila }">
            <!-- Card Citas -->

            <template v-if="!unref(props.Propiedades.citas)">
                <div v-for="i in 2" :key="i" :class="Propiedades.tamaño"
                    class="w-full p-4 shadow-md bg-white dark:bg-gray-700 flex flex-col gap-4 animate-pulse">
                    <!-- HEADER -->
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <div class="flex flex-col gap-2">
                            <div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div class="w-20 h-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                        </div>
                    </div>
                    <!-- BODY -->
                    <div class="space-y-2">
                        <div class="w-full h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        <div class="w-3/4 h-3 bg-gray-200 dark:bg-gray-500 rounded"></div>
                    </div>
                    <!-- FOOTER -->
                    <div class="flex gap-2 pt-2">
                        <div class="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div class="w-16 h-6 bg-gray-200 dark:bg-gray-500 rounded-full"></div>
                    </div>
                </div>
            </template>

            <div v-for="cita in citasFiltradas" :key="cita.id"
                class="transition-all duration-300">
                <UCard class="hover:shadow-xl hover:-translate-y-1 border-l-4" :class="[
                    cita.estado === 'cancelada' && 'border-red-500 bg-red-50 dark:bg-red-900/30',
                    vencida(cita) && cita.estado === 'Inactiva' && 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                ]">

                    <!-- HEADER -->
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <div class="text-center">
                                <p class="text-lg font-bold text-primary">
                                    {{ cita.hora ? cita.hora.substring(0, 5) : '--:--' }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {{ props.Propiedades.showTodas ? cita.fecha : fechaCita }}
                                </p>
                            </div>

                            <div>
                                <h3 class="font-semibold text-gray-800 dark:text-white">
                                    {{ cita.nombre_equipo }}
                                </h3>
                                <p class="text-sm text-gray-500">
                                    {{ cita.nombre_cliente }}
                                </p>
                            </div>
                        </div>

                        <UBadge :color="cita.estado === 'realizada' ? 'success' :
                                cita.estado === 'cancelada' ? 'error' :
                                    'warning'
                            " variant="soft" class="capitalize">
                            {{ cita.estado }}
                        </UBadge>
                    </div>

                    <!-- BODY -->
                    <div class="mt-4 space-y-2 text-sm">
                        <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <UIcon name="i-heroicons-user" />
                            {{ cita.nombre_tecnico }}
                        </div>

                        <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <UIcon name="i-heroicons-wrench" />
                            {{ cita.tipo }}
                        </div>
                    </div>

                    <!-- FOOTER -->
                    <div class="flex justify-between items-center mt-4">

                        <div class="flex gap-2">
                            <UButton v-if="cita.estado === 'inactiva'" size="xs" color="error" variant="soft"
                                icon="i-heroicons-x-mark" @click="cancelarCita(cita)" />

                            <UButton v-if="cita.estado === 'inactiva'" size="xs" color="warning" variant="soft"
                                icon="i-heroicons-pencil" @click="actualizarCita(cita)" />

                            <UButton v-if="cita.estado === 'inactiva'" size="xs" color="success" variant="soft"
                                icon="i-heroicons-check" @click="activarCita(cita)" />
                        </div>

                        <UButton v-if="cita.motivo_edicion || cita.estado !== 'inactiva'" size="xs" color="neutral"
                            variant="ghost" icon="i-heroicons-information-circle" @click="
                                cita.estado === 'cancelada'
                                    ? showMotivoCancelacion(cita)
                                    : cita.estado === 'Realizada'
                                        ? showObservacion(cita)
                                        : showMotivoEdicion(cita)
                                " />
                    </div>

                </UCard>
            </div>

        </div>

        <div v-if="citasFiltradas.length < 1"
            class="w-full py-8 flex justify-center">
            <h2 class="text-lg text-gray-500">No hay citas programadas.</h2>
        </div>

    </div>
</template>

<style>
.btnsPaginaCard button {
    background: linear-gradient(to left, var(--color-default), var(--color-default-700));
}
</style>