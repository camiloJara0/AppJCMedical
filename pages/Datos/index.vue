<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { ref, onMounted, watch, h, computed } from "vue";
import { useComponenteActions } from "~/composables/Usuarios/Componente.js";
import { useComponentesBuilder } from "~/build/Componentes/useComponentesBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useComponentesStore } from "~/stores/Formularios/Componentes/Componente";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import { useSistemasStore } from "~/stores/Formularios/Sistemas/Sistema";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeComponentes = useComponentesStore()
const storeSistemas = useSistemasStore()
const componentes = ref([]);
const sistemas = ref([])
const refresh = ref(1);
const active = ref(false);
const isEditing = ref(false);

async function llamadatos(cambio = false) {
  componentes.value = await storeComponentes.traer(true, false, cambio);
  varView.datosActualizados()
}

const {
  agregarComponente,
  verComponente,
  cerrar,
  eliminarComponentes
} = useComponenteActions({
  storeComponentes,
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
  componentes.value = await storeComponentes.traer(false);
  const listaSistemas = await storeSistemas.traer(true, true);
  sistemas.value = listaSistemas.map(c => { return { label: c.nombre, value: c.id } })
  await llamadatos();
});

const propiedadesFormulario = computed(() =>
  useComponentesBuilder({
    storeId: "RegistroComponente",
    storePinia: "Componentes",
    cerrar: cerrar,
    active,
    isEditing,
    sistemas: sistemas.value
  })
)

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'sistema.nombre', header: 'Sistema' },
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
  }
]

function getRowItems(row) {
  const componente = row.original
  return [
    { type: 'label', label: 'Acciones' },
    {
      label: 'Editar',
      onSelect() {
        verComponente(componente)
      }
    },
    { type: 'separator' },
    {
      label: 'Eliminar',
      onSelect() {
        eliminarComponentes(componente)
      }
    }
  ]
}

const propiedadesTabla = computed(() => {
  return {
    titulo: 'Gestionar Componentes',
    agregar: agregarComponente,
    data: componentes,
    columns: columns,
    filtros: [
        {columna: 'estado', placeholder: 'Estado', value: 'activo'},
    ]
  }
})
</script>

<template>
  <FondoDefault>
    <Form :Propiedades="propiedadesFormulario"></Form>
    <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
  </FondoDefault>
</template>
