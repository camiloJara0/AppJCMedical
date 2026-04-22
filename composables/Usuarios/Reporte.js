import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";
import { eliminarReporte } from "~/Core/Reportes/DeleteReportes";

export function useReporteActions({
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
}) {

  const store = useReporteStore()
  
  const verReporte = async (reporte) => {
    store.Formulario.Reporte = { ...reporte };
    store.Formulario.componentes = reporte.estado_componente || {};
    store.Formulario.materiales = reporte.materiales || [];
    store.Formulario.mediciones = reporte.mediciones || [];
    store.Formulario.repuestos = reporte.repuestos || [];
    store.Formulario.actividades = reporte.actividades.descripcion || '';
    store.Formulario.equipo = reporte.equipo || {};
    store.Formulario.cita = reporte.cita || {};
    store.Formulario.cliente = reporte.cliente || {};
    store.Formulario.tecnico = reporte.tecnico || {};
    show.value = true;
  };

  const editarReporte = async (reporte) => {

    const Reporte = JSON.parse(JSON.stringify(reporte));
    store.Formulario.Reporte.id = Reporte.id;
    store.Formulario.Reporte.cita_id = Reporte.cita_id;
    store.Formulario.Reporte.cliente_id = Reporte.cliente_id;
    store.Formulario.Reporte.equipo_id = Reporte.equipo_id;
    store.Formulario.Reporte.estado = Reporte.estado;
    store.Formulario.Reporte.fecha = Reporte.fecha;
    store.Formulario.Reporte.tecnico_id = Reporte.tecnino_id;
    store.Formulario.Reporte.tipo = Reporte.tipo;
    store.Formulario.componentes = Reporte.estado_componente || {};

    store.Formulario.materiales = Reporte.materiales || [];
    store.Formulario.mediciones = Reporte.mediciones || [];
    store.Formulario.repuestos = Reporte.repuestos || [];
    store.Formulario.accesorios = Reporte.accesorios || [];
    store.Formulario.actividades = Reporte.actividades[0].descripcion || '';
    store.Formulario.equipo = Reporte.equipo || {};
    store.Formulario.cita = Reporte.cita || {};
    store.Formulario.cliente = Reporte.cliente || {};
    store.Formulario.tecnico = Reporte.tecnico || {};
    store.Formulario.estado.observacion = Reporte.historial_estados_reporte.at(-1).observaciones || '';
    store.Formulario.recibido = Reporte.firma_recibido || {};

    varView.showNuevoRegistro = true;
    varView.isEditing = true
  };

  const eliminarReportes = async (reporte) => {
    const Reporte = reporte;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Estas seguro de eliminar el Reporte?",
      html: `Se eliminará el Reporte: <span>${Reporte.tipo} - ${Reporte.fecha}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarReporte(Reporte);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Reporte eliminado con éxito.",
      background: "#6bc517",
      tiempo: 1500
    };

    notificaciones.mensaje();
    notificaciones.options.background = "#d33";

    cerrar();
    await llamadatos();
    refresh.value++;
  };

  const cerrar = () => {
    show.value = false;
  };

  return {
    verReporte,
    eliminarReportes,
    editarReporte,
    cerrar,
  };
}
