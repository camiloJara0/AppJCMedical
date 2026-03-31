import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useClientesBuilder({
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
        .setCamposRequeridos(['Cliente.nombre', 'Cliente.telefono', 'Cliente.correo'])
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion(isEditing ? 'Editar Cliente' : 'Nuevo Cliente')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Datos del Cliente',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'nombre',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
            placeholder: 'Nombre del cliente',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Cliente.nombre',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'tel',
            label: 'Teléfono *',
            placeholder: 'Teléfono del cliente',
            id: 'telefono',
            name: 'telefono',
            tamaño: 'w-full',
            vmodel: 'Cliente.telefono',
        })
        .addCampo({
            component: 'Input',
            type: 'email',
            label: 'Correo *',
            placeholder: 'Correo del cliente',
            id: 'correo',
            name: 'correo',
            tamaño: 'w-full',
            vmodel: 'Cliente.correo',
        })
        .build()
}
