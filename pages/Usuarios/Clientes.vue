<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { ref, onMounted, watch, unref } from "vue";
import { useClienteActions } from "~/composables/Usuarios/Cliente.js";
import { useClientesBuilder } from "~/build/Clientes/useClientesBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useClientesStore } from "~/stores/Formularios/Clientes";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeClientes = useClientesStore()
const clientes = ref([]);
const refresh = ref(1);
const active = ref(false);
const isEditing = ref(false);

async function llamadatos() {
    clientes.value = await storeClientes.traer();
    varView.datosActualizados()
}

const {
    agregarCliente,
    verCliente,
    cerrar,
    eliminarClientes
} = useClienteActions({
    storeClientes,
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
    clientes.value = await storeClientes.traer();
    await llamadatos();
});

const propiedadesFormulario = useClientesBuilder({
    storeId: "RegistroCliente",
    storePinia: "Clientes",
    cerrar: cerrar,
    active,
    isEditing
});

const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'telefono', header: 'Teléfono' },
    { accessorKey: 'correo', header: 'Correo' },
    {
        accessorKey: 'estado',
        header: 'Estado',
        cell: ({ row }) => {
            const estado = row.getValue('estado')

            const color =
                estado === 'activo'
                ? 'success'
                : estado === 'inactivo'
                ? 'neutral'
                : 'warning'

            return h(
                UBadge,
                { variant: 'subtle', color, class: 'capitalize' },
                () => estado
            )
        }
    },
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
        verCliente(categoria)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Eliminar',
      onSelect() {
        eliminarClientes(categoria)
      }
    }
  ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestionar Clientes',
        agregar: agregarCliente,
        data: clientes,
        columns: columns,
        filtros: [
            {columna: 'estado', placeholder: 'Estado', value: 'activo'}
        ],
    }
})
</script>

<template>
    <FondoDefault>

            <TablaNuxt 
                :Propiedades="propiedadesTabla"
            />
        <Form :Propiedades="propiedadesFormulario" />
    </FondoDefault>
</template>
