// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useCategoriasBuilder({
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
            { type: 'cerrar', text: 'Cancelar', color: 'neutral', accion: cerrar },
        ])
        .setCamposRequeridos(['Categoria.nombre', 'Categoria.descripcion',,])
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion(isEditing ? 'Editar Categoria' : 'Nueva Categoria')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-building text-blue-500 mr-1"></i>Datos de la Categoria',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'nombre',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
            placeholder: 'Nombre de la categoría',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Categoria.nombre',
            upperCase: true
        })
        .addCampo({
            component: 'Textarea',
            label: 'Descripción',
            placeholder: 'Descripción de la categoría',
            id: 'descripcion',
            name: 'descripcion',
            tamaño: 'w-full',
            vmodel: 'Categoria.descripcion',
            upperCase: true
        })
        .build()
}