import { defineStore } from "pinia";
import { useApiRest } from "../../apiRest";
import { enviarRol } from "~/Core/Roles/POSTRol";
import { eliminarRol } from "~/Core/Roles/DeleteRol";
import { traerRol } from "~/Core/Roles/GETRol";
import { traerSecciones } from "~/Core/Roles/GETSecciones";

export const useRolStore = defineStore('Rol', {
    state: () => ({
        Roles: [],
        Formulario: {
            Rol: {
                id: '',
                nombre: '',
                estado: ''
            }
        },
        RolSeleccionado: null,
    }),

    getters: {

    },
    
    actions: {
        async guardar(datos) {
            return await enviarRol(false, datos);
        },

        async actualizar(datos){
            return await enviarRol(true, datos);
        },

        async eliminar(datos){
            return await eliminarRol(datos);
        },

        async traer(online = true, filtrar) {
            const apiRest = useApiRest()
            let roles

            if(online){
                roles = await traerRol()
                await apiRest.postOfflineData('roles', roles)
            } else {
                roles = await apiRest.getOfflineData('roles')
            }

            this.Roles = roles
            return roles
        },

        async traerSecciones() {
            let permisos = await traerSecciones()
            const mapa = {}

            permisos.forEach(({ id, nombre }) => {
                const [modulo, accion] = nombre.split('_')

                if (!mapa[modulo]) {
                mapa[modulo] = {
                    modulo,
                    acciones: []
                }
                }

                mapa[modulo].acciones.push({
                id,
                key: accion,
                nombre: `${modulo}_${accion}`
                })
            })

            return Object.values(mapa)
        },

    }
})
