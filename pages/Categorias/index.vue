<script setup>
import Form from "~/components/organism/Forms/Form.vue";

import { ref, onMounted, watch } from "vue";
import { useCategoriaActions } from "~/composables/Usuarios/Categoria.js";

import { useCategoriasBuilder } from "~/build/Categorias/useCategoriasBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useCategoriasStore } from "~/stores/Formularios/Categorias";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";


const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeCategorias = useCategoriasStore()
const categorias = ref([]);
const refresh = ref(1);

const active = ref(false);
const isEditing = ref(false);

const {
    options,
    mensaje,
    alertRespuestaInput
} = useNotificacionesStore();

async function llamadatos() {
    categorias.value = await storeCategorias.traer();
    varView.datosActualizados()
}

const {
    agregarCategoria,
    verCategoria,
    cerrar,
    eliminarCategorias
} = useCategoriaActions({
    storeCategorias,
    varView,
    notificaciones,
    llamadatos,
    refresh,
    show: active,
    isEditing
});


// Refrescar pagina cuando se agrega o modifica Categoria
watch(() => active.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            refresh.value++;
        }
    }
);

// Cargar los Categorias desde el store
onMounted(async () => {
    categorias.value = await storeCategorias.traer();
    await llamadatos();
    console.log(categorias.value)
});

const propiedadesFormulario =
    useCategoriasBuilder({
        storeId: "RegistroCategoria",
        storePinia: "Categorias",
        cerrar: () => { active.value = false },
        active,
        isEditing
    })

const columns = [
    {
        accessorKey: 'id',
        header: 'ID'
    },
    {
        accessorKey: 'nombre',
        header: 'Nombre'
    },
    {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: ({ row }) =>
            h('div',{ class: 'max-w-[250px] truncate' }, row.getValue('descripcion'))
    },
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
        verCategoria(categoria)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Eliminar',
      onSelect() {
        eliminarCategorias(categoria)
      }
    }
  ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestionar Categorías',
        agregar: agregarCategoria,
        data: categorias,
        columns: columns,
        filtros: [
            {columna: 'estado', placeholder: 'Estado', value: 'activo'}
        ],
    }
})

</script>

<template>
    <FondoDefault>
        <Form :Propiedades="propiedadesFormulario"></Form>
        <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
    </FondoDefault>
</template>
