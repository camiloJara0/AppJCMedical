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

        async traer(online = true) {
            const apiRest = useApiRest()
            let tecnicos

            if(online){
                tecnicos = await traerTecnicos()
                await apiRest.postOfflineData('tecnicos', tecnicos)
            } else {
                tecnicos = await apiRest.getOfflineData('tecnicos')
            }

            this.Tecnicos = tecnicos
            return tecnicos
        },
    }
})
