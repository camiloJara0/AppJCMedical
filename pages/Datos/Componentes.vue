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

async function llamadatos() {
    componentes.value = await storeComponentes.traer();
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
            await llamadatos();
            refresh.value++;
        }
    }
);

onMounted(async () => {
    componentes.value = await storeComponentes.traer();
    const listaSistemas = await storeSistemas.traer();
    sistemas.value = listaSistemas.map(c => { return {label: c.nombre, value: c.id}})
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
  { accessorKey: 'sistema_id', header: 'Sistema ID' },
  { accessorKey: 'nombre', header: 'Nombre' },
  {
    accessorKey: 'descripcion',
    header: 'Descripción',
    cell: ({ row }) =>
      h('div', { class: 'max-w-[250px] truncate' }, row.getValue('descripcion') || '-')
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
    }
})
</script>

<template>
    <FondoDefault>
        <Form :Propiedades="propiedadesFormulario"></Form>
        <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
    </FondoDefault>
</template>
