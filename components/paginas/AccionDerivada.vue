<script setup>
import { useCitasStore } from '~/stores/Formularios/citas/Cita'
import { storeToRefs } from 'pinia'
import FondoBlur from '../atoms/Fondos/FondoBlur.vue'

const varView = useVarView()
const citaStore = useCitasStore()
const notificaciones = useNotificacionesStore()

const {actividad} = storeToRefs(varView)

function activarCita() {
    citaStore.Formulario.Cita.tipo = 'Mantenimiento preventivo'
    citaStore.Formulario.Cita.tecnico_id = varView.dataActividad.tecnico_id
    citaStore.Formulario.Cita.cliente_id = varView.dataActividad.cliente_id
    citaStore.Formulario.Cita.equipo_id = [varView.dataActividad.equipo_id] || null
    varView.showNuevaCita = true
    varView.showActividadDerivada = false
}
</script>
<template>
<div class="absolute bottom-5 z-999 right-5">
  <UAlert v-if="actividad == 'Mantenimiento preventivo'"
    title="¿Deseas programar siguiente visita?"
    description="Registra nuevo mantenimiento preventivo para el mismo equipo"
    color="neutral"
    variant="outline"
    orientation="horizontal"
    :actions="[
      {
        label: 'Aceptar',
        onClick: () => activarCita()
      },
      {
        label: 'No',
        color: 'neutral',
        variant: 'subtle',
        onClick: () => { varView.showActividadDerivada = false }
      }
    ]"
  />
</div>
</template>