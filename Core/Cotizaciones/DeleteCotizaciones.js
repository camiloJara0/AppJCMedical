export async function eliminarCotizacion(cotizacion) {
    try {
        
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')

        const response = await fetch(`${config.public.api}/api/eliminar_cotizacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                id: cotizacion.id
            })
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const data = await response.json();
        return true;
    } catch (error) {
        console.error('Error al traer productos:', error);
        throw error;
    }
}