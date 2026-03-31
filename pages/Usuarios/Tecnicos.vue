<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { ref, onMounted, watch } from "vue";
import { useTecnicoActions } from "~/composables/Usuarios/Tecnico.js";
import { useTecnicosBuilder } from "~/build/Tecnicos/useTecnicosBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useTecnicosStore } from "~/stores/Formularios/Tecnicos/Tecnico";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeTecnicos = useTecnicosStore()
const tecnicos = ref([]);
const refresh = ref(1);
const active = ref(false);
const isEditing = ref(false);

async function llamadatos() {
    tecnicos.value = await storeTecnicos.traer();
    varView.datosActualizados()
}

const {
    agregarTecnico,
    verTecnico,
    cerrar,
    eliminarTecnicos
} = useTecnicoActions({
    storeTecnicos,
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
    tecnicos.value = await storeTecnicos.traer();
    await llamadatos();
});

const propiedadesFormulario = useTecnicosBuilder({
    storeId: "RegistroTecnico",
    storePinia: "Tecnicos",
    cerrar: cerrar,
    active,
    isEditing
})

const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'telefono', header: 'Teléfono' },
    { accessorKey: 'direccion', header: 'Dirección' },
     {
        id: 'actions',
        cell: ({ row }) =>
        h(
            'div',
            { class: 'text-right' },
            h(
            UDropdownMenu,
            {
                content: { align: 'end' },
                items: getRowItems(row)
            },
            () =>
                h(UButton, {
                icon: 'i-lucide-ellipsis-vertical',
                color: 'neutral',
                variant: 'ghost'
                })
            )
        )
    },
]
function getRowItems(row) {
  const categoria = row.original

  return [
    {
      type: 'label',
      label: 'Acciones'
    },
    {
      label: 'Editar',
      onSelect() {
        verTecnico(categoria)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Eliminar',
      onSelect() {
        eliminarTecnicos(categoria)
      }
    }
  ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Técnicos',
        agregar: agregarTecnico,
        data: tecnicos,
        columns: columns,
        filtros: [
            {columna: 'estado', placeholder: 'Estado'}
        ],
    }
})
</script>

<template>
    <FondoDefault>
        <TablaNuxt :Propiedades="propiedadesTabla" />
        <Form :Propiedades="propiedadesFormulario" />
    </FondoDefault>
</template>
