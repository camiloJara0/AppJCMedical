import { mapCampos } from "~/components/organism/Forms/useFormulario";
import { useCotizacionesStore } from "~/stores/Formularios/Cotizaciones";
import { eliminarCotizacion } from "~/Core/Cotizaciones/DeleteCotizaciones";

export function useCotizacionActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  /* ===============================
     MODALES
  =============================== */

  const store = useCotizacionesStore()
//   const agregarCotizacion = () => {
//     show.value = true;
//     varView.soloVer = false;
//   };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  /* ===============================
     VER Cotizacion
  =============================== */

  const verCotizacion = async (Cotizacion) => {
    store.Formulario.Cotizacion.id = Cotizacion.id
    store.Formulario.Cotizacion.nombre = Cotizacion.nombre
    store.Formulario.Cotizacion.correo = Cotizacion.correo
    store.Formulario.Cotizacion.estado = Cotizacion.estado
    store.Formulario.Cotizacion.monto = Cotizacion.monto
    store.Formulario.Cotizacion.respuesta = Cotizacion.observaciones_admin
    store.Formulario.Cotizacion.productos = Cotizacion.detalles

    show.value = true
    isEditing.value = true;
  };

  /* ===============================
     ELIMINAR Cotizacion
  =============================== */

  const eliminarCotizacionModal = async (cotizacion) => {

    store.Formulario.Cotizacion = cotizacion;
    const Cotizacion = store.Formulario.Cotizacion;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar la Cotizacion?",
      html: `Se eliminará la Cotizacion de: <span>${Cotizacion.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarCotizacion(Cotizacion);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Cotizacion eliminado con éxito.",
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
    // agregarCotizacion,
    verCotizacion,
    cerrar,
    eliminarCotizacionModal
  };
}
