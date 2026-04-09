<script setup>
import Form from "~/components/organism/Forms/Form.vue";

import { ref, onMounted, watch, h, resolveComponent } from "vue";

import { useProductosBuilder } from "~/build/Productos/useProductosBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useProductosStore } from "~/stores/Formularios/Productos";
import { useProductoActions } from "~/composables/Usuarios/Productos";
import { useCategoriasStore } from "~/stores/Formularios/Categorias";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeProductos = useProductosStore()
const storeCategorias = useCategoriasStore()
const productos = ref([]);
const categorias = ref([])
const refresh = ref(1);

const active = ref(false);
const isEditing = ref(false);

const {
    options,
    mensaje,
    alertRespuestaInput
} = useNotificacionesStore();

async function llamadatos() {
    productos.value = await storeProductos.traer();
    varView.datosActualizados()
}

const {
    agregarProducto,
    verProducto,
    cerrar,
    eliminarProductosModal
} = useProductoActions({
    storeProductos,
    varView,
    notificaciones,
    llamadatos,
    refresh,
    show: active,
    isEditing
});

// Refrescar pagina cuando se agrega o modifica Producto
watch(() => active.value,
    async (estado) => {
        if (!estado && varView.cambioEnApi) {
            await llamadatos();
            refresh.value++;
        }
    }
);

// Cargar los Productos desde el store
onMounted(async () => {
    productos.value = await storeProductos.traer();
    console.log(productos.value)
    const listaCategorias = await storeCategorias.traer();
    categorias.value = listaCategorias.map(c => { return {label: c.nombre, value: c.id}})
    await llamadatos();
});

const propiedadesFormulario = computed(() => 
  useProductosBuilder({
      storeId: "RegistrarProducto",
      storePinia: "Productos",
      cerrar: cerrar,
      active,
      isEditing,
      categorias: categorias.value
  })
)

const columns = [
  {
    accessorKey: 'id',
    header: 'ID'
  },

  {
    accessorKey: 'imagen',
    header: 'Imagen',
    cell: ({ row }) =>
      h('img', {
        src: row.getValue('imagen'),
        class: 'w-12 h-12 object-cover rounded'
      })
  },

  {
    accessorKey: 'nombre',
    header: 'Nombre'
  },

  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    id: 'descripcion',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'max-w-[250px] truncate' },
        row.getValue('descripcion')
      )
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
    accessorKey: 'stock',
    header: () => h('div', { class: 'text-right' }, 'Stock'),
    cell: ({ row }) =>
      h(
        'div',
        { class: 'text-right font-medium' },
        String(row.getValue('stock'))
      )
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
  }
]

function getRowItems(row) {
  const producto = row.original

  return [
    {
      type: 'label',
      label: 'Acciones'
    },
    {
      label: 'Editar',
      onSelect() {
        console.log('editar', producto)
        verProducto(producto)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Eliminar',
      onSelect() {
        eliminarProductosModal(producto)
      }
    }
  ]
}

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Gestionar Productos',
        agregar: agregarProducto,
        data: productos,
        columns: columns,
    }
})
</script>

<template>
    <FondoDefault>
        <Form :Propiedades="propiedadesFormulario"></Form>
        <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
    </FondoDefault>
</template>
