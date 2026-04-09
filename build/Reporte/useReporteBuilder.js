import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useReporteStore } from '~/stores/Formularios/Reportes/Reporte'

export function useReporteBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar,
}) {
    const builder = new FormularioBuilder()
    const varView = useVarView()
    const sistemas = varView.sistemasBuilder
    const reporteStore = useReporteStore()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(true)
        .setFormularioShow(active)
        .setFormularioTituloFormulario('Registrar Reporte de Mantenimiento')
        .setFormularioTipo('Wizard')
        .setFormulariotamaño('MD')
        .setBotones([
            { type: 'enviar', text: 'Siguiente', color: 'primary' },
            { type: 'cerrar', text: 'Cancelar', color: 'neutral', accion: cerrar },
        ])
        .setFormularioContenedorCampos('grid md:grid-cols-2 grid-cols-1')
        .nuevaSeccion('Checklist de componentes')
    for (let i = 0; i < sistemas.length; i++) {

        builder.addCampo({
            component: 'Label',
            text: `<i class="fa-solid fa-gears text-blue-500 mr-1"></i> ${sistemas[i].nombre}`,
            tamaño: 'w-full col-span-2'
        })

        for (let j = 0; j < sistemas[i].componentes.length; j++) {

            const componente = sistemas[i].componentes[j]

            // Inicializar estructura reactiva
            if (!reporteStore.Formulario.componentes[componente.id]) {
                reporteStore.Formulario.componentes[componente.id] = {
                    estado: null,
                    observacion: ''
                }
            }

            builder.addCampo({
                component: 'Radio',
                label: componente.nombre + ': ',
                vmodel: `componentes.${componente.id}.estado`,
                tamaño: 'w-full',
                options: [
                    { label: 'Bueno', value: 'bueno' },
                    { label: 'Malo', value: 'malo' },
                    { label: 'Regular', value: 'regular' }
                ]
            })

            builder.addCampo({
                component: 'Input',
                label: `Observación ${componente.nombre} (opcional)`,
                // placeholder: `Observación ${componente.nombre}`,
                placeholder: '...',
                vmodel: `componentes.${componente.id}.observacion`,
                tamaño: 'w-full'
            })
        }
    }

    builder.nuevaSeccion('Elementos utilizados')

    builder.addCampo({
        component: 'GroupCampos',
        labelGroup: 'Accesorios con los que cuenta',
        value: [],
        vmodel: 'accesorios',
        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { nombre: '', estado: '' } }],
        campos: [
            { typeCampo: 'Input', type: 'text', label: 'Nombre', key: 'nombre', name: 'nombre', placeholder: 'Nombre del accesorio' },
            { typeCampo: 'Select', label: 'Estado', key: 'estado', name: 'estado', placeholder: 'Selecciona el estado', options: ['Bueno', 'Malo'] },
        ],
        containerCampos: 'grid grid-cols-2 gap-3'
    })

    builder.addCampo({
        component: 'GroupCampos',
        labelGroup: 'Materiales Utilizados',
        value: [],
        vmodel: 'materiales',
        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', cantidad: '' } }],
        campos: [
            { typeCampo: 'Input', type: 'number', label: 'Cantidad', key: 'cantidad', name: 'cantidad', placeholder: '0' },
            { typeCampo: 'Input', type: 'text', label: 'Descripción', key: 'descripcion', name: 'descripcion', placeholder: 'Descripcion' }
        ],
        containerCampos: 'grid grid-cols-2 gap-3'
    })

    builder.addCampo({
        component: 'GroupCampos',
        labelGroup: 'Mediciones Realizadas',
        value: [],
        vmodel: 'mediciones',
        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { variable: '', unidad: '', valor_medido: '', valor_esperado: '' } }],
        campos: [
            { typeCampo: 'Input', type: 'text', label: 'Unidad', key: 'unidad', name: 'unidad', placeholder: 'Centimetro' },
            { typeCampo: 'Input', type: 'text', label: 'Variable', key: 'Variable', name: 'variable', placeholder: 'Neumatico' },
            { typeCampo: 'Input', type: 'number', label: 'Valor Medido', key: 'valorMedidio', name: 'valor_medido', placeholder: '0' },
            { typeCampo: 'Input', type: 'number', label: 'Valor Esperado', key: 'valorEsperado', name: 'valor_esperado', placeholder: '0' },
        ],
        containerCampos: 'grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3'
    })

    builder.addCampo({
        component: 'GroupCampos',
        labelGroup: 'Repuestos/Accesorios Requeridos',
        value: [],
        vmodel: 'repuestos',
        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { nombre: '', } }],
        campos: [
            { typeCampo: 'Input', type: 'text', label: 'Nombre', key: 'nombre', name: 'nombre', placeholder: 'Nombre del repuesto' },
        ]
    })

    builder.nuevaSeccion('Actividades y observaciones')

    builder.addCampo({
        component: 'Textarea',
        label: 'Actividades realizadas',
        placeholder: 'Descripcion de la actividad',
        vmodel: 'actividades',
        tamaño: 'col-span-2 w-full',
        rows: 5
    })

    builder.addCampo({
        component: 'Label',
        text: `<i class="fa-solid fa-signature text-blue-500 mr-1"></i> RECIBIDO POR: <br> <span class="text-gray-600 text-sm">Si dejas vacío el campo de firma, se enviará automáticamente un correo a la persona responsable para que firme el reporte.</span>`,
        tamaño: 'w-full col-span-2'
    })

        .addCampo({
            component: 'Input',
            type: 'email',
            label: 'Correo *',
            placeholder: 'Correo del que recibe',
            id: 'correo',
            name: 'correo',
            tamaño: 'w-full col-span-2',
            vmodel: 'recibido.correo',
        })

        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre (opcional)',
            placeholder: 'Juan Perez',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'recibido.nombre',
            upperCase: true
        })

        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Cargo (opcional)',
            placeholder: 'Gerente',
            id: 'cargo',
            name: 'cargo',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'recibido.cargo',
            upperCase: true
        })

    builder.addCampo({
        component: 'Dibujo',
        label: 'Firma del que Recibe: (opcional)',
        placeholder: 'Descripcion de la actividad',
        vmodel: 'actividades',
        tamaño: ' w-full',
        rows: 5,
        vmodel: 'recibido.firma'
    })
    return builder.build()
}
