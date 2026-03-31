export async function traerComponentes() {
  try {
    const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
    const response = await fetch(`${config.public.api}/${config.public.componente}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al traer componentes:', error);
    throw error;
  }
}

export async function traerComponentesPorSistema(sistemaId) {
  try {
    const config = useRuntimeConfig()
    const response = await fetch(`${config.public.api}/${config.public.componente}?sistema_id=${sistemaId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al traer componentes por sistema:', error);
    throw error;
  }
}
