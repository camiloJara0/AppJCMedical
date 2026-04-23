<script setup>
import Form from "~/components/organism/Forms/Form.vue";

import { ref, onMounted, watch, h, resolveComponent } from "vue";

import FondoDefault from "~/components/atoms/Fondos/FondoDefault.vue";

import { useCotizacionesStore } from "~/stores/Formularios/Cotizaciones";
import { useCotizacionActions } from "~/composables/Usuarios/Cotizacion";
import { useCotizacionBuilder } from "~/build/Cotizacion/useCotizacionBuilder";
import TablaNuxt from "~/components/organism/Table/TablaNuxt.vue";

const route = useRoute()
const id = route.params.id
const varView = useVarView();
const notificaciones = useNotificacionesStore();
const storeCotizaciones = useCotizacionesStore()
const cotizaciones = ref([]);
const refresh = ref(1);
const config = useRuntimeConfig()
const backendUrl = config.public.api
const router = useRouter()


const active = ref(false);
const isEditing = ref(false);

const {
    options,
    mensaje,
    alertRespuestaInput
} = useNotificacionesStore();

async function llamadatos() {
    cotizaciones.value = await storeCotizaciones.traer();
    varView.datosActualizados()
}

const {
    verCotizacion,
    cerrar,
    eliminarCotizacionModal
} = useCotizacionActions({
    storeCotizaciones,
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
            
        }
    }
);

// Cargar los cotizaciones desde el store
onMounted(async () => {
    const user = varView.getRol
    if (!user || user !== 'Admin') {
        options.position = 'top-end',
        options.background = '#d33',
        options.texto = "Ingresa como Administrador",
        options.tiempo = 1500,
        mensaje()
        localStorage.setItem('cotizacion', `/Cotizacion/${id}`)
        router.push('/Cotizacion')
    }

    await llamadatos()
    if (id) {
        cotizaciones.value = cotizaciones.value.filter(c => c.id === parseInt(id))
    }
});

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
                estado === 'rechazada'
                    ? 'error'
                    : estado === 'atendida'
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
        accessorKey: 'correo',
        header: () => h('div', { class: 'text-right' }, 'Correo'),
        cell: ({ row }) =>
            h(
                'div',
                { class: 'text-right font-medium' },
                String(row.getValue('correo'))
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
    const cotizacion = row.original

    return [
        {
            type: 'label',
            label: 'Acciones'
        },
        {
            label: 'Responder',
            onSelect() {
                console.log('editar', cotizacion)
                verCotizacion(cotizacion)
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Eliminar',
            onSelect() {
                eliminarCotizacionModal(cotizacion)
            }
        }
    ]
}

const propiedadesForm = computed(() => {
    return useCotizacionBuilder({
        storeId: "EditarCotizacion",
        storePinia: "Cotizacion",
        cerrar: cerrar,
        active,
    })
})

const propiedadesTabla = computed(() => {
    return {
        titulo: 'Cotización numero: ' + id,
        data: cotizaciones,
        columns: columns,
        filtros: [
            { columna: 'estado', placeholder: 'Estado' }
        ],
    }
})

function borrarCotizacion () {
    localStorage.removeItem('cotizacion')
}
</script>

<template>
    <FondoDefault>
        <UButton icon="i-lucide-arrow-left-to-line" color="neutral" variant="link" class="my-2">
            <NuxtLink to="/Cotizacion" @click="borrarCotizacion">Atrás, Cotizaciones completas</NuxtLink>
        </UButton>
        <TablaNuxt :Propiedades="propiedadesTabla"></TablaNuxt>
        <Form :Propiedades="propiedadesForm">
            <div class="">
                <div class="flex overflow-x-auto">
                    <div class="m-3" v-for="item in storeCotizaciones.Formulario.Cotizacion.productos"
                        :key="item.producto.id">
                        <div class="h-full w-40 flex flex-col justify-center">
                            <img :src="`${backendUrl}/storage/${item.producto.imagen}`" :alt="item.producto.nombre"
                                class="card-img-top object-fit-cover border rounded"
                                style="height: 100px; object-fit: cover;">
                            <div class="text-center p-2">
                                <p class="font-semibold text-xs">{{ item.producto.nombre }}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </Form>
    </FondoDefault>
</template>
