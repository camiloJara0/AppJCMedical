<script setup>
import BitacoraActividad from './BitacoraActividad.vue';
import Diagramacomponentes from './Diagramacomponentes.vue';
import MesaTrabajo from './MesaTrabajo.vue';
const props = defineProps({
  reporte: {
    type: Object,
  }
})


</script>

<template>
  <section class="space-y-4">

    <!-- Diagrama del equipo + mesa de trabajo -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div class="lg:col-span-3">
        <Diagramacomponentes
          :componentes="reporte.estado_componente"
          :nombre-equipo="reporte.equipo.nombre"
        />
      </div>
      <div class="lg:col-span-2">
        <MesaTrabajo
          :repuestos="reporte.repuestos"
          :materiales="reporte.materiales"
          :accesorios="reporte.accesorios"
        />
      </div>
    </div>

    <!-- Bitácora de la visita -->
    <BitacoraActividad
      :actividades="reporte.actividades"
      :resultado="reporte.resultado_reporte"
      :tecnico="reporte.tecnico"
      :fecha="reporte.fecha"
      :tipo="reporte.tipo"
    />
  </section>
</template>