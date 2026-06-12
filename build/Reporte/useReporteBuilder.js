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
            { type: 'cerrar', text: 'Atras', color: 'neutral', accion: cerrar },
        ])
        .setFormularioContenedorCampos('grid md:grid-cols-2 grid-cols-1')
    builder
        .nuevaSeccion('Checklist de componentes')

        .addCampo({
            component: 'Label',
            text: `<div class="flex items-center py-2 gap-1"><i class="fa-solid fa-gear text-blue-500 mr-1"></i><p class="md:text-xl text-sm font-bold">${reporteStore.Formulario.equipo.nombre}</p></div>`
            , tamaño: 'md:col-span-2 w-full'
        })

    for (let i = 0; i < sistemas.length; i++) {

        builder.addCampo({
            component: 'Label',
            text: `<i class="fa-solid fa-gears text-blue-500 mr-1"></i> ${sistemas[i].nombre}`,
            tamaño: 'w-full md:col-span-2'
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
        labelGroup: 'Set/Equipo patron/Materiales Utilizados',
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
        label: 'Actividades realizadas/Observaciones',
        placeholder: 'Descripcion de la actividad',
        vmodel: 'actividades',
        tamaño: 'md:col-span-2 w-full',
        rows: 8
    })

    builder.addCampo({
        component: 'Select',
        label: 'Estado del reporte (opcional)',
        placeholder: 'Estado',
        name: 'estado',
        id: 'estado',
        options: [
            'En proceso',
            'Esperando repuestos',
            { label: 'Finalizado', value: 'realizada' },
        ],
        vmodel: 'reporte.estado'
    })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Observacion de estado (opcional)',
            placeholder: 'Se espera la llegada de los repuestos para finalizar el reporte',
            id: 'observacion',
            name: 'observacion',
            tamaño: 'w-full',
            vmodel: 'estado.observacion',
        })

        // Resumen de reporte de mantenimiento
//         .addCampo({
//             component: 'Label',
//             text: `
// <div class="w-full">

//     <div class="flex items-center gap-2 mb-3">
//         <div class="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
//             <i class="fa-solid fa-clipboard-check text-primary"></i>
//         </div>

//         <div>
//             <p class="text-xl font-bold text-gray-900 dark:text-white">
//                 Resumen del Reporte
//             </p>
//             <p class="text-sm text-gray-500 dark:text-gray-400">
//                 Verifica la información antes de finalizar el registro.
//             </p>
//         </div>
//     </div>

//     <div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

//         <!-- Encabezado -->
//         <div class="bg-linear-to-r from-primary-500/10 to-primary-500/5 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
//             <div class="flex items-center gap-2">
//                 <i class="fa-solid fa-file-signature text-primary"></i>
//                 <span class="font-semibold">
//                     Reporte listo para enviar
//                 </span>
//             </div>
//         </div>

//         <!-- Información principal -->
//         <div class="p-4 bg-white dark:bg-gray-800">

//             <div class="grid md:grid-cols-2 gap-3 mb-4">

//                 <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
//                     <p class="text-xs uppercase text-gray-500 mb-1">
//                         Equipo
//                     </p>
//                     <p class="font-semibold">
//                         ${reporteStore.Formulario.equipo.nombre}
//                     </p>
//                 </div>

//                 <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
//                     <p class="text-xs uppercase text-gray-500 mb-1">
//                         Cliente
//                     </p>
//                     <p class="font-semibold">
//                         ${reporteStore.Formulario.cliente?.nombre}
//                     </p>
//                 </div>

//             </div>

//             <!-- Métricas -->
//             <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">

//                 <div class="rounded-xl bg-blue-50 dark:bg-blue-950/30 p-3 text-center">
//                     <div class="text-xl font-bold text-blue-600">
//                         ${Object.keys(reporteStore.Formulario.componentes ||{}).length}
//                     </div>
//                     <div class="text-xs text-gray-600 dark:text-gray-400">
//                         Componentes
//                     </div>
//                 </div>

//                 <div class="rounded-xl bg-green-50 dark:bg-green-950/30 p-3 text-center">
//                     <div class="text-xl font-bold text-green-600">
//                         ${reporteStore.Formulario.materiales?.length || 0}
//                     </div>
//                     <div class="text-xs text-gray-600 dark:text-gray-400">
//                         Materiales
//                     </div>
//                 </div>

//                 <div class="rounded-xl bg-purple-50 dark:bg-purple-950/30 p-3 text-center">
//                     <div class="text-xl font-bold text-purple-600">
//                         ${reporteStore.Formulario.mediciones?.length || 0}
//                     </div>
//                     <div class="text-xs text-gray-600 dark:text-gray-400">
//                         Mediciones
//                     </div>
//                 </div>

//                 <div class="rounded-xl bg-orange-50 dark:bg-orange-950/30 p-3 text-center">
//                     <div class="text-xl font-bold text-orange-600">
//                         ${reporteStore.Formulario.repuestos?.length || 0}
//                     </div>
//                     <div class="text-xs text-gray-600 dark:text-gray-400">
//                         Repuestos
//                     </div>
//                 </div>

//             </div>

//         </div>

//     </div>

//     <!-- Nota -->
//     <div class="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3">
//         <i class="fa-solid fa-circle-info text-amber-500 mt-0.5"></i>

//         <div>
//             <p class="text-sm font-medium text-amber-700 dark:text-amber-300">
//                 Última revisión recomendada
//             </p>

//             <p class="text-xs text-gray-600 dark:text-gray-400">
//                 Una vez enviado, el reporte quedará registrado en el historial del equipo y podrá ser consultado posteriormente. Verifica que las observaciones, mediciones y materiales utilizados sean correctos.
//             </p>
//         </div>
//     </div>

// </div>
// `,
//             tamaño: 'w-full md:col-span-2 py-8'
//         })

        .nuevaSeccion('Recibido')

    builder.addCampo({
        component: 'Label',
        text: `<i class="fa-solid fa-signature text-blue-500 mr-1"></i> RECIBIDO POR: <br> <span class="text-gray-600 dark:text-gray-400 text-sm">Si dejas vacío el campo de firma, se enviará automáticamente un correo a la persona responsable para que firme el reporte.</span>`,
        tamaño: 'w-full md:col-span-2 pt-1'
    })

        .addCampo({
            component: 'Input',
            type: 'email',
            label: 'Correo *',
            placeholder: 'Correo del que recibe',
            id: 'correo',
            name: 'correo',
            tamaño: 'w-full',
            vmodel: 'recibido.correo',
            multiple: true,
        })

        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
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
        tamaño: ' w-full md:col-span-2 flex justify-center',
        rows: 5,
        vmodel: 'recibido.firma'
    })
    return builder.build()
}
