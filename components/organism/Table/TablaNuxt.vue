<script setup>
import ButtonRounded from "~/components/atoms/Buttons/ButtonRounded.vue";
import { ref, onMounted, watch, h, resolveComponent } from "vue";

import { useOrdenamiento } from "~/composables/Tabla/useDatosOrdenadosTabla";
import { usePaginacion } from "~/composables/Tabla/usePaginacion";

const mostrarFiltros = ref(false)
const mostrarFiltrosAvanzados = ref(false)

const props = defineProps({
    Propiedades: {
        type: [Object, Array],
        requiered: true,
        default: {}
    }
}); console.log(props.Propiedades)

const data = ref(props.Propiedades.data);
// Acomodar datos de menor a mayor segun columna, filtros
const {
    busqueda,
    filtros,
    filtrosConOpciones,
    sortedItems,
    datosOrdenados,
    columnaOrden,
    menorAMayor,
    borrarFiltros
} = useOrdenamiento(data || ref([]), props.Propiedades.filtros || [], props.Propiedades.noFiltrar || []);


// Paginador
const {
    paginaActual,
    itemsPorPagina,
    totalPaginas,
    ultimaPagina,
    cambiarItemsPorPagina,
    siguientePagina,
    paginaAnterior,
    irAPagina,
    datosPaginados,
} = usePaginacion(datosOrdenados);

</script>

<template>
    <UCard class="mb-3">
        <template #header>
            <div class="flex justify-between items-center">
                <h3 class="font-bold text-lg">{{ props.Propiedades.titulo }}</h3>
                <div class="flex gap-2">
                    <UButton v-for="button in props.Propiedades.buttons" variant="soft" color="primary" loading-auto
                        :trailing-icon="button.icon" size="md" @click="button.accion">
                        {{ button.texto }}
                    </UButton>
                    <client-only v-if="Propiedades.excel">
                        <UDropdownMenu>
                            <UButton variant="solid" color="primary" trailing-icon="lucide-table" size="md">
                                Exportar
                            </UButton>

                            <template #profile-trailing>
                                <div class="flex flex-col gap-2 p-2">
                                    <download-excel class="flex gap-1 hover:text-white"
                                        :data="Array.isArray(datosOrdenados) ? unref(datosOrdenados) : unref(props.Propiedades.data)"
                                        :name="props.Propiedades.titulo" type="xlsx">
                                        <i class="fa-solid fa-download"></i>
                                        <p class="text-xs">Descargar</p>
                                    </download-excel>

                                    <div class="flex gap-1 hover:text-white" @click="varView.showDatosExcel = true">
                                        <i class="fa-solid fa-gear"></i>
                                        <p class="text-xs">Configurar</p>
                                    </div>
                                </div>
                            </template>
                        </UDropdownMenu>
                    </client-only>

                    <UButton @click="() => { mostrarFiltros = !mostrarFiltros }" variant="solid" color="primary"
                        trailing-icon="lucide-list-filter" size="md">
                        Filtrar
                    </UButton>
                    <UButton v-if="props.Propiedades.agregar" @click="props.Propiedades.agregar" variant="solid"
                        color="primary" trailing-icon="lucide-plus" size="md">
                        Agregar
                    </UButton>
                </div>
            </div>
            <div v-if="mostrarFiltros" class="w-full">
                <div class="w-full py-4">
                    <USeparator></USeparator>
                </div>
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-filter text-gray-400"></i>
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Filtros de la tabla
                            <span v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '') || columnaOrden"
                                class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                Filtros activos
                            </span>
                        </p>
                    </div>

                    <div class="flex gap-2">
                        <ButtonRounded v-if="filtrosConOpciones.length > 3"
                            @click="mostrarFiltrosAvanzados = !mostrarFiltrosAvanzados"
                            :color="mostrarFiltrosAvanzados ? 'bg-blue-800 dark:bg-blue-700' : 'bg-gray-800 text-gray-700 dark:bg-gray-700 dark:text-gray-200'"
                            tooltip="Filtros Avanzados">
                            <i class="fa-solid fa-sliders"></i>
                        </ButtonRounded>
                        <ButtonRounded
                            v-if="busqueda !== '' || Object.values(filtros).some(v => v !== '') || columnaOrden"
                            color="dark:text-gray-200 dark:bg-red-600 text-gray-700 bg-red-400"
                            tooltip="Limpiar filtros" tooltipPosition="top" @click="borrarFiltros">
                            <i class="fa-solid fa-xmark"></i>
                        </ButtonRounded>
                    </div>
                </div>

                <div class="flex flex-wrap items-end justify-between gap-3"">
                    <UInput v-model="busqueda" placeholder="Buscar dato en la Tabla..." icon="lucide-search"
                    variant="outline" size="lg" class="md:w-90 w-full" />

                <div class="flex flex-wrap justify-end gap-3">
                    <USelect v-for="(filtro, key) in filtrosConOpciones.slice(0, 3)" :key="key"
                        v-model="filtros[filtro.columna]" :placeholder="filtro.placeholder"
                        :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos,]" class="md:w-45 w-full" />
                </div>
            </div>
            <div v-if="mostrarFiltrosAvanzados"
                class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-end">
                <USelect v-for="(filtro, key) in filtrosConOpciones.slice(3)" :key="key"
                    v-model="filtros[filtro.columna]" :placeholder="filtro.placeholder"
                    :items="[{ label: 'Todos', value: 'all' }, ...filtro.datos,]" class="w-full" />
            </div>
            </div>
        </template>
    </UCard>
    <UTable sticky :data="datosPaginados" :columns="Propiedades.columns" :loading="!props.Propiedades.data"
        class="flex-1 max-h-[62vh]" />
    <div class="flex justify-between mt-3">
        <UPagination v-model:page="paginaActual" active-color="primary" active-variant="subtle" :sibling-count="1"
            :total="datosOrdenados.length" :items-per-page="itemsPorPagina"></UPagination>
        <p class="text-sm text-gray-500 md:flex gap-1 hidden">
            Mostrando
            <span class="text-gray-500">{{ ultimaPagina - itemsPorPagina + 1 }} al {{ ultimaPagina }}</span>
            <span class="text-gray-500">de {{ datosOrdenados.length }}</span>
        </p>
    </div>
</template>
