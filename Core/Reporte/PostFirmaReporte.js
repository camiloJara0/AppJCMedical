export async function enviarFirma(data) {
    try {
        const varView = useVarView()
        const router = useRouter()

        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const response = await fetch(`${config.public.api}/${config.public.recibido_firma}`, {
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

        localStorage.removeItem('token')
        router.push('/')
        return true;
    } catch (error) {
        console.error('Error al enviar componente:', error);
        throw error;
    }
}
