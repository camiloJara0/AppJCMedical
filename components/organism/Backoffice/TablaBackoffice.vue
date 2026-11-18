<script setup>
const props = defineProps({
    titulo: { type: String, default: '' },
    subtitulo: { type: String, default: '' },
    columns: { type: Array, required: true },
    cargador: { type: Function, required: true },
    filtros: { type: Array, default: () => [] },
    botones: { type: Array, default: () => [] },
    conBusqueda: { type: Boolean, default: true },
    altura: { type: String, default: 'max-h-[55vh]' }
})

const filas = ref([])
const cargando = ref(false)
const pagina = ref(1)
const total = ref(0)
const ultimaPagina = ref(1)
const porPagina = ref(25)
const mostrarFiltros = ref(false)
const busqueda = ref('')
const valoresFiltros = reactive({})

props.filtros.forEach(f => {
    valoresFiltros[f.columna] = f.valor ?? ''
})

let temporizador = null

async function cargar() {
    cargando.value = true
    try {
        const params = {
            page: pagina.value,
            por_pagina: porPagina.value
        }

        if (props.conBusqueda && busqueda.value) {
            params.buscar = busqueda.value
        }

        props.filtros.forEach(f => {
            const valor = valoresFiltros[f.columna]
            if (valor && valor !== 'all') params[f.columna] = valor
        })

        const respuesta = await props.cargador(params)

        filas.value = respuesta?.data ?? []
        total.value = respuesta?.meta?.total ?? filas.value.length
        ultimaPagina.value = respuesta?.meta?.ultima_pagina ?? 1
    } catch (e) {
        filas.value = []
        total.value = 0
        throw e
    } finally {
        cargando.value = false
    }
}

function alEscribir() {
    clearTimeout(temporizador)
    temporizador = setTimeout(() => {
        pagina.value = 1
        cargar()
    }, 400)
}

function cambiarFiltro() {
    pagina.value = 1
    cargar()
}

function cambiarPagina(valor) {
    pagina.value = valor
    cargar()
}

function cambiarPorPagina(evento) {
    porPagina.value = parseInt(evento.target.value, 10)
    pagina.value = 1
    cargar()
}

async function refrescar() {
    await cargar()
}

function hayFiltrosActivos() {
    return busqueda.value !== '' || Object.values(valoresFiltros).some(v => v && v !== 'all')
}

function limpiarFiltros() {
    busqueda.value = ''
    props.filtros.forEach(f => {
        valoresFiltros[f.columna] = ''
    })
    pagina.value = 1
    cargar()
}

defineExpose({ refrescar })

onMounted(cargar)
</script>

<template>
    <UCard class="mb-3">
        <template #header>
            <div class="flex justify-between items-center gap-2">
                <div>
                    <h3 class="font-bold text-lg">{{ titulo }}</h3>
                    <p v-if="subtitulo" class="text-xs text-gray-500 dark:text-gray-400">{{ subtitulo }}</p>
                </div>
                <div class="flex flex-wrap justify-end gap-2">
                    <UButton v-for="boton in botones" :key="boton.label" :color="boton.color ?? 'primary'"
                        :variant="boton.variant ?? 'solid'" :icon="boton.icono" size="md" @click="boton.accion">
                        <span class="hidden md:block">{{ boton.label }}</span>
                    </UButton>
                    <UButton v-if="filtros.length || conBusqueda" variant="solid" color="primary"
                        trailing-icon="lucide-list-filter" size="md" @click="mostrarFiltros = !mostrarFiltros">
                        <span class="hidden md:block">Filtrar</span>
                    </UButton>
                    <UButton icon="i-lucide-cloud-sync" color="primary" variant="ghost" size="md" @click="cargar" />
                </div>
            </div>

            <div v-if="mostrarFiltros" class="w-full">
                <div class="w-full py-4">
                    <USeparator />
                </div>
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-filter text-gray-400" />
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-300">
                            Filtros
                            <span v-if="hayFiltrosActivos()"
                                class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                                Filtros activos
                            </span>
                        </p>
                    </div>
                    <UButton v-if="hayFiltrosActivos()" color="error" variant="soft" icon="i-lucide-x" size="sm"
                        @click="limpiarFiltros">
                        Limpiar
                    </UButton>
                </div>

                <div class="flex flex-wrap items-end justify-between gap-3">
                    <UInput v-if="conBusqueda" v-model="busqueda" placeholder="Buscar..."
                        icon="lucide-search" variant="outline" size="lg" class="md:w-90 w-full"
                        @update:model-value="alEscribir" />
                    <div class="md:flex flex-wrap justify-end gap-3 w-full md:w-fit grid grid-cols-2">
                        <USelect v-for="filtro in filtros" :key="filtro.columna" v-model="valoresFiltros[filtro.columna]"
                            :placeholder="filtro.placeholder" :items="filtro.opciones" class="md:w-45 w-full"
                            @update:model-value="cambiarFiltro" />
                    </div>
                </div>
            </div>
        </template>
    </UCard>

    <UTable sticky :loading="cargando" loading-color="primary" loading-animation="carousel" :data="filas"
        :columns="columns" :class="altura" class="flex-1" />

    <div class="flex justify-between mt-3 flex-wrap gap-2">
        <UPagination :page="pagina" active-color="primary" active-variant="subtle" :sibling-count="1"
            :total="total" :items-per-page="porPagina" @update:page="cambiarPagina" />
        <p class="text-sm text-gray-500 md:flex gap-1 hidden items-center">
            Mostrando <span>{{ filas.length }}</span> de <span>{{ total }}</span>
            <select name="numRegistros"
                class="ml-3 text-sm bg-transparent border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                @change="cambiarPorPagina">
                <option value="10">10</option>
                <option value="25" selected>25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </p>
    </div>
</template>
