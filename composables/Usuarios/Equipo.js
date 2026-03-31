import { eliminarEquipo } from "~/Core/Equipos/DeleteEquipos";
import { useEquiposStore } from "~/stores/Formularios/Equipos/Equipo";

export function useEquipoActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  const store = useEquiposStore()
  
  const agregarEquipo = () => {
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  const verEquipo = async (Equipo) => {
    store.Formulario.Equipo.id = Equipo.id;
    store.Formulario.Equipo.cliente_id = Equipo.cliente_id;
    store.Formulario.Equipo.tipo_equipo_id = Equipo.tipo_equipo_id;
    store.Formulario.Equipo.nombre = Equipo.nombre;
    store.Formulario.Equipo.marca = Equipo.marca;
    store.Formulario.Equipo.modelo = Equipo.modelo;
    store.Formulario.Equipo.serie = Equipo.serie;
    store.Formulario.Equipo.ubicacion = Equipo.ubicacion;
    store.Formulario.Equipo.placa = Equipo.placa;
    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  const eliminarEquipos = async (equipo) => {
    store.Formulario.Equipo = equipo;
    const Equipo = store.Formulario.Equipo;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el Equipo?",
      html: `Se eliminará el Equipo: <span>${Equipo.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarEquipo(Equipo);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Equipo eliminado con éxito.",
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
    agregarEquipo,
    verEquipo,
    cerrar,
    eliminarEquipos
  };
}
