import { defineStore } from "pinia";
import { useApiRest } from "../apiRest";
import { useIndexedDBStore } from "../indexedDB";
import { traerSolicitudesCitas } from "~/Core/SolicitudesCitas/GetSolicitudesCitas";
import { actualizarSolicitudCita } from "~/Core/SolicitudesCitas/PutSolicitudCita";
import { eliminarSolicitudCita } from "~/Core/SolicitudesCitas/DeleteSolicitudCita";

export const useSolicitudesCitasStore = defineStore('SolicitudesCitas', {
    state: () => ({
        SolicitudesCitas: [],
        Formulario: {
            SolicitudCita: {
                id: '',
                NIT: '',
                razon_social: '',
                nombre_contacto: '',
                correo: '',
                telefono: '',
                serial_equipo: '',
                marca: '',
                modelo: '',
                tipo_equipo_descripcion: '',
                tipo_cita: '',
                motivo: '',
                estado: '',
                respuesta_admin: '',
                archivo_respuesta: null,
                cliente_id: '',
                equipo_id: '',
            }
        },
        SolicitudCitaSeleccionada: null,
    }),

    getters: {
        solicitudesPendientes(state) {
            return state.SolicitudesCitas.filter(s => s.estado === 'pendiente').length;
        }
    },

    actions: {
        async actualizar(datos) {
            return await actualizarSolicitudCita(datos);
        },

        async eliminar(datos) {
            return await eliminarSolicitudCita(datos);
        },

        async traer(online = true, cambio) {
            const apiRest = useApiRest()
            const indexedDB = useIndexedDBStore()
            const refrescar = await indexedDB.necesitaRefrescar('solicitudes_citas')

            let solicitudes

            if ((online && refrescar) || cambio) {
                solicitudes = await traerSolicitudesCitas()
                await apiRest.postOfflineData('solicitudes_citas', solicitudes)
            } else {
                solicitudes = await apiRest.getOfflineData('solicitudes_citas')
            }

            this.SolicitudesCitas = solicitudes
            return solicitudes
        },
    }
});
