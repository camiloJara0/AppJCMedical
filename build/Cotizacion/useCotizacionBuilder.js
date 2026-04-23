// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useCotizacionBuilder({
    storeId,
    storePinia,
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
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion('Responder Cotización')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-building text-blue-500 mr-1"></i>Datos de la Categoria',
            tamaño: 'w-full lg:col-span-4 md:col-span-3 col-span-1',
            forLabel: 'nombre',
        })
        .addCampo({
            component: 'Select',
            type: 'text',
            label: 'Estado *',
            placeholder: 'Estado',
            id: 'estado',
            name: 'estado',
            tamaño: 'w-full',
            vmodel: 'Cotizacion.estado',
            options: ['pendiente','atendida','rechazada']
        })
        .addCampo({
            component: 'Input',
            type: 'number',
            label: 'Monto Cotizado',
            placeholder: '0.00',
            id: 'monto',
            name: 'monto',
            tamaño: 'w-full',
            vmodel: 'Cotizacion.monto',
        })
        .addCampo({
            component: 'Textarea',
            label: 'Respuesta/Notas *',
            placeholder: 'Escriba la respuesta o notas sobre la cotización',
            id: 'respuesta',
            name: 'respuesta',
            tamaño: 'w-full',
            vmodel: 'Cotizacion.respuesta',
            upperCase: true
        })
        .build()
}