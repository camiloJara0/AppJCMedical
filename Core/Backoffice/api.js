import { decryptData } from '~/composables/Formulario/crypto'

/**
 * Cliente HTTP genérico para el Backoffice.
 * El token se guarda en texto plano en localStorage (mismo criterio que el resto de la app).
 */
export async function backofficeRequest({ metodo = 'GET', url, body = null, params = null } = {}) {
    const config = useRuntimeConfig()
    const router = useRouter()

    const token = localStorage.getItem('token')
    const expiracion = parseInt(localStorage.getItem('expiracion_sesion') ?? '0', 10)

    if (!token || (expiracion && Date.now() > expiracion)) {
        localStorage.clear()
        router.push('/')
        throw new Error('Sesión expirada')
    }

    let destino = `${config.public.api}/api/${url}`

    if (params) {
        const query = new URLSearchParams()
        Object.entries(params).forEach(([clave, valor]) => {
            if (valor !== undefined && valor !== null && valor !== '') {
                query.append(clave, valor)
            }
        })
        const qs = query.toString()
        if (qs) destino += `?${qs}`
    }

    const opciones = {
        method: metodo,
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    if (body) {
        opciones.headers['Content-Type'] = 'application/json'
        opciones.body = JSON.stringify(body)
    }

    const respuesta = await fetch(destino, opciones)

    let datos = null
    try {
        datos = await respuesta.json()
    } catch {
        datos = { success: false, message: 'Respuesta inválida del servidor' }
    }

    if (respuesta.status === 401) {
        localStorage.clear()
        router.push('/')
        throw new Error('Sesión expirada')
    }

    if (!respuesta.ok) {
        const error = new Error(datos?.message || `Error ${respuesta.status}`)
        error.status = respuesta.status
        error.datos = datos
        throw error
    }

    return datos
}

export const backoffice = {
    dashboard: () => backofficeRequest({ url: 'backoffice/dashboard' }),
    salud: () => backofficeRequest({ url: 'backoffice/salud' }),

    usuarios: (params) => backofficeRequest({ url: 'backoffice/usuarios', params }),
    usuario: (id) => backofficeRequest({ url: `backoffice/usuarios/${id}` }),
    crearUsuario: (body) => backofficeRequest({ metodo: 'POST', url: 'backoffice/usuarios', body }),
    actualizarUsuario: (id, body) => backofficeRequest({ metodo: 'PUT', url: `backoffice/usuarios/${id}`, body }),
    eliminarUsuario: (id) => backofficeRequest({ metodo: 'DELETE', url: `backoffice/usuarios/${id}` }),
    suspenderUsuario: (id, body) => backofficeRequest({ metodo: 'POST', url: `backoffice/usuarios/${id}/suspender`, body }),
    reactivarUsuario: (id) => backofficeRequest({ metodo: 'POST', url: `backoffice/usuarios/${id}/reactivar` }),
    sesionesUsuario: (id) => backofficeRequest({ url: `backoffice/usuarios/${id}/sesiones` }),
    revocarSesiones: (id) => backofficeRequest({ metodo: 'DELETE', url: `backoffice/usuarios/${id}/sesiones` }),

    roles: () => backofficeRequest({ url: 'backoffice/roles' }),
    rol: (id) => backofficeRequest({ url: `backoffice/roles/${id}` }),
    crearRol: (body) => backofficeRequest({ metodo: 'POST', url: 'backoffice/roles', body }),
    actualizarRol: (id, body) => backofficeRequest({ metodo: 'PUT', url: `backoffice/roles/${id}`, body }),
    eliminarRol: (id) => backofficeRequest({ metodo: 'DELETE', url: `backoffice/roles/${id}` }),
    permisosRol: (id) => backofficeRequest({ url: `backoffice/roles/${id}/permisos` }),
    sincronizarPermisos: (id, body) => backofficeRequest({ metodo: 'PUT', url: `backoffice/roles/${id}/permisos`, body }),
    secciones: () => backofficeRequest({ url: 'backoffice/roles/secciones' }),

    auditoria: (params) => backofficeRequest({ url: 'backoffice/auditoria', params }),
    auditoriaDetalle: (id) => backofficeRequest({ url: `backoffice/auditoria/${id}` }),
    restaurarAuditoria: (id) => backofficeRequest({ metodo: 'POST', url: `backoffice/auditoria/${id}/restaurar` }),

    errores: (params) => backofficeRequest({ url: 'backoffice/errores', params }),
    resumenErrores: () => backofficeRequest({ url: 'backoffice/errores/resumen' }),
    resolverError: (id) => backofficeRequest({ metodo: 'PUT', url: `backoffice/errores/${id}/resolver` }),
    reabrirError: (id) => backofficeRequest({ metodo: 'PUT', url: `backoffice/errores/${id}/reabrir` }),

    metricas: (params) => backofficeRequest({ url: 'backoffice/metricas', params }),
    metricasRutas: (params) => backofficeRequest({ url: 'backoffice/metricas/rutas', params }),
    sesiones: () => backofficeRequest({ url: 'backoffice/metricas/sesiones' }),
    podarSesiones: () => backofficeRequest({ metodo: 'DELETE', url: 'backoffice/metricas/sesiones' }),

    logs: (params) => backofficeRequest({ url: 'backoffice/logs', params }),
    limpiarLogs: () => backofficeRequest({ metodo: 'DELETE', url: 'backoffice/logs' }),

    respaldos: () => backofficeRequest({ url: 'backoffice/backup' }),
    exportarTabla: (body) => backofficeRequest({ metodo: 'POST', url: 'backoffice/backup/exportar', body }),
    podaRespaldos: (body) => backofficeRequest({ metodo: 'POST', url: 'backoffice/backup/poda', body }),

    configuracion: () => backofficeRequest({ url: 'backoffice/config' }),
    guardarConfiguracion: (body) => backofficeRequest({ metodo: 'PUT', url: 'backoffice/config', body })
}
