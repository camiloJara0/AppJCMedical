import { defineStore } from "pinia";
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

        async traer(online = true, filtrar) {
            const reportes = await traerReportes()
            this.Reportes = reportes
            return reportes
        },
    }
})
