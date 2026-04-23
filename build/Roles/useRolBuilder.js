import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useRolBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar,
    permisos
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
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion(isEditing ? 'Editar Rol' : 'Nuevo Rol')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-gears text-blue-500 mr-1"></i>Rol de usuario',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'nombre',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
            placeholder: 'Nombre del rol',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Rol.nombre',
            upperCase: true
        })
        .addCampo({
            component: 'Permisos',
            placeholder: 'Seleccione los permisos en cada Seccion',
            id: 'permisos',
            name: 'permisos',
            tamaño: 'w-full md:col-span-2',
            vmodel: 'Rol.permisos',
            options: permisos,
            showOptions: true,
        })
        .build()
}
