export async function actualizarSolicitudCita(solicitud) {
  try {
    const config = useRuntimeConfig()
    const token = localStorage.getItem('token')

    const formData = new FormData();
    formData.append('estado', solicitud.estado || '');
    formData.append('respuesta_admin', solicitud.respuesta_admin || '');

    if (solicitud.archivo_respuesta && solicitud.archivo_respuesta instanceof File) {
      formData.append('archivo_respuesta', solicitud.archivo_respuesta);
    }

    formData.append('_method', 'PUT');

    const response = await fetch(`${config.public.api}/api/solicitud_cita/${solicitud.id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
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
    return data;
  } catch (error) {
    console.error('Error al actualizar solicitud de cita:', error);
    throw error;
  }
}
