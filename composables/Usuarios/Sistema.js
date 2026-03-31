import { eliminarSistema } from "~/Core/Sistemas/DeleteSistemas";
import { useSistemasStore } from "~/stores/Formularios/Sistemas/Sistema";

export function useSistemaActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  const store = useSistemasStore()
  
  const agregarSistema = () => {
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  const verSistema = async (Sistema) => {
    store.Formulario.Sistema.id = Sistema.id;
    store.Formulario.Sistema.nombre = Sistema.nombre;
    // store.Formulario.Sistema.descripcion = Sistema.descripcion || '';
    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  const eliminarSistemas = async (sistema) => {
    store.Formulario.Sistema = sistema;
    const Sistema = store.Formulario.Sistema;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el Sistema?",
      html: `Se eliminará el Sistema: <span>${Sistema.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarSistema(Sistema);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Sistema eliminado con éxito.",
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
    agregarSistema,
    verSistema,
    cerrar,
    eliminarSistemas
  };
}
