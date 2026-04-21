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
            }
        },
        ReporteSeleccionado: null,
    }),

    getters: {

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

        async traer(online = true) {
            const apiRest = useApiRest()

            let reportes
            if(online){
                reportes = await traerReportes()
            } else {
                reportes = await apiRest.getOfflineData('reportes')
            }

            this.Reportes = reportes
            return reportes
        },
    }
})
