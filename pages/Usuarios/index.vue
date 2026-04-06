<script setup>
import Form from "~/components/organism/Forms/Form.vue";
import { ref, onMounted, watch } from "vue";
import { useTecnicoActions } from "~/composables/Usuarios/Tecnico.js";
import { useTecnicosBuilder } from "~/build/Tecnicos/useTecnicosBuilder";
import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";
import { useTecnicosStore } from "~/stores/Formularios/Tecnicos/Tecnico";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";
import { useRolStore } from "~/stores/Formularios/Roles/rol";
import { useRolActions } from "~/composables/Usuarios/Roles";
import { useRolBuilder } from "~/build/Roles/useRolBuilder";

const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeTecnicos = useTecnicosStore()
const storeRol = useRolStore()
const tecnicos = ref([]);
const roles = ref([]);
const refresh = ref(1);
const active = ref(false);
const activeRol = ref(false)
const isEditing = ref(false);
const secciones = ref([])

async function llamadatos() {
    tecnicos.value = await storeTecnicos.traer();
    roles.value = await storeRol.traer();
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

const {
    agregarRol,
    verRol,
    cerrarRol,
    eliminarRols
} = useRolActions({
    storeTecnicos,
    varView,
    notificaciones,
    llamadatos,
    refresh,
    show: activeRol,
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
    secciones.value = await storeRol.traerSecciones()
    console.log(secciones.value)
    await llamadatos();
});

const propiedadesFormulario = useTecnicosBuilder({
    storeId: "RegistroTecnico",
    storePinia: "Tecnicos",
    cerrar: cerrar,
    active,
    isEditing
})

const propiedadesFormularioRol = computed(() => 
    useRolBuilder({
        storeId: "RegistroRol",
        storePinia: "Rol",
        cerrar: cerrarRol,
        active: activeRol,
        isEditing,
        permisos: secciones.value
    })
)

const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'telefono', header: 'Teléfono' },
    { accessorKey: 'direccion', header: 'Dirección' },
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
            { columna: 'estado', placeholder: 'Estado' }
        ],
    }
})

const columnsRol = [
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
                        items: getRowItemsRol(row)
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
function getRowItemsRol(row) {
    const categoria = row.original

    return [
        {
            type: 'label',
            label: 'Acciones'
        },
        {
            label: 'Editar',
            onSelect() {
                verRol(categoria)
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarRols(categoria)
            }
        }
    ]
}

const propiedadesTablaRol = computed(() => {
    return {
        titulo: 'Gestión de Roles',
        agregar: agregarRol,
        data: roles,
        columns: columnsRol,
        filtros: [
            { columna: 'estado', placeholder: 'Estado' }
        ],
    }
})
</script>

<template>
    <FondoDefault>
        <TablaNuxt :Propiedades="propiedadesTabla" />
        <Form :Propiedades="propiedadesFormulario" />
        <Form :Propiedades="propiedadesFormularioRol" />
        <TablaNuxt :Propiedades="propiedadesTablaRol" class="mt-3" />
    </FondoDefault>
</template>
