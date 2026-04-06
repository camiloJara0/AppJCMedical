import { eliminarRol } from "~/Core/Roles/DeleteRol";
import { useRolStore } from "~/stores/Formularios/Roles/rol";

export function useRolActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  const store = useRolStore()
  
  const agregarRol = () => {
    console.log('rol')
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrarRol = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  const verRol = async (Rol) => {
    store.Formulario.Rol.id = Rol.id;
    store.Formulario.Rol.nombre = Rol.nombre;
    store.Formulario.Rol.permisos = Rol.permisos;

    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  const eliminarRols = async (Rol) => {
    store.Formulario.Rol = Rol;
    const rol = store.Formulario.Rol;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el Rol?",
      html: `Se eliminará el Rol: <span>${rol.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarRol(rol);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Rol eliminado con éxito.",
      background: "#6bc517",
      tiempo: 1500
    };

    notificaciones.mensaje();
    notificaciones.options.background = "#d33";

    cerrar();
    await llamadatos();
    refresh.value++;
  };

  return {
    agregarRol,
    verRol,
    cerrarRol,
    eliminarRols
  };
}
