import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";

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

  const cerrar = () => {
    show.value = false;
  };

  return {
    verReporte,
    cerrar,
  };
}
