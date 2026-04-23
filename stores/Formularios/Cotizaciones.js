import { defineStore } from "pinia";
import { useIndexedDBStore } from "../indexedDB";
import { useApiRest } from "../apiRest";
import { enviarCotizacion } from "~/Core/Cotizaciones/PostCotizacion";
import { eliminarCotizacion } from "~/Core/Cotizaciones/DeleteCotizaciones";
import { traerCotizaciones } from "~/Core/Cotizaciones/GetCotizaciones";

// Pinia Pacientes
export const useCotizacionesStore = defineStore('Cotizaciones', {
    state: () => ({
        Cotizaciones: [],
        Formulario: {
            Cotizacion : {
                id: '',
                estado: '',
                respuesta: '',
                monto: '',
                correo: '',
                nombre: '',
                productos: []
            }
        },
        CotizacionSeleccionada: null,
    }),

    getters: {

    },
    
    actions: {
        // Funcion para CRUD POST
        async guardar(datos) {
            return await enviarCotizacion(false, datos);
        },

        // Funcion para CRUD PUT
        async actualizar(datos){
            return await enviarCotizacion(true, datos);
        },

        // Funcion para CRUD DELETE
        async eliminar(datos){
            return await eliminarCotizacion(datos);
        },

        // Funcion para listar Cotizaciones GET
        async traer(online = true, filtrar, cambio) {
            const apiRest = useApiRest()
            const indexedDB = useIndexedDBStore()   
            const refrescar = await indexedDB.necesitaRefrescar('solicitudes_cotizacions')

            let cotizaciones

            if((online && refrescar) || cambio){
                cotizaciones = await traerCotizaciones()
                await apiRest.postOfflineData('solicitudes_cotizacions', cotizaciones)
            } else {
                cotizaciones = await apiRest.getOfflineData('solicitudes_cotizacions')
            }

            this.Cotizaciones = cotizaciones
            return cotizaciones
        },

        // Funcion para listar datos de un paciente en especifico
        async listDatos(id, Tabla) {
            // Traer datos de indexedDB
            const store = useIndexedDBStore()
            store.almacen = Tabla
            const datosTabla = await store.leerdatos()

            // Array que devuelve los datos filtrados por paciente
            const datos = datosTabla.filter((dato) => {
                return parseInt(dato.id_paciente) === parseInt(id)
            })

            return datos
        },

        async indexDBDatos() {

        },
    }
});


