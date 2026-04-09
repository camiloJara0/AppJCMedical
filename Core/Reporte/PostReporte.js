export async function enviarReporte(data) {
    try {
        const varView = useVarView()
        data.componentes = Object.entries(data.componentes).map(([id, value]) => ({
            componente_id: id,
            estado: value.estado,
            observacion: value.observacion,
        }));

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
        const response = await fetch(`${config.public.api}/${config.public.reporte}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
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

        varView.propiedadesPDF = dataRes.ids.Reporte.id
        varView.showPDFServicio = true
        return true;
    } catch (error) {
        console.error('Error al enviar componente:', error);
        throw error;
    }
}
