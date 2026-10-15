import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useReporteStore } from '~/stores/Formularios/Reportes/Reporte'

/**
 * Configuración del wizard de Reporte de Mantenimiento.
 * Genera la estructura que consume ReporteForm.vue:
 * formulario.secciones[] = pasos { id, nombre, titulo, descripcion, icono,
 * requeridos, completitud, opcional, bloques[] }.
 */
export function useReporteBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar,
}) {
    const builder = new FormularioBuilder()
    const varView = useVarView()
    const reporteStore = useReporteStore()
    const datos = reporteStore.Formulario

    // ─────────────────────────────────────────────
    // LÓGICA DE DOMINIO
    // ─────────────────────────────────────────────

    /** Exclusividad Bueno / Regular / Malo por componente. */
    function seleccionarEstado(value, id, estado) {
        if (!value) return

        const componentes = datos.componentes[id]
        if (estado === 'bueno') {
            componentes.malo = false
            componentes.regular = false
        } else if (estado === 'regular') {
            componentes.bueno = false
            componentes.malo = false
        } else {
            componentes.bueno = false
            componentes.regular = false
        }
    }

    /** Asegura la estructura reactiva de cada componente del checklist. */
    function inicializarComponentes() {
        const sistemas = varView.sistemasBuilder || []

        sistemas.forEach((sistema) => {
            (sistema.componentes || []).forEach((componente) => {
                if (!datos.componentes[componente.id]) {
                    datos.componentes[componente.id] = {
                        bueno: false,
                        regular: false,
                        malo: false,
                        estado: null,
                        observacion: '',
                    }
                }
            })
        })
    }

    inicializarComponentes()

    // ─────────────────────────────────────────────
    // UTILIDADES DE CONFIGURACIÓN
    // ─────────────────────────────────────────────

    const GRILLA_CAMPOS = 'grid grid-cols-1 lg:grid-cols-12 gap-4 items-start'
    const GRILLA_GRUPO = 'grid grid-cols-1 lg:grid-cols-12 gap-3 items-start'

    const listo = (valor) =>
        Array.isArray(valor) ? valor.length > 0 : valor !== '' && valor !== null && valor !== undefined

    const porcentaje = (listos, total) =>
        total ? Math.round((listos / total) * 100) : 100

    function checkboxEstado(id, etiqueta, estado, tamaño) {
        return {
            component: 'Checkbox',
            label: etiqueta,
            vmodel: `componentes.${id}.${estado}`,
            tamaño,
            options: [{ label: etiqueta, value: estado }],
            events: {
                onChange: (value) => seleccionarEstado(value, id, estado),
            },
        }
    }

    function tarjetaComponente(componente) {
        return {
            grupo: {
                titulo: componente.nombre,
                icono: 'fa-circle-dot',
                grid: GRILLA_GRUPO,
                tamaño: 'lg:col-span-full',
                card: 'border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40 shadow-none hover:shadow-md',
            },
            campos: [
                checkboxEstado(componente.id, 'Bueno', 'bueno', 'lg:col-span-2'),
                checkboxEstado(componente.id, 'Regular', 'regular', 'lg:col-span-2'),
                checkboxEstado(componente.id, 'Malo', 'malo', 'lg:col-span-2'),
                {
                    component: 'Input',
                    label: 'Observación',
                    placeholder: 'Agregar una observación...',
                    vmodel: `componentes.${componente.id}.observacion`,
                    tamaño: 'lg:col-span-6',
                },
            ],
        }
    }

    // ─────────────────────────────────────────────
    // PASOS DEL WIZARD
    // ─────────────────────────────────────────────

    const sistemas = varView.sistemasBuilder || []
    const esFinalizado = datos.reporte.estado === 'realizada'

    // ── Paso 1: Checklist de componentes ──
    const pasoChecklist = {
        id: 'checklist',
        nombre: 'Componentes',
        titulo: 'Checklist de componentes',
        descripcion: 'Revisa el estado de cada componente de los sistemas del equipo.',
        icono: 'fa-clipboard-check',
        requeridos: [],
        completitud: (form) => {
            const estados = Object.values(form.componentes || {})
            if (!estados.length) return 0
            const marcados = estados.filter((c) => c.bueno || c.regular || c.malo).length
            return porcentaje(marcados, estados.length)
        },
        bloques: [
            {
                titulo: datos.equipo?.nombre || 'Equipo',
                icono: 'fa-gear',
                descripcion: 'Información del equipo sobre el que se realiza el mantenimiento.',
                campos: [
                    {
                        component: 'Label',
                        text: `
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div class="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                                <p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Equipo</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">${datos.equipo?.nombre || '—'}</p>
                            </div>
                            <div class="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                                <p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Cliente</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">${datos.cliente?.nombre || '—'}</p>
                            </div>
                            <div class="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                                <p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Técnico</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">${datos.tecnico?.nombre || '—'}</p>
                            </div>
                            <div class="rounded-xl bg-gray-50 dark:bg-gray-800/60 p-3">
                                <p class="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Fecha</p>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">${datos.Reporte?.fecha || '—'}</p>
                            </div>
                        </div>`,
                        tamaño: 'lg:col-span-12',
                    },
                ],
            },
            ...sistemas.map((sistema) => ({
                titulo: sistema.nombre,
                icono: 'fa-diagram-project',
                descripcion: `${(sistema.componentes || []).length} componente(s)`,
                badge: `${(sistema.componentes || []).filter((c) => {
                    const estado = datos.componentes[c.id] || {}
                    return estado.bueno || estado.regular || estado.malo
                }).length}/${(sistema.componentes || []).length}`,
                campos: (sistema.componentes || []).map(tarjetaComponente),
            })),
        ],
    }

    // ── Paso 2: Elementos utilizados ──
    const pasoElementos = {
        id: 'elementos',
        nombre: 'Elementos',
        titulo: 'Elementos utilizados',
        descripcion: 'Registra accesorios, materiales, mediciones y repuestos del servicio.',
        icono: 'fa-toolbox',
        requeridos: [],
        completitud: (form) => {
            const grupos = [form.accesorios, form.materiales, form.mediciones, form.repuestos]
            const llenos = grupos.filter((grupo) => Array.isArray(grupo) && grupo.length).length
            return porcentaje(llenos, grupos.length)
        },
        bloques: [
            {
                // titulo: 'Elementos y materiales',
                // icono: 'fa-toolbox',
                // descripcion: 'Agrega los elementos con los que se realizó el mantenimiento.',
                grid: GRILLA_CAMPOS,
                campos: [
                    {
                        component: 'GroupCampos',
                        labelGroup: 'Accesorios con los que cuenta',
                        vmodel: 'accesorios',
                        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { nombre: '', estado: '' } }],
                        campos: [
                            { typeCampo: 'Input', type: 'text', label: 'Nombre', key: 'nombre', name: 'nombre', placeholder: 'Nombre del accesorio' },
                            { typeCampo: 'Select', label: 'Estado', key: 'estado', name: 'estado', placeholder: 'Selecciona el estado', options: ['Bueno', 'Malo'] },
                        ],
                        containerCampos: 'grid grid-cols-2 gap-3',
                        tamaño: 'lg:col-span-12',
                    },
                    {
                        component: 'GroupCampos',
                        labelGroup: 'Set/Equipo patron/Materiales Utilizados',
                        vmodel: 'materiales',
                        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { descripcion: '', cantidad: '' } }],
                        campos: [
                            { typeCampo: 'Input', type: 'number', label: 'Cantidad', key: 'cantidad', name: 'cantidad', placeholder: '0' },
                            { typeCampo: 'Input', type: 'text', label: 'Descripción', key: 'descripcion', name: 'descripcion', placeholder: 'Descripcion' },
                        ],
                        containerCampos: 'grid grid-cols-2 gap-3',
                        tamaño: 'lg:col-span-12',
                    },
                    {
                        component: 'GroupCampos',
                        labelGroup: 'Mediciones Realizadas',
                        vmodel: 'mediciones',
                        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { variable: '', unidad: '', valor_medido: '', valor_esperado: '' } }],
                        campos: [
                            { typeCampo: 'Input', type: 'text', label: 'Unidad', key: 'unidad', name: 'unidad', placeholder: 'Centimetro' },
                            { typeCampo: 'Input', type: 'text', label: 'Variable', key: 'variable', name: 'variable', placeholder: 'Neumatico' },
                            { typeCampo: 'Input', type: 'number', label: 'Valor Medido', key: 'valor_medido', name: 'valor_medido', placeholder: '0' },
                            { typeCampo: 'Input', type: 'number', label: 'Valor Esperado', key: 'valor_esperado', name: 'valor_esperado', placeholder: '0' },
                        ],
                        containerCampos: 'grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3',
                        tamaño: 'lg:col-span-12',
                    },
                    {
                        component: 'GroupCampos',
                        labelGroup: 'Repuestos/Accesorios Requeridos',
                        vmodel: 'repuestos',
                        buttons: [{ icon: 'fa-solid fa-plus', label: 'Agregar', color: 'bg-blue-500', addItem: { nombre: '' } }],
                        campos: [
                            { typeCampo: 'Input', type: 'text', label: 'Nombre', key: 'nombre', name: 'nombre', placeholder: 'Nombre del repuesto' },
                        ],
                        containerCampos: 'grid grid-cols-2 gap-3',
                        tamaño: 'lg:col-span-12',
                    },
                ],
            },
        ],
    }

    // ── Paso 3: Actividades y estado ──
    const pasoActividades = {
        id: 'actividades',
        nombre: 'Actividades',
        titulo: 'Actividades y observaciones',
        descripcion: 'Documenta el trabajo realizado y define en qué etapa queda el reporte.',
        icono: 'fa-clipboard-list',
        requeridos: ['actividades', 'reporte.estado'],
        bloques: [
            {
                // titulo: 'Actividades realizadas',
                // icono: 'fa-clipboard-list',
                // descripcion: 'Describe las actividades realizadas durante el mantenimiento y cualquier observación importante.',
                grid: GRILLA_CAMPOS,
                campos: [
                    {
                        component: 'Textarea',
                        label: 'Actividades / Observaciones',
                        placeholder: 'Describe las actividades realizadas...',
                        vmodel: 'actividades',
                        tamaño: 'lg:col-span-12',
                        rows: 8,
                    },
                ],
            },
            {
                titulo: 'Estado del reporte',
                icono: 'fa-list-check',
                descripcion: 'Indica en qué etapa queda el reporte de mantenimiento.',
                grid: GRILLA_CAMPOS,
                campos: [
                    {
                        component: 'Select',
                        label: 'Estado del reporte *',
                        placeholder: 'Estado',
                        name: 'estado',
                        id: 'estado',
                        options: [
                            'En proceso',
                            'Esperando repuestos',
                            { label: 'Finalizado', value: 'realizada' },
                        ],
                        vmodel: 'reporte.estado',
                        tamaño: 'lg:col-span-4',
                    },
                    {
                        component: 'Input',
                        type: 'text',
                        label: 'Observación (opcional)',
                        placeholder: 'Describe el motivo del estado seleccionado',
                        id: 'observacion',
                        name: 'observacion',
                        vmodel: 'estado.observacion',
                        tamaño: 'lg:col-span-8',
                    },
                ],
            },
        ],
    }

    // ── Paso 4: Evidencia fotográfica ──
    const pasoEvidencia = {
        id: 'evidencia',
        nombre: 'Evidencia',
        titulo: 'Evidencia fotográfica',
        descripcion: 'Agrega imágenes del mantenimiento. Se comprimen automáticamente antes de guardarse.',
        icono: 'fa-camera',
        requeridos: [],
        opcional: true,
        completitud: () => 100,
        bloques: [
            {
                // titulo: 'Imágenes del reporte',
                // icono: 'fa-images',
                // descripcion: 'Define el tamaño de cada imagen en el PDF (100%, 50% o 30%) y su descripción.',
                campos: [
                    {
                        component: 'ImagenEvidencia',
                        label: 'Imágenes del reporte',
                        description: 'JPG, PNG o WEBP de hasta 5 MB · máximo 20 imágenes',
                        vmodel: 'images',
                        tamaño: 'lg:col-span-12',
                    },
                ],
            },
        ],
    }

    // ── Paso 5: Recomendaciones ──
    const pasoRecomendaciones = {
        id: 'recomendaciones',
        nombre: 'Recomendaciones',
        // titulo: 'Recomendaciones',
        // descripcion: 'Sugerencias para el cliente, riesgos detectados y próximas acciones.',
        // icono: 'fa-lightbulb',
        requeridos: [],
        opcional: true,
        completitud: (form) => {
            const campos = [
                form.recomendaciones?.cliente,
                form.recomendaciones?.riesgos,
                form.recomendaciones?.proximas,
            ]
            return porcentaje(campos.filter(listo).length, campos.length)
        },
        bloques: [
            {
                titulo: 'Recomendación para el cliente',
                icono: 'fa-hand-holding-heart',
                descripcion: 'Consejo o instrucción que debe seguir el cliente.',
                grid: GRILLA_CAMPOS,
                campos: [
                    {
                        component: 'Textarea',
                        label: 'Recomendación',
                        placeholder: 'Ej: Realizar limpieza de filtros mensualmente...',
                        vmodel: 'recomendaciones.cliente',
                        tamaño: 'lg:col-span-12',
                        rows: 4,
                    },
                ],
            },
            {
                titulo: 'Riesgos identificados',
                icono: 'fa-triangle-exclamation',
                descripcion: 'Riesgos detectados que podrían afectar el equipo.',
                grid: GRILLA_CAMPOS,
                campos: [
                    {
                        component: 'Textarea',
                        label: 'Riesgos',
                        placeholder: 'Ej: Desgaste avanzado en correa de transmisión...',
                        vmodel: 'recomendaciones.riesgos',
                        tamaño: 'lg:col-span-12',
                        rows: 4,
                    },
                ],
            },
            {
                titulo: 'Próximas acciones',
                icono: 'fa-forward',
                descripcion: 'Trabajos o revisiones recomendadas a futuro.',
                grid: GRILLA_CAMPOS,
                campos: [
                    {
                        component: 'Textarea',
                        label: 'Próximas acciones',
                        placeholder: 'Ej: Programar cambio de rodamientos en próxima visita...',
                        vmodel: 'recomendaciones.proximas',
                        tamaño: 'lg:col-span-12',
                        rows: 4,
                    },
                ],
            },
        ],
    }

    // ── Paso 6: Recibido (solo si el reporte queda finalizado) ──
    const pasoRecibido = {
        id: 'recibido',
        nombre: 'Recibido',
        titulo: 'Resultado y recibido',
        descripcion: 'Define cómo queda el equipo y quién recibe el servicio.',
        icono: 'fa-circle-check',
        requeridos: ['resultado.estado', 'recibido.nombre', 'recibido.correo'],
        bloques: [
            {
                // titulo: 'Resultado del mantenimiento',
                // icono: 'fa-circle-check',
                // descripcion: 'Define cómo queda el equipo después del servicio realizado.',
                grid: GRILLA_CAMPOS,
                campos: [
                    {
                        component: 'Select',
                        label: 'Resultado *',
                        placeholder: 'Seleccione un resultado',
                        name: 'resultado',
                        id: 'resultado',
                        options: [
                            'Reparado',
                            'Mantenimiento Realizado',
                            'No Reparable',
                            'Requiere Reemplazo',
                            'Sin Falla',
                        ],
                        vmodel: 'resultado.estado',
                        tamaño: 'lg:col-span-4',
                    },
                    {
                        component: 'Input',
                        type: 'text',
                        label: 'Observación del resultado (opcional)',
                        placeholder: 'Describe el resultado obtenido',
                        name: 'observacionResultado',
                        id: 'observacionResultado',
                        vmodel: 'resultado.observacion',
                        tamaño: 'lg:col-span-8',
                    },
                ],
            },
            {
                titulo: 'Persona que recibe el equipo',
                icono: 'fa-signature',
                descripcion: 'Si no se registra una firma, se enviará un correo al responsable para completar la firma digital.',
                grid: GRILLA_CAMPOS,
                campos: [
                    {
                        component: 'Input',
                        type: 'text',
                        label: 'Nombre *',
                        placeholder: 'Juan Pérez',
                        id: 'nombre',
                        name: 'nombre',
                        tamaño: 'lg:col-span-4',
                        minlength: 3,
                        vmodel: 'recibido.nombre',
                        upperCase: true,
                    },
                    {
                        component: 'Input',
                        type: 'text',
                        label: 'Cargo (opcional)',
                        placeholder: 'Gerente',
                        id: 'cargo',
                        name: 'cargo',
                        tamaño: 'lg:col-span-4',
                        minlength: 3,
                        vmodel: 'recibido.cargo',
                        upperCase: true,
                    },
                    {
                        component: 'Input',
                        type: 'email',
                        label: 'Correo *',
                        placeholder: 'correo@empresa.com',
                        id: 'correo',
                        name: 'correo',
                        vmodel: 'recibido.correo',
                        tamaño: 'lg:col-span-4',
                    },
                    {
                        component: 'Dibujo',
                        label: 'Firma (opcional)',
                        vmodel: 'recibido.firma',
                        tamaño: 'lg:col-span-12 flex justify-center pt-2',
                    },
                ],
            },
        ],
    }

    const secciones = [pasoChecklist, pasoElementos, pasoActividades, pasoEvidencia, pasoRecomendaciones]

    if (esFinalizado) secciones.push(pasoRecibido)

    // Validación global al enviar (último paso).
    const camposRequeridos = ['actividades', 'reporte.estado']
    if (esFinalizado) {
        camposRequeridos.push('resultado.estado', 'recibido.nombre', 'recibido.correo')
    }

    // ─────────────────────────────────────────────
    // ENSAMBLADO
    // ─────────────────────────────────────────────

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setCamposRequeridos(camposRequeridos)
        .setFormularioFondo(true)
        .setFormularioShow(active)
        .setFormularioTituloFormulario(
            isEditing ? 'Editar Reporte de Mantenimiento' : 'Registrar Reporte de Mantenimiento'
        )
        .setFormularioTipo('Wizard')
        .setFormulariotamaño('MD')
        .setFormularioSecciones(secciones)
        .setBotones([
            { type: 'enviar', text: 'Siguiente', color: 'primary' },
            { type: 'cerrar', text: 'Atras', color: 'neutral', accion: cerrar },
        ])

    const propiedades = builder.build()

    propiedades.formulario.autoSave = true
    propiedades.formulario.restaurarBorrador = !isEditing
    propiedades.formulario.textoEnviar = 'Enviar reporte'

    return propiedades
}
