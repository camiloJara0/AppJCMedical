import { defineStore } from "pinia";
import { useApiRest } from "../../apiRest";
import { enviarReportes } from "~/Core/Reportes/PostReportes";
import { eliminarReporte } from "~/Core/Reportes/DeleteReportes";
import { traerReportes } from "~/Core/Reportes/GetReportes";

export const useReporteStore = defineStore('Reportes', {
    state: () => ({
        Reportes: [],
        Formulario: {
            Reporte: {
                id: '',
                equipo_id: '',
                tecnico_id: '',
                cliente_id: '',
                fecha: '',
                estado: ''
            },
            equipo: {
                nombre: '',
                id: '',
            },
            cliente: {
                nombre: ''
            },
            componentes: {},
            materiales: [],
            mediciones: [],
            repuestos: [],
            accesorios: [],
            actividades: '',
            cita: {},
            reporte: {},
            recibido: {
                firma: '',
                nombre: '',
                cargo: '',
                correo: '',
            },
            estado: {
                observacion: ''
            },
            resultado: {
                estado: '',
                observacion: ''
            }
        },
        ReporteSeleccionado: null,
        showPDFReporte: false,
    }),

    getters: {
        numeroPendientes(state) {
            return state.Reportes.filter(reporte => reporte.estado !== 'realizada' && reporte.estado !== 'eliminada' && reporte.estado !== 'En Revisión').length;
        }
    },
    
    actions: {
        async guardar(datos) {
            return await enviarReportes(false, datos);
        },

        async actualizar(datos){
            return await enviarReportes(true, datos);
        },

        async eliminar(datos){
            return await eliminarReporte(datos);
        },

        async traer(online = true, cambio) {
            const apiRest = useApiRest()
            const indexedDB = useIndexedDBStore()   
            const refrescar = await indexedDB.necesitaRefrescar('reportes')

            let reportes
            if((online && refrescar) || cambio){
                reportes = await traerReportes()
                await apiRest.postOfflineData('reportes', reportes)
            } else {
                reportes = await apiRest.getOfflineData('reportes')
                reportes = reportes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            }

            this.Reportes = reportes
            return reportes
        },
    }
})
