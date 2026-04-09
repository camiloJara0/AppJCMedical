// acciones validar y enviar fomularios
// Login
import { login } from '~/Core/Login/Ingresar';
import { validarYEnviarCambiarContraseña } from '~/Core/Login/CambiarContraseña';
import { validarYEnviarCambiarContraseñaPrimerVez } from '~/Core/Login/CambiarContraseñaPrimerVez';
// Categorias
import { enviarCategorias } from '~/Core/Categorias/PostCategorias';
// Productos
import { enviarProductos } from '~/Core/Productos/PostProductos';
// Cotizacion
import { enviarCotizacion } from '~/Core/Cotizaciones/PostCotizacion';
import { actualizarCotizaciones } from '~/Core/Cotizaciones/PutCotizaciones';
// Clientes
import { enviarClientes } from '~/Core/Clientes/PostClientes';
// Tecnicos
import { enviarTecnicos } from '~/Core/Tecnicos/PostTecnicos';
// Tipo_equipo
import { enviarTipo_equipos } from '~/Core/Tipo_equipos/PostTipo_equipos';
// Equipos
import { enviarEquipos } from '~/Core/Equipos/PostEquipos';
// Citas
import { enviarCitas } from '~/Core/Citas/PostCitas';
// reportes
import { enviarReporte } from '~/Core/Reporte/PostReporte';
//Sistemas
import { enviarSistemas } from '~/Core/Sistemas/PostSistemas';
// Componentes
import { enviarComponentes } from '~/Core/Componentes/PostComponentes';
import { enviarFirma } from '~/Core/Reporte/PostFirmaReporte';


// Importa accion de cada formulario desde el core
export const accionesFormularios = {
    Ingresar: async (data) => {
        const respuesta = await login(data);
        return respuesta;
    },
    RecuperarContraseña: async (data) => {
        const respuesta = await validarYEnviarCambiarContraseña(data);
        return respuesta
    },
    CambiarContraseñaPrimerVez: async (data) => {
        const respuesta = await validarYEnviarCambiarContraseñaPrimerVez(data);
        return respuesta
    },
    RegistroCategoria: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarCategorias(varView.isEditing, data.Categoria)
        return respuesta
    },
    RegistrarProducto: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarProductos(varView.isEditing, data.Producto)
        return respuesta
    },
    EditarCotizacion: async (data) => {
        const respuesta = await actualizarCotizaciones(data.Cotizacion)
        return respuesta
    },
    RegistroCliente: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarClientes(varView.isEditing, data.Cliente)
        return respuesta
    },
    RegistroTecnico: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarTecnicos(varView.isEditing, data.Tecnico)
        return respuesta
    },
    RegistroTipo_equipo: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarTipo_equipos(varView.isEditing, data.Tipo_equipo)
        return respuesta
    },
    RegistroEquipo: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarEquipos(varView.isEditing, data.Equipo)
        return respuesta
    },
    RegistroCita: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarCitas(varView.isEditing, data.Cita)
        return respuesta
    },
    enviarReporte: async (data) => {
        const respuesta = await enviarReporte(data)
        return respuesta
    },
    RegistroSistema: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarSistemas(varView.isEditing, data.Sistema)
        return respuesta
    },
    RegistroComponente: async (data) => {
        const varView = useVarView()
        const respuesta = await enviarComponentes(varView.isEditing, data.Componente)
        return respuesta
    },
    RegistrarFirma: async (data) => {
        const respuesta = await enviarFirma(data)
        return respuesta
    }
};