<script setup>
const props = defineProps({
  nombre: String,
  icon: String,
  submenu: {
    type: Array,
    default: () => []
  }
});
</script>

<template>
  <!-- Dropdown Item Principal -->
  <UDropdownMenu class="hidden md:flex" :items="props.submenu">
    <UButton :label="nombre" :icon="'i-lucide-' + (icon.split('-').pop() || 'menu')" color="gray" variant="ghost" size="sm"
      class="text-gray-300 hover:text-white transition-colors flex gap-1 items-center">

    </UButton>
  </UDropdownMenu>
  <!-- <div class="hidden md:block relative group">
    <UButton :icon="'i-lucide-' + (icon.split('-').pop() || 'menu')" color="gray" variant="ghost" size="sm"
      class="text-gray-300 hover:text-white transition-colors">

      <p class="text-gray-100 text-xs ml-1 font-semibold md:block hidden">{{ nombre }}</p>
    </UButton>
    <div class="absolute top-full -left-2 mt-0 bg-gray-900 dark:bg-gray-950 rounded-lg shadow-xl p-1 min-w-32
             opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
             z-50">
      <UButton v-for="(item, idx) in submenu" :key="idx" :icon="item.icon" color="gray" variant="ghost" size="sm"
        :to="item.link" class="w-full justify-start text-gray-300 hover:text-white rounded-md" @click="item.accion?.()">
        {{ item.nombre }}
      </UButton>
    </div>
  </div> -->

  <!-- Versión mobile: lista expandible -->

</template>

<style scoped>
/* Transición suave del dropdown */
:deep(.group:hover .group-hover\:opacity-100) {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>