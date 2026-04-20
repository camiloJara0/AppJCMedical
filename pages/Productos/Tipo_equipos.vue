<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { ref, onMounted, watch } from "vue";
import { useTipo_equipoActions } from "~/composables/Usuarios/Tipo_equipo.js";
import { useTipo_equiposBuilder } from "~/build/Tipo_equipos/useTipo_equiposBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useTipo_equiposStore } from "~/stores/Formularios/Tipo_equipos/Tipo_equipo";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import { useSistemasStore } from "~/stores/Formularios/Sistemas/Sistema";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeTipo_equipos = useTipo_equiposStore()
const storeSistemas = useSistemasStore()
const tipo_equipos = ref([]);
const refresh = ref(1);
const active = ref(false);
const isEditing = ref(false);
const sistemas = ref([])

async function llamadatos() {
    tipo_equipos.value = await storeTipo_equipos.traer();
    varView.datosActualizados()
}

const {
    agregarTipo_equipo,
    verTipo_equipo,
    cerrar,
    eliminarTipo_equipos
} = useTipo_equipoActions({
    storeTipo_equipos,
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
    tipo_equipos.value = await storeTipo_equipos.traer(false);
    await llamadatos();

    const listaSistemas = await storeSistemas.traer();
    sistemas.value = listaSistemas.map(c => { return {label: c.nombre, value: c.id}})
});

const propiedadesFormulario = computed(() => 
    useTipo_equiposBuilder({
        storeId: "RegistroTipo_equipo",
        storePinia: "Tipo_equipos",
        cerrar: cerrar,
        active,
        isEditing,
        sistemas: sistemas.value
    })
)

const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
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
        verTipo_equipo(categoria)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Eliminar',
      onSelect() {
        eliminarTipo_equipos(categoria)
      }
    }
  ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestión de Tipos de Equipos',
        agregar: agregarTipo_equipo,
        data: tipo_equipos,
        columns: columns,
        filtros: [
            {columna: 'estado', placeholder: 'Estado', value: 'activo'}
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
