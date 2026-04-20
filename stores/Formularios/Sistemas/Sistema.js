import { defineStore } from "pinia";
import { useIndexedDBStore } from "../../indexedDB";
import { enviarSistemas } from "~/Core/Sistemas/PostSistemas";
import { eliminarSistema } from "~/Core/Sistemas/DeleteSistemas";
import { traerSistemas } from "~/Core/Sistemas/GetSistemas";
import { traerSistemasEquipos } from "~/Core/Sistemas/GetSistemasEquipos";

export const useSistemasStore = defineStore('Sistemas', {
    state: () => ({
        Sistemas: [],
        Formulario: {
            Sistema: {
                id: '',
                nombre: '',
                descripcion: ''
            }
        },
        SistemaSeleccionado: null,
    }),

    getters: {

    },
    
    actions: {
        async guardar(datos) {
            return await enviarSistemas(false, datos);
        },

        async actualizar(datos){
            return await enviarSistemas(true, datos);
        },

        async eliminar(datos){
            return await eliminarSistema(datos);
        },

        async traer(online = true) {
            const apiRest = useApiRest()
            let sistemas

            if(online){
                sistemas = await traerSistemas()
                await apiRest.postOfflineData('sistemas', sistemas)
            } else {
                sistemas = await apiRest.getOfflineData('sistemas')
            }

            this.Sistemas = sistemas
            return sistemas
        },

        async traerSistemasPorEquipo(id) {
            const sistemas = await traerSistemasEquipos(id)
            return sistemas
        },
    }
})
