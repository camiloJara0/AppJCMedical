import { defineStore } from "pinia";
import { useApiRest } from "../../apiRest";
import { enviarTipo_equipos } from "~/Core/Tipo_equipos/PostTipo_equipos";
import { eliminarTipo_equipo } from "~/Core/Tipo_equipos/DeleteTipo_equipos";
import { traerTipo_equipos } from "~/Core/Tipo_equipos/GetTipo_equipos";

export const useTipo_equiposStore = defineStore('Tipo_equipos', {
    state: () => ({
        Tipo_equipos: [],
        Formulario: {
            Tipo_equipo: {
                id: '',
                nombre: '',
                sistemas: ''
            }
        },
        Tipo_equipoSeleccionado: null,
    }),

    getters: {

    },
    
    actions: {
        async guardar(datos) {
            return await enviarTipo_equipos(false, datos);
        },

        async actualizar(datos){
            return await enviarTipo_equipos(true, datos);
        },

        async eliminar(datos){
            return await eliminarTipo_equipo(datos);
        },

        async traer(online = true, filtrar) {
            const apiRest = useApiRest()
            let tipo_equipos

            if(online){
                tipo_equipos = await traerTipo_equipos()
                await apiRest.postOfflineData('tipo_equipos', tipo_equipos)
            } else {
                tipo_equipos = await apiRest.getOfflineData('tipo_equipos')
            }

            this.Tipo_equipos = tipo_equipos
            return tipo_equipos
        },
    }
})
