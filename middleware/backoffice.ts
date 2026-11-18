import { decryptData } from '~/composables/Formulario/crypto'

/**
 * Guardia de rutas del Backoffice.
 * Solo SuperAdmin (o un rol con permiso backoffice_access) puede entrar.
 */
export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return

    const token = localStorage.getItem('token')
    const expiracion = parseInt(localStorage.getItem('expiracion_sesion') ?? '0', 10)

    if (!token || (expiracion && Date.now() > expiracion)) {
        localStorage.clear()
        return navigateTo('/')
    }

    const rol = decryptData(localStorage.getItem('rol'))
    const permisos = decryptData(localStorage.getItem('Permisos'))
    const lista = Array.isArray(permisos) ? permisos : []

    const permitido = rol === 'SuperAdmin' || lista.includes('backoffice_access')

    if (!permitido) {
        return navigateTo(rol === 'Admin' ? '/Home' : '/Citas')
    }

    if (to.path === '/Backoffice' && rol !== 'SuperAdmin' && !lista.includes('backoffice_access')) {
        return navigateTo('/')
    }
})
