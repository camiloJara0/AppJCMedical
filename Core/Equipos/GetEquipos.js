export async function traerEquipos() {
  try {
    const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
    const response = await fetch(`${config.public.api}/${config.public.equipo}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al traer equipos:', error);
    throw error;
  }
}
