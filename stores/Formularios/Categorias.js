import { defineStore } from "pinia";
import { useIndexedDBStore } from "../indexedDB";
import { useApiRest } from "../apiRest";
import { enviarCategorias } from "~/Core/Categorias/PostCategorias";
import { eliminarCategoria } from "~/Core/Categorias/DeleteCategoria";
import { traerCategorias } from "~/Core/Categorias/GetCategorias";

// Pinia Pacientes
export const useCategoriasStore = defineStore('Categorias', {
    state: () => ({
        Categorias: [],
        Formulario: {
            Categoria : {
                id: '',
                nombre: '',
                descripcion: ''
            }
        },
        CategoriaSeleccionada: null,
    }),

    getters: {

    },
    
    actions: {
        // Funcion para CRUD POST
        async guardar(datos) {
            return await enviarCategorias(false, datos);
        },

        // Funcion para CRUD PUT
        async actualizar(datos){
            return await enviarCategorias(true, datos);
        },

        // Funcion para CRUD DELETE
        async eliminar(datos){
            return await eliminarCategoria(datos);
        },

        // Funcion para listar Categorías GET
        async traer(online = true, filtrar, cambio) {
            const apiRest = useApiRest()
            const indexedDB = useIndexedDBStore()   
            const refrescar = await indexedDB.necesitaRefrescar('categorias')
            
            let categorias

            if((online && refrescar) || cambio){
                categorias = await traerCategorias()
                await apiRest.postOfflineData('categorias', categorias)
            } else {
                categorias = await apiRest.getOfflineData('categorias')
            }

            if(filtrar) {
                categorias = categorias.filter(c => c.estado == 'activo')
            }

            this.Categorias = categorias
            return categorias
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


