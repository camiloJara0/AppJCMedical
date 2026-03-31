import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useEquiposBuilder({
    storeId,
    storePinia,
    isEditing,
    active,
    cerrar,
    tiposEquipos,
    clientes,
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
        .setCamposRequeridos(['Equipo.cliente_id', 'Equipo.tipo_equipo_id', 'Equipo.nombre'])
        .setFormularioContenedorCampos('grid md:grid-cols-2! grid-cols-1 ')
        .nuevaSeccion(isEditing ? 'Editar Equipo' : 'Nuevo Equipo')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-cogs text-blue-500 mr-1"></i>Datos del Equipo',
            tamaño: 'w-full md:col-span-2 col-span-1',
            forLabel: 'cliente_id',
        })
        .addCampo({
            component: 'Select',
            type: 'number',
            label: 'Cliente Asociado *',
            placeholder: 'Selecciona el cliente asociado',
            id: 'cliente_id',
            name: 'cliente_id',
            tamaño: 'w-full',
            vmodel: 'Equipo.cliente_id',
            options: clientes
        })
        .addCampo({
            component: 'Select',
            type: 'number',
            label: 'Selecciona el tipo de Equipo',
            placeholder: 'ID del tipo de equipo',
            id: 'tipo_equipo_id',
            name: 'tipo_equipo_id',
            tamaño: 'w-full',
            vmodel: 'Equipo.tipo_equipo_id',
            options: tiposEquipos,
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre *',
            placeholder: 'Nombre del equipo',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'Equipo.nombre',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Marca',
            placeholder: 'Marca del equipo',
            id: 'marca',
            name: 'marca',
            tamaño: 'w-full',
            vmodel: 'Equipo.marca',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Modelo',
            placeholder: 'Modelo del equipo',
            id: 'modelo',
            name: 'modelo',
            tamaño: 'w-full',
            vmodel: 'Equipo.modelo',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Serie',
            placeholder: 'Serie del equipo',
            id: 'serie',
            name: 'serie',
            tamaño: 'w-full',
            vmodel: 'Equipo.serie',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Ubicación',
            placeholder: 'Ubicación del equipo',
            id: 'ubicacion',
            name: 'ubicacion',
            tamaño: 'w-full',
            vmodel: 'Equipo.ubicacion',
        })
        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Placa',
            placeholder: 'Placa del equipo',
            id: 'placa',
            name: 'placa',
            tamaño: 'w-full',
            vmodel: 'Equipo.placa',
        })
        .build()
}
