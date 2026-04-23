import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useComponentesBuilder({
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
        .setCamposRequeridos(['Componente.sistema_id', 'Componente.nombre'])
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion(isEditing ? 'Editar Componente' : 'Nuevo Componente')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-microchip text-blue-500 mr-1"></i>Datos del Componente',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'sistema_id',
        })
        .addCampo({
            component: 'Select',
            label: 'Sistema Sistema *',
            placeholder: 'ID del sistema',
            id: 'sistema_id',
            name: 'sistema_id',
            tamaño: 'w-full',
            vmodel: 'Componente.sistema_id',
            options: sistemas
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
            placeholder: 'Nombre del componente',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Componente.nombre',
            upperCase: true
        })
        // .addCampo({
        //     component: 'Textarea',
        //     label: 'Descripción',
        //     placeholder: 'Descripción del componente',
        //     id: 'descripcion',
        //     name: 'descripcion',
        //     tamaño: 'w-full',
        //     vmodel: 'Componente.descripcion',
        // })
        .build()
}
