// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { reducirImagen } from '~/Core/Productos/PostProductos';
import { useProductosStore } from '~/stores/Formularios/Productos';

export function useProductosBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar,
    categorias
}) {
    const productosStore = useProductosStore()
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
        .setCamposRequeridos(['Producto.nombre', 'Producto.descripcion','Producto.stock',])
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion(isEditing ? 'Editar Producto' : 'Nuevo Producto')
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
            placeholder: 'Nombre del producto',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Producto.nombre',
            upperCase: true
        })
        .addCampo({
            component: 'Textarea',
            label: 'Descripción',
            placeholder: 'Descripción de la categoría',
            id: 'descripcion',
            name: 'descripcion',
            tamaño: 'w-full',
            vmodel: 'Producto.descripcion',
            upperCase: true
        })
        .addCampo({
            component: 'Select',
            options: categorias,
            label: 'Categoría *',
            placeholder: 'Selecciona una categoria',
            id: 'categoria',
            name: 'categoria',
            tamaño: 'w-full',
            vmodel: 'Producto.categoria_id',
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            label: 'Precio',
            placeholder: '0',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            vmodel: 'Producto.precio',
        })
        .addCampo({
            component: 'Input',
            type: 'file',
            label: 'Imagen del Producto',
            id: 'sello',
            name: 'sello',
            tamaño: 'w-full cursor-pointer',
            events: {
                onChange: async (event) => {
                    const file = event.target.files[0];
                    const imagen = await reducirImagen(file)
                    productosStore.Formulario.Producto.imagen = imagen
                }
            }
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            label: 'Stock',
            placeholder: '0',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            vmodel: 'Producto.stock',
        })
        .build()
}