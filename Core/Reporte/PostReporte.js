import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";

export async function enviarReporte(isEditing, data) {
    try {
        const varView = useVarView()
        const reporteStore = useReporteStore()
        let componentesCheck = []

        componentesCheck = Object.entries(data.componentes).map(([id, value]) => ({
            componente_id: id,
            estado: 
                value.bueno ? 'bueno': 
                value.malo ? 'malo' : 
                value.regular ? 'regular' 
                : '',
            observacion: value.observacion,
        }));

        componentesCheck = componentesCheck.filter(d => {
            if(d.estado == '' || !d.estado) return
            return d && Object.values(d).some(v => v !== '' && v != null)
        })

        data.materiales = data.materiales.filter(d => {
            return d && Object.values(d).some(v => v !== '' && v != null);
        });
        data.mediciones = data.mediciones.filter(d => {
            return d && Object.values(d).some(v => v !== '' && v != null);
        });
        data.repuestos = data.repuestos.filter(d => {
            return d && Object.values(d).some(v => v !== '' && v != null);
        });
        data.accesorios = data.accesorios.filter(d => {
            return d && Object.values(d).some(v => v !== '' && v != null);
        });

        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')

        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ?
            `${config.public.api}/${config.public.reporte}/${data.Reporte.id}` :
            `${config.public.api}/${config.public.reporte}`
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ...data, componentes: componentesCheck })
        });

        if (!response.ok) {
            const notificacionesStore = useNotificacionesStore()
            const errorData = await response.json();
            const mensajeCompleto = errorData.message || 'Error en la solicitud';
            const mensajeCorto = mensajeCompleto.split('(')[0].trim();

            // Notificación con el mensaje del backend o fallback
            notificacionesStore.options.icono = 'warning';
            notificacionesStore.options.titulo = '¡Ha ocurrido un problema!';
            notificacionesStore.options.texto = mensajeCorto;
            notificacionesStore.options.tiempo = 5000;
            notificacionesStore.simple();
        }

        const dataRes = await response.json();
        await reporteStore.traer(true, true)
        if (isEditing) return true
        varView.actividad = data.cita.tipo
        varView.dataActividad = {
            ...data.cita
        }
        varView.showActividadDerivada = true

        varView.propiedadesPDF = dataRes.ids.Reporte.id
        varView.showPDFServicio = true
        return true;
    } catch (error) {
        console.error('Error al enviar componente:', error);
        throw error;
    }
}
