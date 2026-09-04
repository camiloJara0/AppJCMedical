import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useSolicitudesCitasStore } from '~/stores/Formularios/SolicitudesCitas'

export function useSolicitudCitaBuilder({
    storeId,
    storePinia,
    active,
    cerrar
}) {
    const builder = new FormularioBuilder()
    const store = useSolicitudesCitasStore()

    return builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(true)
        .setFormularioShow(active)
        .setFormulariotamaño('SM')
        .setBotones([
            { type: 'enviar', text: 'Guardar', color: 'primary' },
            { type: 'cerrar', text: 'Cancelar', color: 'neutral', accion: cerrar },
        ])
        .setFormularioContenedorCampos('flex! flex-col gap-5')
        .nuevaSeccion('Gestionar Solicitud de Cita')
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-calendar-check text-blue-500 mr-1"></i>Datos de la Solicitud',
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
            vmodel: 'SolicitudCita.estado',
            options: ['pendiente', 'en_revision', 'atendida', 'rechazada', 'convertida_cita']
        })
        .addCampo({
            component: 'Textarea',
            label: 'Respuesta / Notas *',
            placeholder: 'Escriba la respuesta o notas sobre la solicitud',
            id: 'respuesta_admin',
            name: 'respuesta_admin',
            tamaño: 'w-full',
            vmodel: 'SolicitudCita.respuesta_admin',
            upperCase: true
        })
        .addCampo({
            component: 'Input',
            type: 'file',
            label: 'Adjuntar Archivo (opcional)',
            placeholder: 'Selecciona un archivo',
            id: 'archivo_respuesta',
            name: 'archivo_respuesta',
            tamaño: 'w-full',
            events: {
                onChange: (event) => {
                    const file = event.target.files[0];
                    store.Formulario.SolicitudCita.archivo_respuesta = file
                }
            }
        })
        .build()
}
