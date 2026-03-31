<template>
  <!-- Dropdown Item Principal -->
  <div class="hidden md:block relative group">
    <UButton
      :icon="'i-lucide-' + (icon.split('-').pop() || 'menu')"
      color="gray"
      variant="ghost"
      size="sm"
      class="text-gray-300 hover:text-white transition-colors"
    />

    <!-- Dropdown Menu usando UMenu o estructura HTML mejorada -->
    <div
      class="absolute top-full -left-10 mt-0 bg-gray-900 dark:bg-gray-950 rounded-lg shadow-xl p-1 min-w-38
             opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200
             z-50"
    >
      <UButton
        v-for="(item, idx) in submenu"
        :key="idx"
        :icon="`i-lucide-${item.icon.split('-').pop()}`"
        color="gray"
        variant="ghost"
        size="sm"
        :to="item.link"
        class="w-full justify-start text-gray-300 hover:text-white rounded-md"
        @click="item.accion?.()"
      >
        {{ item.nombre }}
      </UButton>
    </div>
  </div>

  <!-- Versión mobile: lista expandible -->
  <div class="md:hidden flex items-center gap-2">
    <i class="fa-solid" :class="icon"></i>
    <ul class="flex flex-col gap-1">
      <li v-for="item in submenu" :key="item.nombre">
        <ULink
          :to="item.link"
          @click="item.accion?.()"
          class="text-sm font-medium text-gray-300 hover:text-white transition-colors flex gap-2 items-center"
        >
          <i class="fa-solid" :class="item.icon"></i>
          {{ item.nombre }}
        </ULink>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  nombre: String,
  icon: String,
  submenu: {
    type: Array,
    default: () => []
  }
})
</script>

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