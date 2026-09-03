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

    function seleccionarEstado(value, id, estado) {

        if (value) {
            if (estado == 'bueno') {
                reporteStore.Formulario.componentes[id].malo = false
                reporteStore.Formulario.componentes[id].regular = false
            } else if (estado == 'regular') {
                reporteStore.Formulario.componentes[id].bueno = false
                reporteStore.Formulario.componentes[id].malo = false
            } else {
                reporteStore.Formulario.componentes[id].bueno = false
                reporteStore.Formulario.componentes[id].regular = false
            }
        }
    }

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
        .setFormularioContenedorCampos('grid lg:grid-cols-[20px_20px_20px_1fr_1fr_1fr_1fr_1fr] md:grid-cols-3! grid-cols-3!')
    builder
        .nuevaSeccion('Checklist de componentes')

        // ─────────────────────────────────────────────
        // ENCABEZADO DEL EQUIPO
        // ─────────────────────────────────────────────
        .addCampo({
            component: 'Label',
            text: `
            <div class="flex items-center gap-3 py-3 px-1">
                <div class="flex items-center justify-center
                            w-9 h-9 rounded-lg
                            bg-blue-50 dark:bg-blue-950/40
                            text-blue-600 dark:text-blue-400">
                    <i class="fa-solid fa-gear text-sm"></i>
                </div>

                <div class="min-w-0">
                    <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Equipo
                    </p>

                    <p class="text-lg md:text-xl font-semibold
                              text-gray-900 dark:text-white truncate">
                        ${reporteStore.Formulario.equipo.nombre}
                    </p>
                </div>
            </div>
        `,
            tamaño: 'w-full col-span-3 lg:col-span-8'
        })


    for (let i = 0; i < sistemas.length; i++) {

        const sistema = sistemas[i]

        // ─────────────────────────────────────────────
        // SISTEMA
        // ─────────────────────────────────────────────
        builder.addCampo({
            component: 'Label',
            text: `
            <div class="
                mt-5 mb-2
                pb-2
                border-b border-gray-200 dark:border-gray-800
            ">
                <p class="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-gray-500
                    dark:text-gray-400
                ">
                    ${sistema.nombre}
                </p>
            </div>
        `,
            tamaño: 'w-full col-span-3 lg:col-span-8'
        })


        for (let j = 0; j < sistema.componentes.length; j++) {

            const componente = sistema.componentes[j]

            // Inicializar estructura reactiva
            if (!reporteStore.Formulario.componentes[componente.id]) {
                reporteStore.Formulario.componentes[componente.id] = {
                    estado: null,
                    observacion: ''
                }
            }

            // ─────────────────────────────────────────────
            // CONTENEDOR DEL COMPONENTE
            // ─────────────────────────────────────────────
            builder.addCampo({
                component: 'Label',
                text: `
                <div class="
                    mt-3
                    p-4
                    rounded-xl
                    border
                    border-gray-200
                    dark:border-gray-800
                    bg-white
                    dark:bg-gray-900/40
                    shadow-sm
                    hover:shadow-md
                    transition-shadow
                    duration-200
                ">

                    <div class="flex items-center justify-between gap-3 mb-2">

                        <div class="min-w-0">
                            <p class="
                                text-sm
                                font-semibold
                                text-gray-900
                                dark:text-white
                                truncate
                            ">
                                <i class="fa-solid fa-circle-dot"></i>  ${componente.nombre}:
                            </p>

                        </div>

                    </div>

                    <div class="
                        grid
                        grid-cols-1
                        lg:grid-cols-12
                        gap-4
                        items-start
                    ">
            `,
                tamaño: 'w-full col-span-3 lg:col-span-8'
            })


            // ─────────────────────────────────────────────
            // ESTADO
            // ─────────────────────────────────────────────
            builder.addCampo({
                component: 'Checkbox',
                label: 'Bueno',
                vmodel: `componentes.${componente.id}.bueno`,
                tamaño: 'w-fit lg:mt-5 lg:col-span-1 col-span-1',
                options: [
                    {
                        label: 'Bueno',
                        value: 'bueno'
                    }
                ],
                events: {
                    onChange: (value) => {
                        seleccionarEstado(
                            value,
                            componente.id,
                            'bueno'
                        )
                    }
                }
            })

            builder.addCampo({
                component: 'Checkbox',
                label: 'Regular',
                vmodel: `componentes.${componente.id}.regular`,
                tamaño: 'w-min lg:mt-5 lg:col-span-1 col-span-1',
                options: [
                    {
                        label: 'Regular',
                        value: 'regular'
                    }
                ],
                events: {
                    onChange: (value) => {
                        seleccionarEstado(
                            value,
                            componente.id,
                            'regular'
                        )
                    }
                }
            })

            builder.addCampo({
                component: 'Checkbox',
                label: 'Malo',
                vmodel: `componentes.${componente.id}.malo`,
                tamaño: 'w-min lg:mt-5 lg:col-span-1 col-span-1',
                options: [
                    {
                        label: 'Malo',
                        value: 'malo'
                    }
                ],
                events: {
                    onChange: (value) => {
                        seleccionarEstado(
                            value,
                            componente.id,
                            'malo'
                        )
                    }
                }
            })


            // ─────────────────────────────────────────────
            // OBSERVACIÓN
            // ─────────────────────────────────────────────
            builder.addCampo({
                component: 'Input',
                label: 'Observación',
                placeholder: 'Agregar una observación...',
                vmodel: `componentes.${componente.id}.observacion`,
                tamaño: 'w-full lg:col-start-4 lg:col-span-5 col-span-3'
            })


            // ─────────────────────────────────────────────
            // CIERRE VISUAL DEL COMPONENTE
            // ─────────────────────────────────────────────
            builder.addCampo({
                component: 'Label',
                text: `</div></div>`,
                tamaño: 'w-full col-span-3 lg:col-span-8'
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
        containerCampos: 'grid grid-cols-2 gap-3',
        tamaño: 'lg:col-span-8 col-span-3'
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
        containerCampos: 'grid grid-cols-2 gap-3',
        tamaño: 'lg:col-span-8 col-span-3'
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
        containerCampos: 'grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3',
        tamaño: 'lg:col-span-8 col-span-3'
    })

    builder.addCampo({
        component: 'GroupCampos',
        labelGroup: 'Repuestos/Accesorios Requeridos',
        value: [],
        vmodel: 'repuestos',
        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { nombre: '', } }],
        campos: [
            { typeCampo: 'Input', type: 'text', label: 'Nombre', key: 'nombre', name: 'nombre', placeholder: 'Nombre del repuesto' },
        ],
        tamaño: 'lg:col-span-8 col-span-3'
    })

        .nuevaSeccion('Actividades y observaciones')

        .addCampo({
            component: 'Label',
            tamaño: 'lg:col-span-8 col-span-3',
            text: `
<div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">

    <div class="px-5 py-4 bg-linear-to-r from-primary-500/10 to-primary-500/5 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <i class="fa-solid fa-clipboard-list text-primary text-lg"></i>
            </div>

            <div>
                <p class="font-semibold text-gray-900 dark:text-white">
                    Actividades realizadas
                </p>

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Documenta el trabajo realizado durante el mantenimiento y cualquier observación importante.
                </p>
            </div>
        </div>
    </div>

</div>
`
        })

        .addCampo({
            component: 'Textarea',
            label: 'Actividades / Observaciones',
            placeholder: 'Describe las actividades realizadas...',
            vmodel: 'actividades',
            tamaño: 'lg:col-span-8 col-span-3',
            rows: 8
        })

        .addCampo({
            component: 'Label',
            tamaño: 'lg:col-span-8 col-span-3 pt-4',
            text: `
<div class="flex items-center gap-2">
    <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
        <i class="fa-solid fa-list-check text-blue-600"></i>
    </div>

    <div>
        <p class="font-semibold">
            Estado del reporte
        </p>

        <p class="text-xs text-gray-500 dark:text-gray-400">
            Indica en qué etapa queda el reporte de mantenimiento.
        </p>
    </div>
</div>
`
        })

        .addCampo({
            component: 'Select',
            label: 'Estado del reporte *',
            placeholder: 'Estado',
            name: 'estado',
            id: 'estado',
            options: [
                'En proceso',
                'Esperando repuestos',
                { label: 'Finalizado', value: 'realizada' }
            ],
            vmodel: 'reporte.estado',
            tamaño: 'lg:col-span-1 md:col-span-1 col-span-3'
        })

        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Observación (opcional)',
            placeholder: 'Describe el motivo del estado seleccionado',
            id: 'observacion',
            name: 'observacion',
            tamaño: 'lg:col-span-5 md:col-span-2 col-span-3',
            vmodel: 'estado.observacion'
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
    if (reporteStore.Formulario.reporte.estado == 'realizada') {

        builder
            .nuevaSeccion('Recibido')
            .addCampo({
                component: 'Label',
                tamaño: 'lg:col-span-8 col-span-3',
                text: `
<div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">

    <div class="px-5 py-4 bg-linear-to-r from-green-500/10 to-green-500/5 border-b border-gray-200 dark:border-gray-700">

        <div class="flex items-center gap-3">

            <div class="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <i class="fa-solid fa-circle-check text-green-600 text-lg"></i>
            </div>

            <div>
                <p class="font-semibold text-gray-900 dark:text-white">
                    Resultado del mantenimiento
                </p>

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Define cómo queda el equipo después del servicio realizado.
                </p>
            </div>

        </div>

    </div>

</div>
`
            })

            .addCampo({
                component: 'Select',
                label: 'Resultado *',
                placeholder: 'Seleccione un resultado',
                name: 'estado',
                id: 'estado',
                options: [
                    'Reparado',
                    'Mantenimiento Realizado',
                    'No Reparable',
                    'Requiere Reemplazo',
                    'Sin Falla'
                ],
                vmodel: 'resultado.estado',
                tamaño: 'lg:col-span-1 md:col-span-3 col-span-3'
            })

            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Observación del resultado (opcional)',
                placeholder: 'Describe el resultado obtenido',
                id: 'observacion',
                name: 'observacion',
                tamaño: 'lg:col-span-7 md:col-span-3 col-span-3',
                vmodel: 'resultado.observacion'
            })

            .addCampo({
                component: 'Label',
                tamaño: 'lg:col-span-8 col-span-3 pt-4',
                text: `
<div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

    <div class="px-5 py-4 bg-linear-to-r from-amber-500/10 to-amber-500/5">

        <div class="flex items-center gap-3">

            <div class="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <i class="fa-solid fa-signature text-amber-600"></i>
            </div>

            <div>

                <p class="font-semibold">
                    Persona que recibe el equipo
                </p>

                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Si no se registra una firma, se enviará automáticamente un correo al responsable para completar la firma digital.
                </p>

            </div>

        </div>

    </div>

</div>
`
            })

            .addCampo({
                component: 'Input',
                type: 'text',
                label: 'Nombre *',
                placeholder: 'Juan Pérez',
                id: 'nombre',
                name: 'nombre',
                tamaño: 'lg:col-span-4 md:col-span-1 col-span-3',
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
                tamaño: 'lg:col-span-4 md:col-span-2 col-span-3',
                minlength: 3,
                vmodel: 'recibido.cargo',
                upperCase: true
            })

            .addCampo({
                component: 'Input',
                type: 'email',
                label: 'Correo *',
                placeholder: 'correo@empresa.com',
                id: 'correo',
                name: 'correo',
                tamaño: 'lg:col-span-8 col-span-3',
                vmodel: 'recibido.correo',
                multiple: true
            })

            .addCampo({
                component: 'Dibujo',
                label: 'Firma (opcional)',
                tamaño: 'lg:col-span-8 col-span-3 flex justify-center pt-2',
                rows: 5,
                vmodel: 'recibido.firma'
            })
    }
    return builder.build()
}
