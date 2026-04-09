export async function eliminarTipo_equipo(tipo_equipo) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')

        const response = await fetch(`${config.public.api}/${config.public.tipo_equipo}/${tipo_equipo.id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(tipo_equipo)
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
        console.error('Error al eliminar tipo de equipo:', error);
        throw error;
    }
}
