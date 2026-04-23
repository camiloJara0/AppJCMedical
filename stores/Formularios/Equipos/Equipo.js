import { defineStore } from "pinia";
import { useApiRest } from "../../apiRest";
import { enviarEquipos } from "~/Core/Equipos/PostEquipos";
import { eliminarEquipo } from "~/Core/Equipos/DeleteEquipos";
import { traerEquipos } from "~/Core/Equipos/GetEquipos";

export const useEquiposStore = defineStore('Equipos', {
    state: () => ({
        Equipos: [],
        Formulario: {
            Equipo: {
                id: '',
                cliente_id: '',
                tipo_equipo_id: '',
                nombre: '',
                marca: '',
                modelo: '',
                serie: '',
                ubicacion: '',
                placa: '',
                registro_sanitario: ''
            }
        },
        EquipoSeleccionado: null,
    }),

    getters: {

    },
    
    actions: {
        async guardar(datos) {
            return await enviarEquipos(false, datos);
        },

        async actualizar(datos){
            return await enviarEquipos(true, datos);
        },

        async eliminar(datos){
            return await eliminarEquipo(datos);
        },

        async traer(online = true, filtrar, cambio) {
            const apiRest = useApiRest()
            const indexedDB = useIndexedDBStore()   
            const refrescar = await indexedDB.necesitaRefrescar('equipos')
            let equipos

            if((online && refrescar) || cambio){
                equipos = await traerEquipos()
                await apiRest.postOfflineData('equipos', equipos)
            } else {
                equipos = await apiRest.getOfflineData('equipos')
            }

            if(filtrar){
                equipos = equipos.filter(e => e.estado == 'activo')
            }

            this.Equipos = equipos
            return equipos
        },
    }
})
