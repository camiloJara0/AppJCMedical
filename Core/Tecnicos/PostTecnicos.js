export async function enviarTecnicos(isEditing, tecnico) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const method = isEditing ? 'PUT' : 'POST'
        const url = isEditing ?
            `${config.public.api}/${config.public.tecnico}/${tecnico.id}` :
            `${config.public.api}/${config.public.tecnico}`
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(tecnico)
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const data = await response.json();
        return true;
    } catch (error) {
        console.error('Error al enviar técnico:', error);
        throw error;
    }
}
