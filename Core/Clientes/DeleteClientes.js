export async function eliminarCliente(cliente) {
    try {
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')

        const response = await fetch(`${config.public.api}/${config.public.cliente}/${cliente.id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(cliente)
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const data = await response.json();
        return true;
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw error;
    }
}
