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
            { type: 'enviar', text: 'Enviar', color: 'primary'},
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
            labelGroup: 'Materiales Utilizados',
            value: [],
            vmodel: 'materiales',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', cantidad: '' } }],
            campos: [
                { typeCampo: 'Input', type: 'number', label: 'Cantidad', key: 'cantidad', name: 'cantidad', placeholder: '0' },
                { typeCampo: 'Input', type: 'text', label: 'Descripción', key: 'descripcion', name: 'descripcion', placeholder: 'Descripcion' }
            ]
        })

        builder.addCampo({
            component: 'GroupCampos',
            labelGroup: 'Mediciones Realizadas',
            value: [],
            vmodel: 'mediciones',
            buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { variable: '', unidad: '', valor_medido: '', valor_esperado: '' } }],
            campos: [
                { typeCampo: 'Input', type: 'text', label: 'Variable', key: 'Variable', name: 'variable', placeholder: '0' },
                { typeCampo: 'Input', type: 'text', label: 'Unidad', key: 'unidad', name: 'unidad', placeholder: '0' },
                { typeCampo: 'Input', type: 'number', label: 'Valor Medido', key: 'valorMedidio', name: 'valor_medido', placeholder: '0' },
                { typeCampo: 'Input', type: 'number', label: 'Valor Esperado', key: 'valorEsperado', name: 'valor_esperado', placeholder: '0' },
            ]
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
        })
    return builder.build()
}
