export async function actualizarCotizaciones(cotizacion) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const formData = new FormData();

        formData.append('id', cotizacion.id)
        formData.append('estado', cotizacion.estado)
        formData.append('obervaciones_admin', cotizacion.respuesta)
        formData.append('monto', cotizacion.monto)
        formData.append('nombre', cotizacion.nombre)
        formData.append('correo', cotizacion.correo)
        formData.append("_method", "PUT");

        if (cotizacion.archivo) {
            formData.append('archivo', cotizacion.archivo);
        }

        const response = await fetch(`${config.public.api}/api/solicitud_cotizacion/${cotizacion.id}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: formData
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