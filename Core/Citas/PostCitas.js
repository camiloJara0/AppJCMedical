export async function enviarCitas(isEditing, cita) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ?
            `${config.public.api}/${config.public.cita}/${cita.id}` :
            `${config.public.api}/${config.public.cita}`
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cita)
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const data = await response.json();
        return true;
    } catch (error) {
        console.error('Error al enviar cita:', error);
        throw error;
    }
}
