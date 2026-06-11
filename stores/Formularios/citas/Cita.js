import { defineStore } from "pinia";
import { useApiRest } from "../../apiRest";
import { enviarCitas } from "~/Core/Citas/PostCitas";
import { eliminarCita } from "~/Core/Citas/DeleteCitas";
import { traerCitas } from "~/Core/Citas/GetCitas";

export const useCitasStore = defineStore('Citas', {
    state: () => ({
        Citas: [],
        Formulario: {
            Cita: {
                id: '',
                tecnico_id: '',
                cliente_id: '',
                equipo_id: '',
                tipo: '',
                fecha: '',
                hora: '',
                estado: ''
            }
        },
        CitaSeleccionada: null,
        showReporteVariosEquipos: false,
        Equiposcita: []
    }),

    getters: {
        citasPendientes(state) {
            return state.Citas.filter(cita => cita.estado === 'inactiva').length;
        }
    },
    
    actions: {
        async guardar(datos) {
            return await enviarCitas(false, datos);
        },

        async actualizar(datos){
            return await enviarCitas(true, datos);
        },

        async eliminar(datos){
            return await eliminarCita(datos);
        },

        async traer(online = true, cambio) {
            const varView = useVarView()
            const apiRest = useApiRest()
            const indexedDB = useIndexedDBStore()   
            const refrescar = await indexedDB.necesitaRefrescar('citas')
            let citas

            if((online && refrescar) || cambio){
                citas = await traerCitas()
                await apiRest.postOfflineData('citas', citas)
            } else {
                citas = await apiRest.getOfflineData('citas')
            }

            let citasFiltradas = citas
            if(varView.getRol === 'Tecnico') {
                const user = varView.getUser
                citasFiltradas = citas.filter(c => c.tecnico_id === user.tecnico_id)
            }
            
            this.Citas = citasFiltradas
            if(this.CitaSeleccionada){
                const citaActualizada = citasFiltradas.find(c => c.id === this.CitaSeleccionada.id)
                if(citaActualizada){
                    this.CitaSeleccionada = citaActualizada
                } else {
                    this.CitaSeleccionada = null
                }
            }
            return citasFiltradas
        }
    }
});

