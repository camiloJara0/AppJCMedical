import { useSolicitudesCitasStore } from "~/stores/Formularios/SolicitudesCitas";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import { useTecnicosStore } from "~/stores/Formularios/Tecnicos/Tecnico";
import { useClientesStore } from "~/stores/Formularios/Clientes";
import { useEquiposStore } from "~/stores/Formularios/Equipos/Equipo";

export function useSolicitudCitaActions({
  llamadatos,
  refresh,
  show,
  isEditing,
}) {
  const store = useSolicitudesCitasStore()
  const citasStore = useCitasStore()
  const tecnicosStore = useTecnicosStore()
  const clienteStore = useClientesStore()
  const equipoStore = useEquiposStore()
  const varView = useVarView()

  const notificacionesStore = useNotificacionesStore()
  const {
    alertRespuesta,
    simple,
    mensaje,
    options
  } = notificacionesStore

  function verSolicitud(solicitud) {
    store.SolicitudCitaSeleccionada = JSON.parse(JSON.stringify(solicitud))
    store.Formulario.SolicitudCita = {
      id: solicitud.id,
      NIT: solicitud.NIT || '',
      razon_social: solicitud.razon_social || '',
      nombre_contacto: solicitud.nombre_contacto || '',
      correo: solicitud.correo || '',
      telefono: solicitud.telefono || '',
      serial_equipo: solicitud.serial_equipo || '',
      marca: solicitud.marca || '',
      modelo: solicitud.modelo || '',
      tipo_equipo_descripcion: solicitud.tipo_equipo_descripcion || '',
      tipo_cita: solicitud.tipo_cita || '',
      motivo: solicitud.motivo || '',
      estado: solicitud.estado || 'pendiente',
      respuesta_admin: solicitud.respuesta_admin || '',
      archivo_respuesta: null,
      cliente_id: solicitud.cliente_id || '',
      equipo_id: solicitud.equipo_id || '',
    }
    isEditing.value = true
    show.value = true
    varView.showSolicitudCitaModal = true
  }

  function responderSolicitud(solicitud) {
    verSolicitud(solicitud)
  }

  async function convertirEnCita(solicitud) {
    options.icono = "info"
    options.titulo = "Convertir en Cita"
    options.html = `Se creará una cita para: <strong>${solicitud.nombre_contacto}</strong><br>Equipo: <strong>${solicitud.serial_equipo || solicitud.marca + ' ' + solicitud.modelo || 'No registrado'}</strong>`
    options.confirmtext = "Continuar"
    options.canceltext = "Cancelar"

    const respuesta = await alertRespuesta()

    if (respuesta !== "confirmado") return

    store.SolicitudCitaSeleccionada = JSON.parse(JSON.stringify(solicitud))
    varView.showConvertirCita = true
    varView.showSolicitudes = false
  }

  function cerrar() {
    show.value = false
    isEditing.value = false
    varView.showSolicitudCitaModal = false
    varView.showConvertirCita = false
    store.SolicitudCitaSeleccionada = null
  }

  async function eliminarSolicitudModal(solicitud) {
    options.icono = "warning"
    options.titulo = "¿Eliminar solicitud?"
    options.html = `Se eliminará la solicitud de <strong>${solicitud.nombre_contacto}</strong>`
    options.confirmtext = "Sí, eliminar"
    options.canceltext = "Cancelar"

    const respuesta = await alertRespuesta()

    if (respuesta !== "confirmado") return

    const eliminado = await store.eliminar(solicitud)

    if (!eliminado) return

    options.position = "top-end"
    options.texto = "Solicitud eliminada con éxito."
    options.background = "#6bc517"
    options.tiempo = 1500
    mensaje()

    cerrar()
    await store.traer(true, true)
  }

  async function marcarEnRevision(solicitud) {
    const datos = { id: solicitud.id, estado: 'en_revision', respuesta_admin: solicitud.respuesta_admin }
    await store.actualizar(datos)
    options.position = "top-end"
    options.texto = "Solicitud en revisión."
    options.background = "#2262a3"
    options.tiempo = 1500
    mensaje()
    await store.traer(true, true)
  }

  return {
    verSolicitud,
    responderSolicitud,
    convertirEnCita,
    cerrar,
    eliminarSolicitudModal,
    marcarEnRevision,
  }
}
