import { eliminarCita } from "~/Core/Citas/DeleteCitas";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";

export function useCitaActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  const store = useCitasStore()
  
  const agregarCita = () => {
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  const verCita = async (Cita) => {
    store.Formulario.Cita.id = Cita.id;
    store.Formulario.Cita.tecnico_id = Cita.tecnico_id;
    store.Formulario.Cita.cliente_id = Cita.cliente_id;
    store.Formulario.Cita.equipo_id = Cita.equipo_id;
    store.Formulario.Cita.tipo = Cita.tipo;
    store.Formulario.Cita.fecha = Cita.fecha;
    store.Formulario.Cita.hora = Cita.hora;
    store.Formulario.Cita.estado = Cita.estado;
    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  const eliminarCitas = async (cita) => {
    store.Formulario.Cita = cita;
    const Cita = store.Formulario.Cita;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar la Cita?",
      html: `Se eliminará la Cita programada para: <span>${Cita.fecha}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarCita(Cita);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Cita eliminada con éxito.",
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
    agregarCita,
    verCita,
    cerrar,
    eliminarCitas
  };
}
