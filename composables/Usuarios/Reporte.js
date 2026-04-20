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
    cerrar,
  };
}
