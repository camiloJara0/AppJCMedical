import { eliminarCita } from "~/Core/Citas/DeleteCitas";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import { useEquiposStore } from '~/stores/Formularios/Equipos/Equipo';
import { useReporteStore } from '~/stores/Formularios/Reportes/Reporte';
import { useSistemasStore } from '~/stores/Formularios/Sistemas/Sistema';

export function useCitaActions({
  llamadatos,
  refresh,
  show,
  isEditing,
  fecha,
}) {

  const store = useCitasStore()
  const citasStore = useCitasStore()
  const calendarioStore = useCalendarioCitas()
  const reporteStore = useReporteStore()
  const equipoStore = useEquiposStore()
  const varView = useVarView()
  const storeSistemas = useSistemasStore()

  const notificacionesStore = useNotificacionesStore()
  const {
    alertRespuestaInput,
    alertRespuesta,
    simple,
    mensaje,
    options
  } = notificacionesStore

  function parseFechaISO(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d); // siempre local, sin UTC
  }

  const agregarCita = () => {
    show = true;
    citasStore.Formulario.Cita.fecha = calendarioStore.fecha.split('/').reverse().join('-')
    varView.soloVer = false;
    varView.isEditing = false
    varView.showNuevaCita = true
  };

  const cerrar = () => {
    varView.showNuevaCita = false
    show = false;
    isEditing = false;
    varView.soloVer = true;
  };

  /* =========================
     CANCELAR CITA
  ========================= */
  async function cancelarCita(cita) {
    store.Formulario.Cita = cita;
    const Cita = store.Formulario.Cita;

    options.icono = "warning"
    options.titulo = "¿Deseas eliminar la Cita?"
    options.html = `Se cancelará la Cita programada para: <span>${Cita.nombre_equipo}</span>`
    options.input = 'text'
    options.inputAtributes = { placeholder: 'Motivo de cancelacion' }
    options.confirmtext = "Sí, eliminar"
    options.canceltext = "Atrás";

    const respuesta = await alertRespuestaInput();

    if (respuesta.estado !== "confirmado") {
      return
    };

    if (!respuesta.valor) {
      options.position = 'top-end'
      options.texto = 'Ingrese un motivo de cancelacion.'
      options.background = '#d33'
      options.tiempo = 1500
      mensaje()
      return
    }
    Cita.motivo_cancelacion = respuesta.valor
    const eliminado = await eliminarCita(Cita);

    if (!eliminado) return;

    options.position = "top-end",
    options.texto = "Cita eliminada con éxito."
    options.background = "#6bc517"
    options.tiempo = 1500

    mensaje();
    options.background = "#d33";

    cerrar();
    window.location.reload()
  }

  /* =========================
     ACTUALIZAR CITA
  ========================= */
  function actualizarCita(Cita) {
    store.Formulario.Cita.id = Cita.id;
    store.Formulario.Cita.tecnico_id = Cita.tecnico_id;
    store.Formulario.Cita.cliente_id = Cita.cliente_id;
    store.Formulario.Cita.equipo_id = Cita.equipo_id;
    store.Formulario.Cita.tipo = Cita.tipo;
    store.Formulario.Cita.fecha = Cita.fecha;
    store.Formulario.Cita.hora = Cita.hora;
    store.Formulario.Cita.estado = Cita.estado;
    show = true
    isEditing = true;
    varView.showNuevaCita = true
    varView.isEditing = true
  }

  /* =========================
     MOSTRAR MOTIVOS
  ========================= */
  function showMotivoCancelacion(cita) {
    options.icono = 'info'
    options.titulo = 'Motivo de cancelacion'
    options.texto = cita.ultima_observacion || 'Cita cancelada!'
    options.tiempo = 5000
    simple()
  }

  function showMotivoEdicion(cita) {
    options.icono = 'info'
    options.titulo = 'Motivo de edición'
    options.texto = cita.ultima_observacion || 'La cita ha sido editada!'
    options.tiempo = 5000
    simple()
  }

  /* =========================
     OBSERVACIÓN PROFESIONAL
  ========================= */
  async function showObservacion(cita) {

    options.icono = 'info'
    options.titulo = 'Observacion del Profesional'
    options.texto = cita.ultima_observacion || 'Cita Realizada con exito!'
    options.tiempo = 5000
    simple()
  }

  function normalizarFecha(fecha) {
    const f = new Date(fecha);
    f.setHours(0, 0, 0, 0); // fuerza a medianoche
    return f;
  }

  function parseFechaLocal(fechaStr) {
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day); // año, mes (0-based), día
  }


  /* =========================
     ACTIVAR CITA
  ========================= */
  async function activarCita(cita) {
    const now = new Date()
    const horaActual = now.toTimeString().slice(0, 5)

    const fechaHoy = normalizarFecha(new Date());
    const fechaHasta = parseFechaLocal(cita.fecha);

    if (fechaHoy > fechaHasta) {
      options.icono = 'warning'
      options.titulo = 'Rango vencido'
      options.texto = 'Consulta con un administrador para habilitar Cita!'
      options.tiempo = 3000
      simple()
      return
    }

    let equipos = equipoStore.Equipos

    const equipo = equipos.find(
      p => p.id === cita.equipo_id
    )

    if (!equipo) {
      options.icono = 'warning'
      options.titulo = 'No se encontro el equipo'
      options.texto = 'Verifica si existe en la lista de equipos.'
      options.tiempo = 3000
      simple()
      return
    }

    prepararRegistro(cita, equipo)

    if (cita.tipo === 'Preventivo') {
      reporteStore.Formulario.actividades = 'SE REALIZA LIMPIEZA DEL EQUPO DE MANERA INTERNA Y EXTERNA, SE HACE INSPECCION VISUAL Y ESTRUCTURAL DEL EQUIPO Y SE CONFIRMA QUE EL EQUIPO EN TERMINOS GENERALES SE ENCUENTRAN EN BUEN ESTADO, SE EVIDENCIA MUCHO POLVO INTERNAMENTE EN CONTCATO CON TARJETAS ELECTRONICAS, SE EVIDENCIA QUE UN SOCKET ESTE QUEMADO Y EL CONTROLADOR DEL VENTILADOR ESTA EN MAL ESTADO, POR LO QUE SE DEBEN REEMPLAZAR, SE HACEN PRUEBAS DE FUNCIONAMIENTO GENERAL. SE DEJA INHANILITADO DOS BOMBILLOS DE UVA MIENTRAS SE CAMBIA EL SOCKET YA QUE ESTE PUEDE GENERAR UN CORTO ELECTRICO, EL EQUIPO ESTA PARCIALMENTE OPERATIVO.'
    }

    resolverPlantilla(cita, equipo, horaActual)
    varView.showNuevoRegistro = true
  }

  /* =========================
     HELPERS INTERNOS
  ========================= */
  function prepararRegistro(cita, equipo) {
    reporteStore.Formulario.equipo.nombre = cita.nombre_equipo
    reporteStore.Formulario.equipo.id = equipo.id

    reporteStore.Formulario.reporte.cita_id = cita.id
    reporteStore.Formulario.reporte.tecnico_id = cita.tecnico_id
    reporteStore.Formulario.reporte.cliente_id = cita.cliente_id
    reporteStore.Formulario.reporte.equipo_id = cita.equipo_id
    reporteStore.Formulario.reporte.tipo = cita.tipo
    reporteStore.Formulario.reporte.estado = 'realizada'

    reporteStore.Formulario.cita = { ...cita }
  }

  async function resolverPlantilla(cita, equipo, horaActual) {
    const sistemas = await storeSistemas.traerSistemasPorEquipo(equipo.id);
    const fechaForm = fecha?.value
      ? fecha.value.split('/').reverse().join('-')
      : cita.fecha

    reporteStore.Formulario.reporte.fecha = fechaForm

    const sistemasBuilder = sistemas.map(sistema => ({
      id: sistema.id,
      nombre: sistema.nombre,
      componentes: sistema.componentes.map(c => ({
        id: c.id,
        nombre: c.nombre
      }))
    }))

    varView.isEditing = false
    varView.sistemasBuilder = sistemasBuilder

  }

  return {
    cancelarCita,
    actualizarCita,
    showMotivoCancelacion,
    showMotivoEdicion,
    showObservacion,
    activarCita,
    parseFechaISO,
    agregarCita,
    cerrar,
  }
}
