import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { reducirImagen } from '~/Core/Productos/PostProductos';
import { useTecnicosStore } from '~/stores/Formularios/Tecnicos/Tecnico';

export function useTecnicosBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar
}) {
    const builder = new FormularioBuilder()
    const tecnicosStore = useTecnicosStore()

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
        .setCamposRequeridos(['Tecnico.nombre',])
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion(isEditing ? 'Editar Técnico' : 'Nuevo Técnico')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-wrench text-blue-500 mr-1"></i>Datos del Técnico',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'user_id',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
            placeholder: 'Nombre del técnico',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Tecnico.nombre',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Correo *',
            placeholder: 'Correo para creacion de usuario',
            id: 'correo',
            name: 'correo',
            tamaño: 'w-full',
            vmodel: 'Tecnico.correo',
        })
        .addCampo({
            component: 'Input',
            type: 'tel',
            label: 'Teléfono',
            placeholder: 'Teléfono del técnico',
            id: 'telefono',
            name: 'telefono',
            tamaño: 'w-full',
            vmodel: 'Tecnico.telefono',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Dirección',
            placeholder: 'Dirección del técnico',
            id: 'direccion',
            name: 'direccion',
            tamaño: 'w-full',
            vmodel: 'Tecnico.direccion',
        })
        .addCampo({
            component: 'Input',
            type: 'file',
            label: 'Sello o Firma',
            id: 'sello',
            name: 'sello',
            tamaño: 'w-full',
            events: {
                onChange: async (event) => {
                    const file = event.target.files[0];
                    const imagen = await reducirImagen(file)
                    tecnicosStore.Formulario.Tecnico.sello = imagen
                }
            }
        })
        .build()
}
