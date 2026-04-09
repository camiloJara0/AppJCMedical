import { FormularioBuilder } from '~/build/Constructores/FormBuilder'
import { useReporteStore } from '~/stores/Formularios/Reportes/Reporte'

export function useRecibidoBuilder({
    storeId,
    storePinia,
}) {
    const builder = new FormularioBuilder()
    const varView = useVarView()

    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setFormularioFondo(false)
        .setFormularioShow(true)
        .setFormularioTituloFormulario('Registrar Reporte de Mantenimiento')
        .setFormularioTipo('Wizard')
        .setFormulariotamaño('MD')
        .setFormularioEstilos('w-[100%]!')
        .setBotones([
            { type: 'enviar', text: 'Siguiente', color: 'primary' },
        ])
        .setFormularioContenedorCampos('grid md:grid-cols-2 grid-cols-1')


    builder.nuevaSeccion('Actividades y observaciones')

    builder.addCampo({
        component: 'Label',
        text: `<i class="fa-solid fa-file text-blue-500 mr-1"></i> RECIBIDO POR:`,
        tamaño: 'w-full col-span-2'
    })

        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Nombre',
            placeholder: 'Nombre del que recibe reporte',
            id: 'nombre',
            name: 'nombre',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'recibido.nombre',
            upperCase: true
        })

        .addCampo({
            component: 'Input',
            type: 'text',
            label: 'Cargo',
            placeholder: 'Cargo',
            id: 'cargo',
            name: 'cargo',
            tamaño: 'w-full',
            minlength: 3,
            vmodel: 'recibido.cargo',
            upperCase: true
        })

    builder.addCampo({
        component: 'Dibujo',
        label: 'Realizado por, Dibuja tu firma',
        placeholder: 'Descripcion de la actividad',
        vmodel: 'actividades',
        tamaño: ' w-full',
        rows: 5,
        vmodel: 'recibido.firma'
    })
    return builder.build()
}
