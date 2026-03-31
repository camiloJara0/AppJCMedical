import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useSistemasBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar
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
            { type: 'cancelar', text: 'Cancelar', color: 'neutral', accion: cerrar },
        ])
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion(isEditing ? 'Editar Sistema' : 'Nuevo Sistema')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-gears text-blue-500 mr-1"></i>Datos del Sistema',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'nombre',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
            placeholder: 'Nombre del sistema',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Sistema.nombre',
            upperCase: true
        })
        // .addCampo({
        //     component: 'Textarea',
        //     label: 'Descripción',
        //     placeholder: 'Descripción del sistema',
        //     id: 'descripcion',
        //     name: 'descripcion',
        //     tamaño: 'w-full',
        //     vmodel: 'Sistema.descripcion',
        // })
        .build()
}
