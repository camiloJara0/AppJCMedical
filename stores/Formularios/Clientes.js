import { defineStore } from "pinia";
import { useIndexedDBStore } from "../indexedDB";
import { useApiRest } from "../apiRest";
import { enviarClientes } from "~/Core/Clientes/PostClientes";
import { eliminarCliente } from "~/Core/Clientes/DeleteClientes";
import { traerClientes } from "~/Core/Clientes/GetClientes";

// Pinia Clientes
export const useClientesStore = defineStore('Clientes', {
    state: () => ({
        Clientes: [],
        Formulario: {
            Cliente : {
                id: '',
                nombre: '',
                telefono: '',
                correo: '',
                estado: ''
            }
        },
        ClienteSeleccionada: null,
    }),

    getters: {

    },
    
    actions: {
        // Funcion para CRUD POST
        async guardar(datos) {
            return await enviarClientes(false, datos);
        },

        // Funcion para CRUD PUT
        async actualizar(datos){
            return await enviarClientes(true, datos);
        },

        // Funcion para CRUD DELETE
        async eliminar(datos){
            return await eliminarCliente(datos);
        },

        // Funcion para listar Clientes GET
        async traer(online = true, filtrar, cambio) {
            const apiRest = useApiRest()
            const indexedDB = useIndexedDBStore()   
            const refrescar = await indexedDB.necesitaRefrescar('clientes')
            let Clientes

            if((online && refrescar) || cambio){
                Clientes = await traerClientes()
                await apiRest.postOfflineData('clientes', Clientes)
            } else {
                Clientes = await apiRest.getOfflineData('clientes')
            }

            if(filtrar) {
                Clientes = Clientes.filter(c => c.estado == 'activo')
            }

            this.Clientes = Clientes
            return Clientes
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


