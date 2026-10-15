<script setup>
import { ref, computed, watch, onMounted } from 'vue'

import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue'
import ButtonForm from '~/components/atoms/Buttons/ButtonForm.vue'
import { loadComponent } from '~/components/organism/Forms/componentLoader'
import { useFormulario, mapCamposLimpios } from '~/components/organism/Forms/useFormulario'
import { useReporteStore } from '~/stores/Formularios/Reportes/Reporte'

const props = defineProps({
    /** Configuración tipada de pasos generada por useReporteBuilder */
    Propiedades: {
        type: Object,
        required: true,
    },
})

const varView = useVarView()
const reporteStore = useReporteStore()

const {
    seccionActual,
    traerDatos,
    manejarClick,
    estadoGuardado,
    ultimoGuardado,
    faltantesSeccion,
    validarSeccion,
    progresoSeccion,
    progresoFormulario,
    irASeccion,
    getValue,
    setValue,
} = useFormulario(props, reporteStore.Formulario)

// ─────────────────────────────────────────────
// PASOS
// ─────────────────────────────────────────────
const storeId = computed(() => props.Propiedades.content?.storeId || '')
const pasos = computed(() => props.Propiedades.formulario?.secciones || [])
const pasoIndex = computed(() => Math.min(seccionActual.value, Math.max(pasos.value.length - 1, 0)))
const pasoActual = computed(() => pasos.value[pasoIndex.value] || null)
const esUltimoPaso = computed(() => pasoIndex.value >= pasos.value.length - 1)

const intentoAvance = ref(false)
const faltantes = computed(() => faltantesSeccion(pasoIndex.value))

/** Mapa de componentes cargados para el paso actual (Input, Select, GroupCampos...). */
const componentesPaso = computed(() => {
    const mapa = {}

    pasoActual.value?.bloques?.forEach((bloque) => {
        bloque.campos?.forEach((item) => {
            const campos = item.grupo ? item.campos || [] : [item]
            campos.forEach((campo) => {
                if (campo.component && !mapa[campo.component]) {
                    mapa[campo.component] = loadComponent(campo.component)
                }
            })
        })
    })

    return mapa
})

const textoSiguiente = computed(() => {
    if (!esUltimoPaso.value) return 'Siguiente'
    return props.Propiedades.formulario?.textoEnviar || 'Enviar reporte'
})

const horaGuardado = computed(() =>
    ultimoGuardado.value
        ? ultimoGuardado.value.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        : ''
)

function clasePaso(index) {
    if (progresoSeccion(index) >= 100) {
        return 'bg-green-500 border-green-500 text-white'
    }
    if (index === pasoIndex.value) {
        return 'bg-white border-white text-(--color-default) font-bold'
    }
    return 'border-white/40 text-white/70'
}

/** Resalta los campos obligatorios faltantes tras un intento de avance. */
function esFaltante(campo) {
    return Boolean(
        intentoAvance.value &&
        campo?.vmodel &&
        faltantes.value.includes(campo.vmodel)
    )
}

function clasesCampo(campo) {
    return esFaltante(campo) ? 'rounded-lg ring-2 ring-red-400 p-1.5 -m-1.5' : ''
}

/** Prepara la vista renderizable de un campo (is + props + valor actual). */
function prepararCampo(campo) {
    return {
        campo,
        is: componentesPaso.value[campo.component],
        Propiedades: {
            ...campo,
            disabled: Boolean(props.Propiedades.formulario?.soloVer || campo.disabled),
        },
        modelValue: getValue(reporteStore.Formulario, campo.vmodel),
    }
}

/**
 * Elementos renderizables de un bloque: campos simples o grupos (tarjetas)
 * con sus hijos. Se calcula una sola vez por render del bloque.
 */
function elementosDeBloque(bloque) {
    return (bloque.campos || []).map((item) => {
        if (item.grupo) {
            return {
                grupo: item,
                hijos: (item.campos || []).map(prepararCampo),
            }
        }
        return prepararCampo(item)
    })
}

function actualizarCampo(campo, valor) {
    setValue(reporteStore.Formulario, campo.vmodel, valor)
}

// ─────────────────────────────────────────────
// NAVEGACIÓN Y ENVÍO (acciones de useFormulario)
// ─────────────────────────────────────────────

async function manejarSiguiente(event) {
    const faltantesActuales = faltantesSeccion(pasoIndex.value)
    const invalidos = document.querySelectorAll('input:invalid, textarea:invalid').length

    intentoAvance.value = faltantesActuales.length > 0 || invalidos > 0

    await manejarClick(
        event,
        { type: 'enviar', text: textoSiguiente.value, color: 'primary' },
        reporteStore.Formulario,
        limpiar
    )
}

function manejarAnterior(event) {
    intentoAvance.value = false
    manejarClick(
        event,
        {
            type: 'cerrar',
            text: pasoIndex.value === 0 ? 'Cancelar' : 'Atrás',
            color: 'neutral',
            accion: () => { },
        },
        reporteStore.Formulario,
        limpiar
    )
}

function intentarIr(index) {
    intentoAvance.value = false
    irASeccion(index)
}

// ─────────────────────────────────────────────
// PERSISTENCIA
// ─────────────────────────────────────────────

function limpiar() {
    mapCamposLimpios(reporteStore.Formulario)
    localStorage.removeItem(storeId.value)
    localStorage.removeItem(clavePaso())

    const cerrar = props.Propiedades.formulario?.botones?.find((boton) => boton.type === 'cerrar')
    cerrar?.accion?.()
}

function clavePaso() {
    return `${storeId.value}_paso`
}

onMounted(() => {
    if (!props.Propiedades.formulario?.restaurarBorrador || !storeId.value) return

    const guardados = traerDatos()
    if (!guardados || typeof guardados !== 'object') return

    // Descarta borradores de otro equipo (evita mezclar evidencia de reportes distintos).
    const equipoBorrador = guardados.equipo?.id
    const equipoActual = reporteStore.Formulario.equipo?.id
    if (equipoBorrador && equipoActual && String(equipoBorrador) !== String(equipoActual)) {
        localStorage.removeItem(storeId.value)
        localStorage.removeItem(clavePaso())
        return
    }

    Object.assign(reporteStore.Formulario, guardados)

    const pasoGuardado = Number(localStorage.getItem(clavePaso()))
    if (Number.isFinite(pasoGuardado) && pasoGuardado > 0 && pasoGuardado < pasos.value.length) {
        seccionActual.value = pasoGuardado
    }
})

// Persiste el paso activo para restaurar la navegación.
watch(pasoIndex, (nuevo) => {
    if (storeId.value) localStorage.setItem(clavePaso(), String(nuevo))
})

// Si el paso "Recibido" desaparece (estado deja de ser 'realizada'), recorta el índice.
watch(() => pasos.value.length, (longitud) => {
    if (seccionActual.value > longitud - 1) {
        seccionActual.value = Math.max(0, longitud - 1)
    }
})
</script>

<template>
    <FondoBlur @mousedown="limpiar">
        <div
            class="bg-white dark:bg-gray-900 rounded-lg shadow-lg flex flex-col overflow-hidden animate-fadeIn lg:w-[70%] md:w-[85%] md:h-[85%] w-[95%] h-[90%]"
            :class="Propiedades.formulario?.estilos"
            @mousedown.stop>

            <!-- ================= HEADER + STEPPER ================= -->
            <header class="w-full bg-(--color-default) rounded-t-lg px-4 md:px-8 pt-4 pb-3">
                <div class="flex md:flex-row flex-col md:items-center justify-between gap-2">
                    <div class="min-w-0 flex gap-2 items-center">
                        <h2 class="text-white font-bold md:text-xl text-base truncate">
                            {{ Propiedades.formulario?.tituloFormulario }}
                        </h2>
                        <!-- <p v-if="reporteStore.Formulario.equipo?.nombre" class="text-gray-200 text-xs mt-0.5 truncate">
                            <i class="fa-solid fa-gear mr-1"></i>
                            {{ reporteStore.Formulario.equipo.nombre }}
                        </p> -->
                    </div>

                    <div class="flex items-center justify-between md:justify-end gap-3">
                        <!-- Estado del guardado automático -->
                        <div class="flex items-center">
                            <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 translate-x-2"
                                leave-active-class="transition duration-150" leave-to-class="opacity-0">
                                <span v-if="estadoGuardado === 'guardando'" key="guardando"
                                    class="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-gray-100">
                                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                                    Guardando...
                                </span>
                                <span v-else-if="estadoGuardado === 'guardado'" key="guardado"
                                    class="inline-flex items-center gap-1.5 rounded-full bg-green-500/90 px-3 py-1 text-[11px] font-semibold text-white">
                                    <i class="fa-solid fa-circle-check"></i>
                                    Guardado {{ horaGuardado }}
                                </span>
                                <span v-else-if="estadoGuardado === 'error'" key="error"
                                    class="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3 py-1 text-[11px] font-semibold text-white">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                    No se pudo guardar localmente
                                </span>
                                <span v-else-if="ultimoGuardado" key="idle"
                                    class="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] text-gray-200">
                                    <i class="fa-solid fa-cloud-arrow-up"></i>
                                    Autoguardado activo
                                </span>
                            </Transition>
                        </div>

                        <div @click="limpiar"
                            class="w-8 h-8 flex justify-center items-center rounded-xl hover:bg-white/10 cursor-pointer shrink-0">
                            <i class="fa-solid fa-close text-gray-100 hover:text-white text-lg"></i>
                        </div>
                    </div>
                </div>

                <!-- Progreso general -->
                <!-- <div class="mt-3 flex items-center gap-3">
                    <div class="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                        <div class="h-full rounded-full bg-green-400 transition-all duration-500"
                            :style="{ width: `${progresoFormulario}%` }"></div>
                    </div>
                    <span class="text-[11px] font-semibold text-gray-200 tabular-nums w-9 text-right">
                        {{ progresoFormulario }}%
                    </span>
                </div> -->

                <!-- Stepper de pasos -->
                <nav class="mt-3 flex items-center gap-1 md:gap-2 overflow-x-auto pb-1" aria-label="Pasos del formulario">
                    <template v-for="(paso, index) in pasos" :key="paso.id || index">
                        <button type="button" @click="intentarIr(index)"
                            class="group flex items-center gap-2 shrink-0 rounded-full px-2 py-1 transition-colors duration-200"
                            :class="index === pasoIndex ? 'bg-white/15' : 'hover:bg-white/10'"
                            :aria-current="index === pasoIndex ? 'step' : undefined">
                            <span
                                class="flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-200"
                                :class="clasePaso(index)">
                                <i v-if="progresoSeccion(index) >= 100" class="fa-solid fa-check text-[10px]"></i>
                                <span v-else>{{ index + 1 }}</span>
                            </span>
                            <span class="hidden md:block text-xs whitespace-nowrap"
                                :class="index === pasoIndex ? 'text-white font-semibold' : 'text-gray-300 group-hover:text-white'">
                                {{ paso.nombre }}
                            </span>
                        </button>
                        <i v-if="index < pasos.length - 1" class="fa-solid fa-angle-right text-[10px] text-gray-400 hidden md:block"></i>
                    </template>
                </nav>
            </header>

            <!-- ================= CUERPO ================= -->
            <div class="flex-1 min-h-0 scrollForm overflow-y-auto px-4 md:px-8 py-5">
                <Transition name="paso" mode="out-in">
                    <div v-if="pasoActual" :key="pasoActual.id || pasoIndex">

                        <!-- Introducción del paso -->
                        <div class="flex items-start gap-3 mb-4">
                            <div
                                class="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                                <i class="fa-solid text-primary text-lg" :class="pasoActual.icono || 'fa-file-lines'"></i>
                            </div>

                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2">
                                    <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                                        {{ pasoActual.titulo || pasoActual.nombre }}
                                    </h3>

                                    <span v-if="pasoActual.requeridos?.length"
                                        class="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-2.5 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-300">
                                        <i class="fa-solid fa-asterisk text-[8px]"></i>
                                        Campos obligatorios
                                    </span>

                                    <span v-else-if="pasoActual.opcional"
                                        class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                                        Opcional
                                    </span>
                                </div>

                                <p v-if="pasoActual.descripcion"
                                    class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {{ pasoActual.descripcion }}
                                </p>
                            </div>
                        </div>

                        <!-- Bloques de información -->
                        <section v-for="(bloque, bloqueIndex) in pasoActual.bloques || []" :key="bloqueIndex"
                            class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden mb-4">

                            <header v-if="bloque.titulo"
                                class="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-start gap-3 bg-gray-50/70 dark:bg-gray-950/40">
                                <div v-if="bloque.icono"
                                    class="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                                    <i class="fa-solid text-primary text-sm" :class="bloque.icono"></i>
                                </div>

                                <div class="min-w-0">
                                    <p class="font-semibold text-sm text-gray-900 dark:text-white">{{ bloque.titulo }}</p>
                                    <p v-if="bloque.descripcion" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {{ bloque.descripcion }}
                                    </p>
                                </div>

                                <span v-if="bloque.badge"
                                    class="ml-auto shrink-0 rounded-full bg-primary-100 dark:bg-primary-900/40 px-2.5 py-0.5 text-[10px] font-semibold text-primary-700 dark:text-primary-300">
                                    {{ bloque.badge }}
                                </span>
                            </header>

                            <div class="p-4" :class="bloque.grid || 'grid grid-cols-1 gap-4'">
                                <template v-for="(elemento, elementoIndex) in elementosDeBloque(bloque)" :key="elementoIndex">

                                    <!-- Campo con envoltorio tipo tarjeta (grupo) -->
                                    <div v-if="elemento.grupo" class="lg:col-span-full" :class="elemento.grupo.tamaño">
                                        <div class="rounded-xl border p-4 transition-shadow"
                                            :class="elemento.grupo.card || 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm'">

                                            <div v-if="elemento.grupo.titulo" class="flex items-center gap-2 mb-3 flex-wrap">
                                                <i class="fa-solid text-gray-400 text-xs" :class="elemento.grupo.icono || 'fa-circle-dot'"></i>
                                                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ elemento.grupo.titulo }}</p>
                                                <span v-if="elemento.grupo.etiqueta"
                                                    class="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                                    {{ elemento.grupo.etiqueta }}
                                                </span>
                                            </div>

                                            <div :class="elemento.grupo.grid || 'grid grid-cols-1 lg:grid-cols-12 gap-3 items-start'">
                                                <div v-for="(hijo, hijoIndex) in elemento.hijos" :key="hijoIndex"
                                                    :class="[hijo.campo.tamaño, clasesCampo(hijo.campo)]">
                                                    <component :is="hijo.is"
                                                        :Propiedades="hijo.Propiedades"
                                                        :modelValue="hijo.modelValue"
                                                        @update:modelValue="valor => actualizarCampo(hijo.campo, valor)" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Campo simple -->
                                    <div v-else :class="[elemento.campo.tamaño || 'lg:col-span-full', clasesCampo(elemento.campo)]">
                                        <component :is="elemento.is"
                                            :Propiedades="elemento.Propiedades"
                                            :modelValue="elemento.modelValue"
                                            @update:modelValue="valor => actualizarCampo(elemento.campo, valor)" />
                                    </div>
                                </template>
                            </div>
                        </section>
                    </div>
                </Transition>
            </div>

            <!-- ================= FOOTER ================= -->
            <footer
                class="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p class="text-[11px] text-gray-400 dark:text-gray-500 hidden sm:block">
                    Paso {{ pasoIndex + 1 }} de {{ pasos.length }}
                    <span class="mx-1">·</span>
                    {{ progresoFormulario }}% completado
                </p>

                <div class="flex gap-3 w-full sm:w-auto">
                    <ButtonForm color="neutral" class="sm:w-40 w-1/2" :loading="varView.cargando"
                        @click="manejarAnterior">
                        {{ pasoIndex === 0 ? 'Cancelar' : 'Atrás' }}
                    </ButtonForm>

                    <ButtonForm color="primary" class="sm:w-48 w-1/2" :loading="varView.cargando"
                        @click="manejarSiguiente">
                        {{ textoSiguiente }}
                    </ButtonForm>
                </div>
            </footer>
        </div>
    </FondoBlur>
</template>

<style scoped>
.animate-fadeIn {
    animation: fadeIn 0.4s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.paso-enter-active {
    transition: all 0.25s ease-out;
}

.paso-leave-active {
    transition: all 0.15s ease-in;
}

.paso-enter-from {
    opacity: 0;
    transform: translateX(16px);
}

.paso-leave-to {
    opacity: 0;
    transform: translateX(-16px);
}
</style>
