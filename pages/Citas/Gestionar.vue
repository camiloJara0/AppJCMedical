<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { ref, onMounted, watch } from "vue";
import { useCitaActions } from "~/composables/Usuarios/Cita.js";
import { useCitasBuilder } from "~/build/Citas/useCitasBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeCitas = useCitasStore()
const citas = ref([]);
const refresh = ref(1);
const active = ref(false);
const isEditing = ref(false);

async function llamadatos() {
    citas.value = await storeCitas.traer();
    varView.datosActualizados()
}

const {
    agregarCita,
    verCita,
    cerrar,
    eliminarCitas
} = useCitaActions({
    storeCitas,
    varView,
    notificaciones,
    llamadatos,
    refresh,
    show: active,
    isEditing
});

watch(() => active.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            refresh.value++;
        }
    }
);

onMounted(async () => {
    citas.value = await storeCitas.traer();
    await llamadatos();
});

const propiedadesFormulario = useCitasBuilder({
    storeId: "RegistroCita",
    storePinia: "Citas",
    cerrar: () => { active.value = false },
    active,
    isEditing
})

const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'tecnico_id', header: 'Técnico' },
    { accessorKey: 'cliente_id', header: 'Cliente' },
    { accessorKey: 'equipo_id', header: 'Equipo' },
    { accessorKey: 'tipo', header: 'Tipo' },
    { accessorKey: 'fecha', header: 'Fecha' },
    { accessorKey: 'hora', header: 'Hora' },
    { accessorKey: 'estado', header: 'Estado' },
]
</script>

<template>
    <FondoDefault>
        <div class="flex flex-col gap-4 p-4">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold">Gestión de Citas</h1>
                <button @click="agregarCita" class="btn btn-primary">Agregar Cita</button>
            </div>
            <TablaNuxt 
                :data="citas" 
                :columns="columns"
                :refresh="refresh"
                @view="verCita"
                @edit="verCita"
                @delete="eliminarCitas"
            />
        </div>
        <Form :propiedades="propiedadesFormulario" />
    </FondoDefault>
</template>
