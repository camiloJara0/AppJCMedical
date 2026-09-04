export async function eliminarSolicitudCita(solicitud) {
  try {
    const config = useRuntimeConfig()
    const token = localStorage.getItem('token')

    const response = await fetch(`${config.public.api}/api/solicitud_cita/${solicitud.id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const notificacionesStore = useNotificacionesStore()
      const errorData = await response.json();
      const mensajeCompleto = errorData.message || 'Error en la solicitud';
      const mensajeCorto = mensajeCompleto.split('(')[0].trim();

      notificacionesStore.options.icono = 'warning';
      notificacionesStore.options.titulo = '¡Ha ocurrido un problema!';
      notificacionesStore.options.texto = mensajeCorto;
      notificacionesStore.options.tiempo = 5000;
      notificacionesStore.simple();
      return false;
    }

    const data = await response.json();
    return true;
  } catch (error) {
    console.error('Error al eliminar solicitud de cita:', error);
    throw error;
  }
}
