<script setup>
import { useReporteBuilder } from '~/build/Reporte/useReporteBuilder';
import ReporteForm from '~/components/organism/Reporte/ReporteForm.vue';

const varView = useVarView();

function cerrar() {
    varView.showNuevoRegistro = false
}

const propiedades = computed(() =>
    useReporteBuilder({
        storeId: "enviarReporte",
        storePinia: "Reportes",
        cerrar: cerrar,
        active: varView.showNuevoRegistro,
        isEditing: varView.isEditing,
    })
)
</script>

<template>
    <ReporteForm v-if="propiedades.formulario?.show" :Propiedades="propiedades" />
</template>
