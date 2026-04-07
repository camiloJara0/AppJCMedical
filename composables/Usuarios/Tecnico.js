import { eliminarTecnico } from "~/Core/Tecnicos/DeleteTecnicos";
import { useTecnicosStore } from "~/stores/Formularios/Tecnicos/Tecnico";

export function useTecnicoActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  const store = useTecnicosStore()
  
  const agregarTecnico = () => {
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  const verTecnico = async (Tecnico) => {
    store.Formulario.Tecnico.id = Tecnico.id;
    store.Formulario.Tecnico.user_id = Tecnico.user_id;
    store.Formulario.Tecnico.nombre = Tecnico.nombre;
    store.Formulario.Tecnico.telefono = Tecnico.telefono;
    store.Formulario.Tecnico.direccion = Tecnico.direccion;
    store.Formulario.Tecnico.correo = Tecnico.correo;
    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  const eliminarTecnicos = async (tecnico) => {
    store.Formulario.Tecnico = tecnico;
    const Tecnico = store.Formulario.Tecnico;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el Técnico?",
      html: `Se eliminará el Técnico: <span>${Tecnico.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarTecnico(Tecnico);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Técnico eliminado con éxito.",
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
    agregarTecnico,
    verTecnico,
    cerrar,
    eliminarTecnicos
  };
}
