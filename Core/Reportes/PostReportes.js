export async function enviarReportes(isEditing, reporte) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ?
            `${config.public.api}/${config.public.reporte}/${reporte.id}` :
            `${config.public.api}/${config.public.reporte}`
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reporte)
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const data = await response.json();
        return true;
    } catch (error) {
        console.error('Error al enviar reporte:', error);
        throw error;
    }
}
