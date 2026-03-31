export async function traerClientes() {
  try {
    const config = useRuntimeConfig()
    const token = localStorage.getItem('token')
    const response = await fetch(`${config.public.api}/${config.public.cliente}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
        // agrega otros headers si los necesitas, como Authorization
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al traer Clientes:', error);
    throw error;
  }
}