import { defineStore } from "pinia";
import { useIndexedDBStore } from "../indexedDB";
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

        // Funcion para listar Pacientes GET
        async traer(online = true, filtrar) {
            const categorias = await traerCategorias()
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


