<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import FondoBlur from "../atoms/Fondos/FondoBlur.vue";
import { useCitaActions } from "~/composables/Usuarios/Cita.js";

const citasStore = useCitasStore()
const { showReporteVariosEquipos, Equiposcita, CitaSeleccionada } = storeToRefs(citasStore)

const {
    activarCitaVariosEquipos
} = useCitaActions({
    llamadatos: () => { },
    refresh: 0,
    show: '',
    isEditing: '',
    fecha: '',
})

const busqueda = ref('')

const equiposFiltrados = computed(() => {
    if (!busqueda.value) return CitaSeleccionada.value?.equipos || []

    const filtro = busqueda.value.toLowerCase()

    return CitaSeleccionada.value?.equipos?.filter(
        equipo =>
            equipo.nombre?.toLowerCase().includes(filtro) ||
            equipo.serie?.toLowerCase().includes(filtro)
    ) || []
})
</script>

<template>
    <FondoBlur v-if="showReporteVariosEquipos">
        <div
            class="w-full max-w-6xl h-[85vh] overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col mx-5">
            <!-- Header -->
            <div
                class="border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-primary-500/10 via-primary-500/5 to-transparent">
                <OrganismFormsWizard :Propiedades="{
                    tituloFormulario: 'Equipos asignados a la cita'
                }" :cerrar="() => {
            citasStore.showReporteVariosEquipos = false
        }" />

                <div class="px-6 pb-6">
                    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div>
                            <div class="flex items-center gap-3 mt-3">
                                <div
                                    class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                    <UIcon name="i-lucide-monitor-smartphone" class="w-6 h-6 text-primary" />
                                </div>

                                <div>
                                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                                        Reporte de Equipos
                                    </h2>

                                    <p class="text-sm text-gray-500 dark:text-gray-400">
                                        Selecciona un equipo para generar su reporte técnico.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <UBadge color="primary" variant="soft" size="lg">
                            {{ Equiposcita.length }} Equipos
                        </UBadge>

                    </div>

                    <!-- Buscador -->
                    <div class="mt-5">
                        <UInput v-model="busqueda" icon="i-lucide-search" size="lg" class="md:w-1/3 w-full"
                            placeholder="Buscar equipo por nombre o serie..." />
                    </div>
                </div>
            </div>

            <!-- Contenido -->
            <div class="flex-1 overflow-y-auto p-6">

                <div v-if="equiposFiltrados.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <div v-for="equipo in equiposFiltrados" :key="equipo.id"
                        class="group rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:-translate-y-1">
                        <!-- Icono -->
                        <div class="flex justify-between items-start mb-4">
                            <div
                                class="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                                <UIcon name="i-lucide-cpu" class="w-7 h-7 text-primary" />
                            </div>

                            <UBadge :color="equipo.pivot.estado == 'pendiente' ? 'warning' : 'success'" variant="soft">
                                {{ equipo.pivot.estado == 'pendiente' ? 'Pendiente' : 'Realizada' }}
                            </UBadge>
                        </div>

                        <!-- Información -->
                        <div class="space-y-3">
                            <div>
                                <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
                                    {{ equipo.nombre }}
                                </h3>

                                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    Serie: {{ equipo.serie }}
                                </p>
                            </div>

                            <UDivider />

                            <div class="space-y-2 text-sm">

                                <div class="flex items-center gap-2">
                                    <UIcon name="i-lucide-hash" class="text-gray-400" />
                                    <span class="text-gray-600 dark:text-gray-300">
                                        {{ equipo.serie }}
                                    </span>
                                </div>

                                <div v-if="equipo.marca" class="flex items-center gap-2">
                                    <UIcon name="i-lucide-building-2" class="text-gray-400" />
                                    <span class="text-gray-600 dark:text-gray-300">
                                        {{ equipo.marca }}
                                    </span>
                                </div>

                                <div v-if="equipo.modelo" class="flex items-center gap-2">
                                    <UIcon name="i-lucide-box" class="text-gray-400" />
                                    <span class="text-gray-600 dark:text-gray-300">
                                        {{ equipo.modelo }}
                                    </span>
                                </div>

                            </div>
                        </div>

                        <!-- Acción -->
                        <div class="mt-5">
                            <UButton v-if="equipo.pivot.estado == 'pendiente'" block size="lg" color="primary" icon="i-lucide-file-text"
                                @click="activarCitaVariosEquipos(equipo)">
                                Generar Reporte
                            </UButton>
                        </div>
                    </div>
                </div>

                <!-- Empty state -->
                <div v-else class="h-full flex flex-col items-center justify-center">
                    <UIcon name="i-lucide-search-x" class="w-20 h-20 text-gray-300" />

                    <h3 class="mt-4 text-lg font-semibold">
                        No se encontraron equipos
                    </h3>

                    <p class="text-gray-500">
                        Intenta con otro criterio de búsqueda.
                    </p>
                </div>

            </div>
        </div>
    </FondoBlur>
</template>

<style>
/* Opcional: animación suave para el modal */
.UModal {
    transition: all 0.3s ease-in-out;
}
</style>
