export async function traerSistemasEquipos(id) {
  try {
    const config = useRuntimeConfig()
    const token = localStorage.getItem('token')
    const response = await fetch(`${config.public.api}/${config.public.tipo_equipo}/${id}`, {
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
    return data.sistemas;
  } catch (error) {
    console.error('Error al traer sistemas:', error);
    throw error;
  }
}
