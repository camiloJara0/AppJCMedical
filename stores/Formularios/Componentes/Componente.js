import { defineStore } from "pinia";
import { useApiRest } from "../../apiRest";
import { enviarComponentes } from "~/Core/Componentes/PostComponentes";
import { eliminarComponente } from "~/Core/Componentes/DeleteComponentes";
import { traerComponentes } from "~/Core/Componentes/GetComponentes";

export const useComponentesStore = defineStore('Componentes', {
    state: () => ({
        Componentes: [],
        Formulario: {
            Componente: {
                id: '',
                sistema_id: '',
                nombre: '',
                descripcion: ''
            }
        },
        ComponenteSeleccionado: null,
    }),

    getters: {

    },
    
    actions: {
        async guardar(datos) {
            return await enviarComponentes(false, datos);
        },

        async actualizar(datos){
            return await enviarComponentes(true, datos);
        },

        async eliminar(datos){
            return await eliminarComponente(datos);
        },

        async traer(online = true, filtrar) {
            const apiRest = useApiRest()
            let componentes

            if(online){
                componentes = await traerComponentes()
                await apiRest.postOfflineData('componentes', componentes)
            } else {
                componentes = await apiRest.getOfflineData('componentes')
            }

            this.Componentes = componentes
            return componentes
        },
    }
})
