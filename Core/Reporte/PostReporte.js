export async function enviarReporte(data) {
    try {
        console.log(data)
        data.componentes = Object.entries(data.componentes).map(([id, value]) => ({
            componente_id: id,
            estado: value.estado,
            observacion: value.observacion,
        }));

        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const response = await fetch(`${config.public.api}/${config.public.reporte}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const dataRes = await response.json();
        console.log(dataRes)
        return true;
    } catch (error) {
        console.error('Error al enviar componente:', error);
        throw error;
    }
}
