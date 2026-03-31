import { defineStore } from "pinia";
import { useIndexedDBStore } from "../indexedDB";
import { enviarProductos } from "~/Core/Productos/PostProductos";
import { eliminarProductos } from "~/Core/Productos/DeleteProductos";
import { traerProductos } from "~/Core/Productos/GetProductos";

// Pinia Pacientes
export const useProductosStore = defineStore('Productos', {
    state: () => ({
        Productos: [],
        Formulario: {
            Producto : {
                id: '',
                nombre: '',
                descripcion: '',
                categoria_id: '',
                precio: '',
                stock: '',
                imagen: '',
            }
        },
        ProductoSeleccionada: null,
        isEditing: false
    }),

    getters: {

    },
    
    actions: {
        // Funcion para CRUD POST
        async guardar(datos) {
            return await enviarProductos(false, datos);
        },

        // Funcion para CRUD PUT
        async actualizar(datos){
            return await enviarProductos(true, datos);
        },

        // Funcion para CRUD DELETE
        async eliminar(datos){
            return await eliminarProductos(datos);
        },

        // Funcion para listar Pacientes GET
        async traer(online = true, filtrar) {
            const productos = await traerProductos()
            this.Productos = productos
            return productos
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


