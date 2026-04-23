import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useTipo_equiposBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar,
    sistemas
}) {
    const builder = new FormularioBuilder()

    return builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(true)
        .setFormularioShow(active)
        .setFormulariotamaño('SM')
        .setBotones([
            { type: 'enviar', text: 'Enviar', color: 'primary'},
            { type: 'cerrar', text: 'Cancelar', color: 'neutral', accion: cerrar },
        ])
        .setCamposRequeridos(['Tipo_equipo.nombre'])
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion(isEditing ? 'Editar Tipo de Equipo' : 'Nuevo Tipo de Equipo')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-layer-group text-blue-500 mr-1"></i>Datos del Tipo de Equipo',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'nombre',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
            placeholder: 'Nombre del tipo de equipo',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Tipo_equipo.nombre',
            upperCase: true
        })
        .addCampo({
            component: 'SelectMultiple',
            type: 'text',
            label: 'Sistemas',
            placeholder: 'Selecciona los sitemas con los que cuenta la maquina',
            id: 'sistemas',
            name: 'sistemas',
            tamaño: 'w-full',
            vmodel: 'Tipo_equipo.sistemas',
            options: sistemas
        })
        .build()
}
