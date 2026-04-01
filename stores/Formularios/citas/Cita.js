import { defineStore } from "pinia";
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
    }),

    getters: {

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

        async traer(online = true, filtrar) {
            const varView = useVarView()
            const citas = await traerCitas()
            let citasFiltradas = citas
            if(varView.getRol === 'Tecnico') {
                const user = varView.getUser
                citasFiltradas = citas.filter(c => c.tecnico_id === user.tecnico_id)
            }
            this.Citas = citasFiltradas
            return citasFiltradas
        }
    }
});

