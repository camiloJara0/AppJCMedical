<script setup>
import { useCitasBuilder } from '~/build/Citas/useCitasBuilder';
import { useEquiposStore } from '~/stores/Formularios/Equipos/Equipo'
import { useClientesStore } from '~/stores/Formularios/Clientes'
import { useTecnicosStore } from '~/stores/Formularios/Tecnicos/Tecnico'
import Form from '../organism/Forms/Form.vue';

const varView = useVarView();
const storeEquipos = useEquiposStore()
const storeClientes = useClientesStore()
const storeTecnicos = useTecnicosStore()
const clientes = ref([])
const tecnicos = ref([])
const equipos = ref([])

onMounted(async () => {
    const listaEquipos = await storeEquipos.traer();
    equipos.value = listaEquipos.map(c => { return { label: c.nombre, value: c.id } })
    const listaClientes = await storeClientes.traer();
    clientes.value = listaClientes.map(c => { return { label: c.nombre, value: c.id } })
    const listaTecnicos = await storeTecnicos.traer();
    tecnicos.value = listaTecnicos.map(c => { return { label: c.nombre, value: c.id } })
})

function cerrar() {
    varView.showNuevaCita = false
    varView.isEditing = false
}

const propiedades = computed(() =>
    useCitasBuilder({
        storeId: "RegistroCita",
        storePinia: "Citas",
        cerrar: cerrar,
        active: varView.showNuevaCita,
        isEditing: varView.isEditing,
        clientes: clientes.value,
        tecnicos: tecnicos.value,
        equipos: equipos.value,
    })
)

</script>

<template>
    <Form :Propiedades="propiedades" />
</template>