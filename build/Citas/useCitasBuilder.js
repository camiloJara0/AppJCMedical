import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useCitasBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar,
    tecnicos,
    clientes,
    equipos
}) {
    const builder = new FormularioBuilder()

    return builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(true)
        .setFormularioShow(active)
        .setFormulariotamaño('MD')
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'primary'},
            { type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrar },
        ])
        .setCamposRequeridos(['Cita.tecnico_id', 'Cita.cliente_id', 'Cita.equipo_id', 'Cita.fecha', 'Cita.hora'])
        .setFormularioContenedorCampos('grid md:grid-cols-2! grid-cols-1 ')
        .nuevaSeccion(isEditing ? 'Editar Cita' : 'Nueva Cita')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-calendar text-blue-500 mr-1"></i>Datos de la Cita',
            tamaño: 'w-full md:col-span-2 col-span-1',
            forLabel: 'tecnico_id',
        })
        .addCampo({
            component: 'SelectSearch',
            type: 'number',
            label: 'Técnico *',
            placeholder: 'Selecciona el técnico encargado',
            id: 'tecnico_id',
            name: 'tecnico_id',
            tamaño: 'w-full',
            vmodel: 'Cita.tecnico_id',
            options: tecnicos
        })
        .addCampo({
            component: 'SelectSearch',
            type: 'number',
            label: 'Cliente *',
            placeholder: 'Selecciona el cliente Asociado',
            id: 'cliente_id',
            name: 'cliente_id',
            tamaño: 'w-full',
            vmodel: 'Cita.cliente_id',
            options: clientes
        })
        .addCampo({
            component: 'Select',
            type: 'number',
            label: 'Equipo *',
            placeholder: 'Selecciona el equipo',
            id: 'equipo_id',
            name: 'equipo_id',
            tamaño: 'w-full',
            vmodel: 'Cita.equipo_id',
            options: equipos
        })
        .addCampo({
            component: 'Select',
            type: 'text',
            label: 'Tipo *',
            placeholder: 'Tipo de cita',
            id: 'tipo',
            name: 'tipo',
            tamaño: 'w-full',
            vmodel: 'Cita.tipo',
            options: [
                'Preventivo',
                'Correctivo',
                'Diagnóstico',
                'Predictivo',
                'Proactivo',
                'Detectivo',
                'Mantenimiento de emergencia',
                'Mantenimiento rutinario',
                'Mantenimiento mayor',
                'Mantenimiento menor'
            ]
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            label: 'Fecha *',
            placeholder: 'Fecha de la cita',
            id: 'fecha',
            name: 'fecha',
            tamaño: 'w-full',
            vmodel: 'Cita.fecha',
        })
        .addCampo({
            component: 'Input',
            type: 'time',
            label: 'Hora *',
            placeholder: 'Hora de la cita',
            id: 'hora',
            name: 'hora',
            tamaño: 'w-full',
            vmodel: 'Cita.hora',
        })
        .build()
}
