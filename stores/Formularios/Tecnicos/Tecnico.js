import { defineStore } from "pinia";
import { enviarTecnicos } from "~/Core/Tecnicos/PostTecnicos";
import { eliminarTecnico } from "~/Core/Tecnicos/DeleteTecnicos";
import { traerTecnicos } from "~/Core/Tecnicos/GetTecnicos";

export const useTecnicosStore = defineStore('Tecnicos', {
    state: () => ({
        Tecnicos: [],
        Formulario: {
            Tecnico: {
                id: '',
                user_id: '',
                nombre: '',
                telefono: '',
                direccion: ''
            }
        },
        TecnicoSeleccionado: null,
    }),

    getters: {

    },
    
    actions: {
        async guardar(datos) {
            return await enviarTecnicos(false, datos);
        },

        async actualizar(datos){
            return await enviarTecnicos(true, datos);
        },

        async eliminar(datos){
            return await eliminarTecnico(datos);
        },

        async traer(online = true, filtrar, cambio) {
            const apiRest = useApiRest()
            const indexedDB = useIndexedDBStore()   
            const refrescar = await indexedDB.necesitaRefrescar('tecnicos')
            let tecnicos

            if((online && refrescar) || cambio){
                tecnicos = await traerTecnicos()
                await apiRest.postOfflineData('tecnicos', tecnicos)
            } else {
                tecnicos = await apiRest.getOfflineData('tecnicos')
            }

            if(filtrar){
                tecnicos = tecnicos.filter(t => t.estado == 'activo')
            }

            this.Tecnicos = tecnicos
            return tecnicos
        },
    }
})
