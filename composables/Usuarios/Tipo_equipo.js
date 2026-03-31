import { eliminarTipo_equipo } from "~/Core/Tipo_equipos/DeleteTipo_equipos";
import { useTipo_equiposStore } from "~/stores/Formularios/Tipo_equipos/Tipo_equipo";

export function useTipo_equipoActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  const store = useTipo_equiposStore()
  
  const agregarTipo_equipo = () => {
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  const verTipo_equipo = async (Tipo_equipo) => {
    store.Formulario.Tipo_equipo.id = Tipo_equipo.id;
    store.Formulario.Tipo_equipo.nombre = Tipo_equipo.nombre;
    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  const eliminarTipo_equipos = async (tipo_equipo) => {
    store.Formulario.Tipo_equipo = tipo_equipo;
    const Tipo_equipo = store.Formulario.Tipo_equipo;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el Tipo de Equipo?",
      html: `Se eliminará el Tipo de Equipo: <span>${Tipo_equipo.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarTipo_equipo(Tipo_equipo);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Tipo de Equipo eliminado con éxito.",
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
    agregarTipo_equipo,
    verTipo_equipo,
    cerrar,
    eliminarTipo_equipos
  };
}
