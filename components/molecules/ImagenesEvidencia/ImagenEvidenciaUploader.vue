<script setup>
import { ref, computed } from 'vue'

import Input from '~/components/atoms/Inputs/Input.vue'
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue'
import {
    IMAGEN_CONFIG,
    validarImagen,
    comprimirImagen,
} from '~/utils/compresionImagenes'

const props = defineProps({
    Propiedades: { type: Object, default: () => ({}) },
    modelValue: { type: Array, default: () => [] },
    max: { type: Number, default: IMAGEN_CONFIG.maxCantidad },
    disabled: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const TAMAÑOS = Object.freeze([
    { valor: '100', etiqueta: '100%', titulo: 'Página completa', bloques: 1 },
    { valor: '50', etiqueta: '50%', titulo: 'Media página', bloques: 2 },
    { valor: '30', etiqueta: '30%', titulo: 'Un tercio de página', bloques: 3 },
])

const inputArchivo = ref(null)
const procesando = ref(false)
const errores = ref([])
const arrastrandoArchivo = ref(false)
const indiceArrastre = ref(null)
const indiceDestino = ref(null)

const imagenes = computed(() => (Array.isArray(props.modelValue) ? props.modelValue : []))
const oculto = computed(() => Boolean(props.disabled || props.Propiedades.disabled))
const puedeAgregar = computed(() => !oculto.value && imagenes.value.length < props.max)

function emitir(nueva) {
    emit('update:modelValue', nueva)
}

function vistaPrevia(imagen) {
    return imagen?.base64 || imagen?.url || ''
}

// ─────────────────────────────────────────────
// AGREGAR IMÁGENES
// ─────────────────────────────────────────────

function abrirSelector() {
    if (puedeAgregar.value) inputArchivo.value?.click()
}

function onSeleccion(event) {
    const archivos = Array.from(event.target.files || [])
    event.target.value = ''
    agregarArchivos(archivos)
}

async function agregarArchivos(archivos) {
    if (!puedeAgregar.value || !archivos.length) return

    errores.value = []
    const nuevas = [...imagenes.value]
    const rechazadas = []

    procesando.value = true
    try {
        for (const archivo of archivos) {
            const error = validarImagen(archivo)

            if (error) {
                rechazadas.push(`${archivo.name || 'Archivo'}: ${error}`)
                continue
            }

            if (nuevas.length >= props.max) {
                rechazadas.push(`Máximo ${props.max} imágenes por reporte.`)
                break
            }

            try {
                const { base64 } = await comprimirImagen(archivo)
                nuevas.push({
                    key: generarClave(),
                    base64,
                    descripcion: '',
                    tamano: '50',
                })
            } catch {
                rechazadas.push(`${archivo.name}: no se pudo procesar la imagen.`)
            }
        }
    } finally {
        procesando.value = false
    }

    errores.value = rechazadas

    if (nuevas.length !== imagenes.value.length) {
        emitir(nuevas)
    }
}

// ─────────────────────────────────────────────
// DRAG & DROP — REORDEN Y SOLTAR ARCHIVOS
// ─────────────────────────────────────────────

function iniciarArrastre(index, event) {
    if (oculto.value) return

    indiceArrastre.value = index
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
}

function sobreCard(index, event) {
    if (indiceArrastre.value === null) return
    event.preventDefault()
    indiceDestino.value = index
}

function soltarCard(index, event) {
    const archivos = Array.from(event.dataTransfer?.files || [])

    if (archivos.length) {
        limpiarArrastre()
        agregarArchivos(archivos)
        return
    }

    if (indiceArrastre.value === null) {
        limpiarArrastre()
        return
    }

    event.preventDefault()

    if (indiceArrastre.value !== index) {
        const nueva = [...imagenes.value]
        const [movida] = nueva.splice(indiceArrastre.value, 1)
        nueva.splice(index, 0, movida)
        emitir(nueva)
    }

    limpiarArrastre()
}

function soltarZona(event) {
    arrastrandoArchivo.value = false

    const archivos = Array.from(event.dataTransfer?.files || [])
    if (archivos.length) agregarArchivos(archivos)
}

function limpiarArrastre() {
    indiceArrastre.value = null
    indiceDestino.value = null
}

function mover(index, delta) {
    const destino = index + delta
    if (destino < 0 || destino >= imagenes.value.length) return

    const nueva = [...imagenes.value]
    const [movida] = nueva.splice(index, 1)
    nueva.splice(destino, 0, movida)
    emitir(nueva)
}

// ─────────────────────────────────────────────
// EDICIÓN DE IMÁGENES
// ─────────────────────────────────────────────

function eliminar(index) {
    const nueva = imagenes.value.filter((_item, i) => i !== index)
    emitir(nueva)
}

function actualizarDescripcion(index, valor) {
    emitir(imagenes.value.map((item, i) => (i === index ? { ...item, descripcion: valor } : item)))
}

function actualizarTamano(index, valor) {
    emitir(imagenes.value.map((item, i) => (i === index ? { ...item, tamano: valor } : item)))
}

function generarClave() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
</script>

<template>
    <div class="w-full" :class="Propiedades.tamaño">
        <div
            class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">

            <!-- ================= HEADER ================= -->
            <div
                class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-800">

                <div class="flex items-center gap-4">
                    <div class="h-11 w-11 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                        <i class="fa-solid fa-camera text-primary text-lg"></i>
                    </div>

                    <div>
                        <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
                            {{ Propiedades.label || 'Evidencia fotográfica' }}
                        </h3>

                        <div class="flex flex-wrap items-center gap-3 mt-1">
                            <span
                                class="inline-flex gap-1 items-center rounded-full bg-primary-100 dark:bg-primary-900/40 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300">
                                {{ imagenes.length }}
                                <span class="hidden md:block">{{ imagenes.length === 1 ? 'imagen' : 'imágenes' }}</span>
                            </span>

                            <span class="text-xs text-gray-500 dark:text-gray-400">
                                {{ Propiedades.description || `Máximo ${max} · JPG, PNG o WEBP de hasta ${Math.round(IMAGEN_CONFIG.maxBytes / 1024 / 1024)} MB` }}
                            </span>
                        </div>
                    </div>
                </div>

                <input
                    ref="inputArchivo"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                    @change="onSeleccion" />

                <ButtonRounded
                    v-if="puedeAgregar"
                    tooltip="Agregar imágenes"
                    color="bg-primary-600 hover:bg-primary-700"
                    @click="abrirSelector">
                    <i class="fa-solid fa-plus"></i>
                </ButtonRounded>
            </div>

            <!-- ================= DROPZONE ================= -->
            <div
                v-if="!oculto"
                role="button"
                tabindex="0"
                @click="abrirSelector"
                @keydown.enter="abrirSelector"
                @dragover.prevent="arrastrandoArchivo = true"
                @dragleave="arrastrandoArchivo = false"
                @drop.prevent="soltarZona"
                class="m-4 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer p-6 flex flex-col items-center justify-center text-center"
                :class="arrastrandoArchivo
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10'">

                <div
                    class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mb-3">
                    <i class="fa-solid fa-cloud-arrow-up text-xl text-primary-600 dark:text-primary-400"></i>
                </div>

                <p class="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Arrastra y suelta imágenes aquí
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    o haz clic para seleccionar desde tu equipo
                </p>

                <div
                    class="mt-3 flex flex-wrap justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">JPG</span>
                    <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">PNG</span>
                    <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">WEBP</span>
                    <span class="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
                        máx {{ Math.round(IMAGEN_CONFIG.maxBytes / 1024 / 1024) }} MB c/u
                    </span>
                </div>
            </div>

            <!-- ================= ERRORES ================= -->
            <Transition
                enter-active-class="transition duration-200"
                enter-from-class="opacity-0 -translate-y-2">
                <div
                    v-if="errores.length"
                    class="mx-4 mb-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">

                    <div class="flex items-start justify-between gap-3">
                        <div class="flex items-start gap-2 min-w-0">
                            <i class="fa-solid fa-triangle-exclamation text-red-500 mt-0.5"></i>
                            <ul class="text-xs text-red-700 dark:text-red-300 space-y-1">
                                <li v-for="(error, i) in errores" :key="i" class="wrap-break-words">{{ error }}</li>
                            </ul>
                        </div>

                        <ButtonRounded
                            tooltip="Cerrar"
                            color="bg-red-100 hover:bg-red-200 text-red-600"
                            @click="errores = []">
                            <i class="fa-solid fa-xmark text-sm"></i>
                        </ButtonRounded>
                    </div>
                </div>
            </Transition>

            <!-- ================= PROCESANDO ================= -->
            <div
                v-if="procesando"
                class="mx-4 mb-3 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 px-4 py-2.5 flex items-center gap-2 text-xs text-primary-700 dark:text-primary-300">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                Comprimiendo imágenes...
            </div>

            <!-- ================= LISTADO ================= -->
            <div
                v-if="imagenes.length"
                class="p-4 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">

                <article
                    v-for="(imagen, index) in imagenes"
                    :key="imagen.key || imagen.id || index"
                    @dragover="sobreCard(index, $event)"
                    @drop="soltarCard(index, $event)"
                    @dragleave="indiceDestino === index && (indiceDestino = null)"
                    class="group rounded-2xl border bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all duration-200"
                    :class="indiceDestino === index
                        ? 'border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800'
                        : 'border-gray-200 dark:border-gray-800 hover:shadow-md'">

                    <!-- Barra superior: número + acciones -->
                    <div
                        class="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-950/50 border-b border-gray-200 dark:border-gray-800"
                        :class="oculto ? '' : 'cursor-grab active:cursor-grabbing'"
                        :draggable="!oculto"
                        @dragstart="iniciarArrastre(index, $event)"
                        @dragend="limpiarArrastre">

                        <span
                            class="inline-flex items-center gap-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 px-2.5 py-0.5 text-[11px] font-semibold text-primary-700 dark:text-primary-300">
                            <i class="fa-solid fa-grip-vertical text-[10px] opacity-60" v-if="!oculto"></i>
                            Foto {{ index + 1 }}
                        </span>

                        <div v-if="!oculto" class="flex items-center gap-1.5">
                            <ButtonRounded
                                tooltip="Mover arriba"
                                color="bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                :disabled="index === 0"
                                @click="mover(index, -1)">
                                <i class="fa-solid fa-arrow-up text-xs"></i>
                            </ButtonRounded>

                            <ButtonRounded
                                tooltip="Mover abajo"
                                color="bg-gray-200 hover:bg-gray-300 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                :disabled="index === imagenes.length - 1"
                                @click="mover(index, 1)">
                                <i class="fa-solid fa-arrow-down text-xs"></i>
                            </ButtonRounded>

                            <ButtonRounded
                                tooltip="Eliminar"
                                color="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/40"
                                @click="eliminar(index)">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </ButtonRounded>
                        </div>
                    </div>

                    <!-- Vista previa -->
                    <div class="relative aspect-video bg-gray-100 dark:bg-gray-800">
                        <img
                            :src="vistaPrevia(imagen)"
                            :alt="imagen.descripcion || `Evidencia ${index + 1}`"
                            class="w-full h-full object-cover"
                            loading="lazy" />
                    </div>

                    <!-- Tamaño en el PDF -->
                    <div class="px-3 pt-3">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Tamaño en el PDF
                        </p>

                        <div class="grid grid-cols-3 gap-1.5 mt-1.5">
                            <button
                                v-for="tamano in TAMAÑOS"
                                :key="tamano.valor"
                                type="button"
                                :title="tamano.titulo"
                                @click="actualizarTamano(index, tamano.valor)"
                                :class="(imagen.tamano || '50') === tamano.valor
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'"
                                class="rounded-lg border px-1 py-1.5 flex flex-col items-center gap-1 transition-all duration-150">

                                <span class="flex gap-px w-8 h-4 items-stretch">
                                    <span
                                        v-for="bloque in tamano.bloques"
                                        :key="bloque"
                                        class="flex-1 rounded-[1px]"
                                        :class="(imagen.tamano || '50') === tamano.valor ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'">
                                    </span>
                                </span>

                                <span class="text-[10px] font-bold leading-none">{{ tamano.etiqueta }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- Descripción -->
                    <div class="p-3">
                        <Input
                            :modelValue="imagen.descripcion || ''"
                            :Propiedades="{
                                label: 'Descripción',
                                name: `imagen_descripcion_${index}`,
                                placeholder: 'Ej: Fuga en conexión hidráulica',
                                tamaño: 'w-full'
                            }"
                            :disabled="oculto"
                            @update:modelValue="valor => actualizarDescripcion(index, valor)" />
                    </div>
                </article>
            </div>

            <!-- ================= EMPTY (solo lectura) ================= -->
            <div
                v-if="!imagenes.length && oculto"
                class="p-8 flex flex-col items-center text-center text-gray-400">
                <i class="fa-regular fa-image text-3xl mb-2"></i>
                <p class="text-sm">Sin evidencia fotográfica registrada</p>
            </div>
        </div>
    </div>
</template>
