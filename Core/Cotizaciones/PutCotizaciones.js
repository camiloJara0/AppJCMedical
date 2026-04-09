export async function actualizarCotizaciones(cotizacion) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const response = await fetch(`${config.public.api}/api/solicitud_cotizacion/${cotizacion.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: cotizacion.id,
                estado: cotizacion.estado,
                observaciones_admin: cotizacion.respuesta,
                nombre: cotizacion.nombre,
                correo: cotizacion.correo,
            })
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

        const data = await response.json();
        return true;
    } catch (error) {
        console.error('Error al traer categorias:', error);
        throw error;
    }
}