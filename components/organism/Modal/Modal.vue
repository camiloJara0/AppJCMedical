<script setup>
import { ref, computed } from 'vue'
import Tabla from '~/components/organism/Table/Tabla.vue'
import Form from '~/components/organism/Forms/Form.vue'
import Calendario from '~/components/molecules/Calendario/Calendario.vue'
import Citas from '~/components/molecules/Calendario/Citas.vue'
import Card from '~/components/molecules/Cards/Card.vue'
import PDFTemplate from '~/components/organism/PDFTemplate/PDFTemplate.vue'
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue'
import FondoTransparent from '~/components/atoms/Fondos/FondoTransparent.vue'
import ChartComponent from '~/components/molecules/Charts/ChartComponent.vue'

const props = defineProps({
  Propiedades: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'update'])

const fondos = {
  FondoBlur,
  FondoTransparent
}

const components = {
  Tabla,
  Form,
  Calendario,
  Citas,
  Card,
  PDFTemplate,
  ChartComponent
}

const seccionActual = ref(0)
const isMaximized = ref(false)

const modalSize = computed(() => {
  return isMaximized.value 
    ? 'w-[95%] h-[90%]'
    : props.Propiedades.tamaño || 'lg:w-[70%] md:w-[85%] md:h-[85%] w-[95%] h-[80%]'
})

function cambiarSeccion(tipo, key) {
  if (tipo === 'Card') {
    seccionActual.value = key + 1
  }
}

function cambiarAInicio() {
  seccionActual.value = 0
}

function toggleMaximized() {
  isMaximized.value = !isMaximized.value
}

function cerrarModal() {
  emit('close')
  props.Propiedades.cerrarModal?.()
}
</script>

<template>
  <component v-if="unref(Propiedades.show)" :is="fondos[Propiedades.fondo || 'FondoBlur']">
    <!-- Modal Card usando UCard de NuxtUI -->
    <UCard 
      class="animate-fadeIn overflow-hidden"
      :ui="{ 
        body: { base: 'scrollForm overflow-y-auto' },
        header: { base: 'bg-blue-600 dark:bg-blue-700 text-white' }
      }"
      :class="[modalSize, Propiedades.estilos]"
    >
      <!-- Header Modal -->
      <template #header>
        <div class="flex justify-between items-center w-full">
          <div>
            <h2 class="text-white font-bold text-2xl">
              {{ Propiedades.headerModal?.titulo }}
            </h2>
            <div class="flex gap-2 text-gray-100 font-medium">
              <span class="text-sm">{{ Propiedades.headerModal?.subtitulo }}</span>
              <span class="text-sm" v-html="Propiedades.headerModal?.html"></span>
            </div>
          </div>

          <!-- Acciones Header -->
          <div v-if="seccionActual === 0" class="flex items-center gap-2">
            <!-- Botones personalizados -->
            <UButton
              v-for="(icono, idx) in Propiedades.headerModal?.acciones"
              :key="idx"
              :icon="`i-lucide-${icono.icon.split('-').pop()}`"
              color="white"
              variant="ghost"
              size="sm"
              @click="icono.accion?.()"
            />

            <!-- Maximize -->
            <UButton
              :icon="isMaximized ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'"
              color="white"
              variant="ghost"
              size="sm"
              @click="toggleMaximized"
            />

            <!-- Close -->
            <UButton
              icon="i-lucide-x"
              color="white"
              variant="ghost"
              size="sm"
              @click="cerrarModal"
            />
          </div>

          <!-- Back Button -->
          <UButton
            v-else
            icon="i-lucide-chevron-left"
            color="white"
            variant="ghost"
            size="sm"
            @click="cambiarAInicio"
          />
        </div>
      </template>

      <!-- Título principal -->
      <div v-if="Propiedades.header?.titulo" class="mb-6">
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ Propiedades.header.titulo }}
        </h3>
        <p class="text-gray-600 dark:text-gray-300 mt-1">
          {{ Propiedades.header.descripcion }}
        </p>

        <!-- Botones adicionales -->
        <div v-if="Propiedades.header?.button" class="flex gap-3 mt-4">
          <UButton
            v-for="(btn, idx) in Propiedades.header.button"
            :key="idx"
            :icon="`i-lucide-${btn.icon.split('-').pop()}`"
            :color="btn.color?.split('-')[0] || 'primary'"
            size="md"
            @click="btn.action"
          >
            {{ btn.text }}
          </UButton>
        </div>
      </div>

      <!-- Contenido principal -->
      <div :class="Propiedades.secciones?.[seccionActual]?.contenedor" class="space-y-4">
        <component 
          v-for="(component, index) in Propiedades.secciones?.[seccionActual]?.componentes" 
          :key="index"
          :is="components[component.tipo]"
          :Propiedades="component"
          @click="cambiarSeccion(component.tipo, index)"
        />

        <slot />
      </div>
    </UCard>
  </component>
</template>

<style scoped>
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

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

/* Scroll personalizado */
:deep(.scrollForm) {
  max-height: calc(90vh - 200px);
}

:deep(.scrollForm::-webkit-scrollbar) {
  width: 8px;
}

:deep(.scrollForm::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 4px;
}

:deep(.scrollForm::-webkit-scrollbar-thumb) {
  background: #888;
  border-radius: 4px;
}

:deep(.scrollForm::-webkit-scrollbar-thumb:hover) {
  background: #555;
}
</style>
