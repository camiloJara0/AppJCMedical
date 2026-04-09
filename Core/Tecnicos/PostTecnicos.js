export async function enviarTecnicos(isEditing, tecnico) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const method = isEditing ? 'POST' : 'POST'
        const url = isEditing ?
            `${config.public.api}/${config.public.tecnico}/${tecnico.id}` :
            `${config.public.api}/${config.public.tecnico}`

        // Construir FormData
        const formData = new FormData();
        formData.append("nombre", tecnico.nombre);
        formData.append("correo", tecnico.correo);
        formData.append("telefono", tecnico.telefono);
        formData.append("direccion", tecnico.direccion || '');

        // Si hay imagen seleccionada
        if (tecnico.sello) {
            const blob = tecnico.sello
            const fileImagen = new File([blob], "imagen.jpg", { type: blob.type });
            formData.append("sello", fileImagen);
        }

        if (isEditing) {
            formData.append("_method", "PUT");
            formData.append("id", tecnico.id);
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
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
        console.error('Error al enviar técnico:', error);
        throw error;
    }
}
