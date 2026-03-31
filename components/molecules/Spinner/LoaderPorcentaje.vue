<script setup>
const varView = useVarView()
</script>

<template>
  <div class="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <UCard class="w-full max-w-xs" :ui="{ body: { padding: 'px-6 py-8' } }">
      <!-- Encabezado -->
      <template #header>
        <div class="text-center">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">
            {{ varView.loader.titulo }}
          </h2>
        </div>
      </template>

      <!-- Contenido -->
      <div class="flex flex-col items-center gap-4">
        <!-- Mensaje -->
        <p class="text-sm text-gray-600 dark:text-gray-400 text-center animate-pulse">
          Procesando tu solicitud...
        </p>

        <!-- Barra de progreso con animación -->
        <div class="w-full">
          <div class="relative h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <!-- Fondo degradado -->
            <div 
              class="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 dark:from-blue-500 dark:via-blue-600 dark:to-blue-700 rounded-full transition-all duration-300 ease-out shadow-lg"
              :style="{ width: varView.loader.progreso + '%' }"
            />
            <!-- Efecto shine -->
            <div
              class="absolute inset-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"
              :style="{ animation: 'shimmer 2s infinite' }"
            />
          </div>
        </div>

        <!-- Porcentaje -->
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {{ varView.loader.progreso }}
          </span>
          <span class="text-lg text-gray-600 dark:text-gray-400">%</span>
        </div>

        <!-- Información adicional -->
        <p v-if="varView.loader.mensaje" class="text-xs text-gray-500 dark:text-gray-500 text-center">
          {{ varView.loader.mensaje }}
        </p>
      </div>
    </UCard>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(400%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

:deep(.ui-card) {
  animation: fadeInScale 0.3s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>


