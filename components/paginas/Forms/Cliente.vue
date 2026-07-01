<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { useClientesBuilder } from "~/build/Clientes/useClientesBuilder";
import { useClientesStore } from "~/stores/Formularios/Clientes";

const clienteStore = useClientesStore()

const {showNuevoCliente, editarCliente} = storeToRefs(clienteStore)

const propiedadesFormulario = useClientesBuilder({
    storeId: "RegistroCliente",
    storePinia: "Clientes",
    cerrar: () => {showNuevoCliente.value= false; editarCliente.value = false},
    active: showNuevoCliente,
    isEditing: editarCliente
});
</script>

<template>
    <Form :Propiedades="propiedadesFormulario"></Form>
</template>