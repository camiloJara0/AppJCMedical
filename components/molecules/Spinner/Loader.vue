<template>
  <div class="fixed inset-0 z-999 flex items-center justify-center bg-black/60 backdrop-blur-sm dark:bg-black/80">
    <div class="flex flex-col items-center justify-center gap-6">
      <!-- Icono con animación -->
      <div class="relative w-24 h-24 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 border-r-blue-400 animate-spin" />
        <div class="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-300 animate-spin" style="animation-direction: reverse;" />
          <svg xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 100 100" 
              width="60" height="60" 
              fill="none" stroke="currentColor" stroke-width="6">

            <!-- Cruz médica en el centro -->
            <rect x="45" y="30" width="10" height="40" fill="currentColor"/>
            <rect x="30" y="45" width="40" height="10" fill="currentColor"/>
          </svg>

      </div>

      <!-- Texto animado -->
      <div class="text-center">
        <p class="text-white dark:text-gray-100 text-lg font-semibold animate-pulse">
          Cargando sistema ANANKE...
        </p>
        <div class="mt-2 flex gap-1 justify-center">
          <span class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0s;" />
          <span class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s;" />
          <span class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s;" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animaciones de carga */
@keyframes pulso {
  0%, 100% { 
    opacity: 0.8;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.1);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  40% {
    transform: translateY(-10px);
    opacity: 0.7;
  }
}

:deep(.animate-bounce) {
  animation: bounce 1.4s infinite;
}

:deep(.animate-spin) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

</style>
