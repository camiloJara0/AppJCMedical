<script setup>
import { useReporteBuilder } from '~/build/Reporte/useReporteBuilder';
import Form from '../organism/Forms/Form.vue';

const varView = useVarView();

function cerrar() {
    varView.showNuevoRegistro = false
}

const propiedades = computed(() => 
    useReporteBuilder({
        storeId: "enviarReporte",
        storePinia: "Reportes",
        cerrar: cerrar,
        active : varView.showNuevoRegistro,
        isEditing: varView.isEditing,
    })
)


</script>

<template>
    <Form :Propiedades="propiedades"/>
</template>