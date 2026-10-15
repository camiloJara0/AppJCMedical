/**
 * Utilidades de imágenes para la evidencia fotográfica del reporte.
 * Los límites son coherentes con la validación del backend
 * (ReporteController: IMAGEN_MIMES / IMAGEN_MAX_BYTES / IMAGEN_MAX_CANTIDAD).
 */

export const IMAGEN_CONFIG = Object.freeze({
    formatos: ['image/jpeg', 'image/png', 'image/webp'],
    formatosTexto: 'JPG, JPEG, PNG o WEBP',
    maxBytes: 5 * 1024 * 1024,
    maxCantidad: 20,
    maxPx: 1600,
    calidad: 0.85,
})

/**
 * Valida un archivo de imagen.
 * @param {File} file
 * @param {{formatos?: string[], maxBytes?: number}} [config]
 * @returns {string|null} Mensaje de error o null si es válido.
 */
export function validarImagen(file, config = IMAGEN_CONFIG) {
    if (!file) return 'Archivo vacío.'

    const formatos = config.formatos || IMAGEN_CONFIG.formatos
    const maxBytes = config.maxBytes || IMAGEN_CONFIG.maxBytes

    if (!formatos.includes(file.type)) {
        return `Formato no permitido (${file.type || 'desconocido'}). Usa ${config.formatosTexto || IMAGEN_CONFIG.formatosTexto}.`
    }

    if (file.size > maxBytes) {
        return `Supera el tamaño máximo de ${tamañoLegible(maxBytes)} (archivo: ${tamañoLegible(file.size)}).`
    }

    return null
}

/**
 * Lee un archivo como data URL (base64).
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function leerComoDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
        reader.readAsDataURL(file)
    })
}

/**
 * Comprime y redimensiona una imagen en el navegador para reducir
 * su peso antes de guardarla en localStorage y enviarla al backend.
 *
 * @param {File|Blob} file
 * @param {number} [maxPx] Lado máximo en píxeles.
 * @param {number} [calidad] Calidad JPEG (0-1).
 * @returns {Promise<{base64: string, width: number, height: number}>}
 */
export async function comprimirImagen(file, maxPx = IMAGEN_CONFIG.maxPx, calidad = IMAGEN_CONFIG.calidad) {
    const dataUrl = await leerComoDataURL(file)

    try {
        const img = await cargarImagen(dataUrl)
        const factor = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight))
        const width = Math.max(1, Math.round(img.naturalWidth * factor))
        const height = Math.max(1, Math.round(img.naturalHeight * factor))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        const comprimido = canvas.toDataURL('image/jpeg', calidad)

        // Si el navegador no pudo codificar (imagen corrupta), usamos el original.
        return {
            base64: comprimido && comprimido.startsWith('data:image/') ? comprimido : dataUrl,
            width,
            height,
        }
    } catch {
        return { base64: dataUrl, width: 0, height: 0 }
    }
}

/**
 * Convierte bytes a una representación legible.
 * @param {number} bytes
 * @returns {string}
 */
export function tamañoLegible(bytes) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function cargarImagen(src) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Imagen inválida.'))
        img.src = src
    })
}
