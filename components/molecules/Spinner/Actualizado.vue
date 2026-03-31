<template>
  <Transition name="slideUp">
    <div 
      v-if="true"
      class="fixed bottom-4 right-4 z-50 animate-fadeIn"
    >
      <UCard 
        class="w-full max-w-sm shadow-lg"
        :ui="{ body: { padding: 'px-4 py-3' } }"
      >
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-check" class="text-green-500 w-5 h-5 animate-bounce" />
          <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
            Datos sincronizados correctamente
          </span>
          <UButton
            icon="i-lucide-x"
            color="gray"
            variant="ghost"
            size="xs"
            @click="$emit('close')"
          />
        </div>
      </UCard>
    </div>
  </Transition>
</template>

<script setup>
defineEmits(['close'])
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.slideUp-enter-active, 
.slideUp-leave-active {
  transition: all 0.3s ease;
}

.slideUp-enter-from,
.slideUp-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

:deep(.ui-card) {
  animation: slideUp 0.3s ease-out;
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

:deep(.animate-bounce) {
  animation: bounce 1s infinite;
}
</style>
