import { eliminarComponente } from "~/Core/Componentes/DeleteComponentes";
import { useComponentesStore } from "~/stores/Formularios/Componentes/Componente";

export function useComponenteActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  const store = useComponentesStore()
  
  const agregarComponente = () => {
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  const verComponente = async (Componente) => {
    store.Formulario.Componente.id = Componente.id;
    store.Formulario.Componente.sistema_id = Componente.sistema_id;
    store.Formulario.Componente.nombre = Componente.nombre;
    store.Formulario.Componente.descripcion = Componente.descripcion || '';
    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  const eliminarComponentes = async (componente) => {
    store.Formulario.Componente = componente;
    const Componente = store.Formulario.Componente;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el Componente?",
      html: `Se eliminará el Componente: <span>${Componente.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarComponente(Componente);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Componente eliminado con éxito.",
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
    agregarComponente,
    verComponente,
    cerrar,
    eliminarComponentes
  };
}
