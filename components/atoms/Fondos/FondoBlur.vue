<template>
  <div class="fixed inset-0 z-20">
    <!-- Sombra con blur backdrop -->
    <div 
      class="absolute inset-0 bg-black/70 backdrop-blur-md dark:bg-black/80 transition-opacity duration-300"
    />

    <!-- Contenedor centrado con animación -->
    <div class="absolute inset-0 flex flex-col justify-center items-center h-dvh">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Animación de entrada */
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

:deep(> div:last-child > *) {
  animation: fadeInScale 0.3s ease-out;
}
</style>