export async function enviarReportes(isEditing, reporte) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ?
            `${config.public.api}/${config.public.reporte}/${reporte.id}` :
            `${config.public.api}/${config.public.reporte}`

        // Construir FormData
        console.log('Reporte a enviar:', reporte); // Agrega este log para depuración
        const formData = new FormData();
        reporte.images.forEach((image, index) => {
            const blob = image
            const fileImagen = new File([blob], `imagen_${index}.jpg`, { type: blob.type });
            formData.append("images[]", fileImagen);
        });
        reporte.forEach((value, key) => {
            if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, value);
            }
        });

        if (isEditing) {
            formData.append("_method", "PUT");
            formData.append("id", reporte.id);
        }

        // const response = await fetch(url, {
        //     method: method,
        //     headers: {
        //         'Accept': 'application/json',
        //         'Authorization': `Bearer ${token}`
        //     },
        //     body: formData
        // });

        // if (!response.ok) {
        //     const notificacionesStore = useNotificacionesStore()
        //     const errorData = await response.json();
        //     const mensajeCompleto = errorData.message || 'Error en la solicitud';
        //     const mensajeCorto = mensajeCompleto.split('(')[0].trim();

        //     // Notificación con el mensaje del backend o fallback
        //     notificacionesStore.options.icono = 'warning';
        //     notificacionesStore.options.titulo = '¡Ha ocurrido un problema!';
        //     notificacionesStore.options.texto = mensajeCorto;
        //     notificacionesStore.options.tiempo = 5000;
        //     notificacionesStore.simple();
        // }

        // const data = await response.json();
        // return true;
    } catch (error) {
        console.error('Error al enviar reporte:', error);
        throw error;
    }
}
