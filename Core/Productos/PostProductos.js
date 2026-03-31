export async function enviarProductos(isEditing, producto) {
    try {

        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const url = isEditing ?
            `${config.public.api}/api/actualiza_productos` :
            `${config.public.api}/api/productos`
        const method = isEditing ? 'POST' : 'POST'

        // Construir FormData
        const formData = new FormData();
        formData.append("nombre", producto.nombre);
        formData.append("descripcion", producto.descripcion);
        formData.append("precio_referencial", producto.precio || '');
        formData.append("stock", producto.stock);
        formData.append("categoria_id", producto.categoria_id);

        // Si hay imagen seleccionada
        if (producto.imagen) {
            const blob = producto.imagen
            const fileImagen = new File([blob], "imagen.jpg", { type: blob.type });
            formData.append("imagen", fileImagen);
        }

        if (isEditing) {
            // formData.append("_method", "PUT");
            formData.append("id", producto.id);
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: formData
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

export function reducirImagen(file, maxWidth = 200, maxHeight = 200, calidad = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                let width = img.width;
                let height = img.height;

                // Mantener proporción
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Exportar como Blob comprimido
                canvas.toBlob(
                    blob => {
                        if (blob) resolve(blob);
                        else reject(new Error("No se pudo generar el blob"));
                    },
                    "image/jpeg",
                    calidad // 70% de calidad
                );
            };
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}