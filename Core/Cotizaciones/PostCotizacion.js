export async function enviarCotizacion(cotizacion) {
  try {
    const config = useRuntimeConfig()
    const formData = new FormData();

    // Campos principales
    formData.append('nombre', cotizacion.nombre);
    formData.append('correo', cotizacion.correo);
    formData.append('descripcion', cotizacion.mensaje);
    formData.append('NIT', cotizacion.nit);
    formData.append('telefono', cotizacion.telefono);

    // Imagen de referencia (archivo)
    if (cotizacion.file) {
      formData.append('imagenes_referencia', cotizacion.file);
    }

    // Productos (array)
    cotizacion.productos.forEach((producto, index) => {
      formData.append(`productos[${index}][id]`, producto.id);
      formData.append(`productos[${index}][cantidad]`, producto.cantidad ?? 1);
      if (producto.comentarios) {
        formData.append(`productos[${index}][comentarios]`, producto.comentarios);
      }
    });

    const response = await fetch(`${config.public.api}/api/solicitar_cotizacion`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar cotización:', error);
    throw error;
  }
}
