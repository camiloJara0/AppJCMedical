import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { useApiRest } from '~/stores/apiRest.js';
import { encryptData } from '~/composables/Formulario/crypto.js';
import { traerDatos } from '../BDload';
// Funcion para validar conexion a internet y enviar fomulario a API
export const login = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const router = useRouter()
    const varView = useVarView();

    const online = navigator.onLine;
    if (online) {
        try {
            varView.cargando = true
            // mandar a api
            const bodyF = JSON.stringify({
                    correo: datos.Usuario.correo,
                    contraseña: datos.Usuario.contraseña
            })

            const respuesta = await fetch(`${config.public.api}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: bodyF
            });

            console.log(respuesta)
            const data = await respuesta.json();
            if (data.success) {
                varView.cargando = false
                notificacionesStore.options.titulo = 'Iniciando Sesión...'
                notificacionesStore.options.texto = "Iniciando sesion, espere un momento mientras se cargan todos los datos"
                notificacionesStore.loading()

                const tokenEncrypt = encryptData(data.access_token);
                const rolEncrypt = encryptData(data.user.rol);
                const userEncrypt = encryptData(data.user);

                localStorage.setItem('token', data.access_token);
                localStorage.setItem('rol', rolEncrypt);
                localStorage.setItem('user', userEncrypt);

                await traerDatos((porcentaje, texto) => {
                    actualizarProgreso(porcentaje, texto);
                });
                actualizarProgreso(100, 'completado')

                if(data.user.rol === 'Admin'){
                    const cotizacion = localStorage.getItem('cotizacion')
                    router.push( cotizacion ? cotizacion : '/Home')
                } else {
                    router.push('/Citas')
                }

                notificacionesStore.close()
                return true
            } else {
                varView.cargando = false
                notificacionesStore.options.icono = 'error'
                notificacionesStore.options.titulo = '¡No se pudo iniciar Sesion!'
                notificacionesStore.options.texto = respuesta.message
                notificacionesStore.options.tiempo = 3000
                notificacionesStore.simple()
                return false
            }
        } catch (error) {
            varView.cargando = false
            notificacionesStore.options.icono = 'error'
            notificacionesStore.options.titulo = '¡No se pudo iniciar Sesion!'
            notificacionesStore.options.texto = 'Informacion invalida'
            notificacionesStore.options.tiempo = 3000
            notificacionesStore.simple()
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};

export function actualizarProgreso(porcentaje, texto = '') {
    const bar = document.getElementById('swal-progress');
    const percent = document.getElementById('swal-percent');
    const text = document.getElementById('swal-text');

    if (bar) bar.style.width = `${porcentaje}%`;
    if (percent) percent.innerText = `${porcentaje}%`;
    if (text && texto) text.innerText = texto;
}
