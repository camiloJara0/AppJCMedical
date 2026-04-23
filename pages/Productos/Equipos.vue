<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { ref, onMounted, watch } from "vue";
import { useEquipoActions } from "~/composables/Usuarios/Equipo.js";
import { useEquiposBuilder } from "~/build/Equipos/useEquiposBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useEquiposStore } from "~/stores/Formularios/Equipos/Equipo";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import { useTipo_equiposStore } from "~/stores/Formularios/Tipo_equipos/Tipo_equipo";
import { useClientesStore } from "~/stores/Formularios/Clientes";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeEquipos = useEquiposStore()
const storeTipoEquipos = useTipo_equiposStore()
const storeClientes = useClientesStore()
const equipos = ref([]);
const refresh = ref(1);
const active = ref(false);
const isEditing = ref(false);
const tiposEquipos = ref([])
const clientes = ref([])

async function llamadatos(cambio = false) {
    equipos.value = await storeEquipos.traer(true, false, cambio);
    varView.datosActualizados()
}

const {
    agregarEquipo,
    verEquipo,
    cerrar,
    eliminarEquipos
} = useEquipoActions({
    storeEquipos,
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
            await llamadatos(true);
            refresh.value++;
        }
    }
);

onMounted(async () => {
    equipos.value = await storeEquipos.traer(false);
    const listaTipoEquipos = await storeTipoEquipos.traer(true, true);
    tiposEquipos.value = listaTipoEquipos.map(c => { return {label: c.nombre, value: c.id}})
    const listaClientes = await storeClientes.traer(true, true);
    clientes.value = listaClientes.map(c => { return {label: c.nombre, value: c.id}})
    await llamadatos();
});

const propiedadesFormulario = computed(() => 
    useEquiposBuilder({
        storeId: "RegistroEquipo",
        storePinia: "Equipos",
        cerrar: cerrar,
        active,
        isEditing,
        tiposEquipos: tiposEquipos.value,
        clientes: clientes.value,
    })
)

const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'marca', header: 'Marca' },
    { accessorKey: 'modelo', header: 'Modelo' },
    { accessorKey: 'serie', header: 'Serie' },
    { accessorKey: 'ubicacion', header: 'Ubicación' },
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
        verEquipo(categoria)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Eliminar',
      onSelect() {
        eliminarEquipos(categoria)
      }
    }
  ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Equipos',
        agregar: agregarEquipo,
        data: equipos,
        columns: columns,
        filtros: [
            {columna: 'ubicacion', placeholder: 'Ubicacion'},
            {columna: 'marca', placeholder: 'Marca'},
            {columna: 'estado', placeholder: 'Estado'},
        ],
    }
})
</script>

<template>
    <FondoDefault>
            <TablaNuxt :Propiedades="propiedadesTabla"/>
        <Form :Propiedades="propiedadesFormulario" />
    </FondoDefault>
</template>
