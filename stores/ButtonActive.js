import { defineStore } from "pinia";
import { buttons } from '../data/Buttons'
import { buttonsTecnicos } from "../data/Buttons";

// Store para botones del Aside
export const useButtonsAside = defineStore('ButtonsAside', {
    state: () => ({
        buttons: buttons,
    }),

    getters: {
        getbuttons: (state) => (permisosUsuario) => {

            return permisosUsuario == 'Admin' ? state.buttons : buttonsTecnicos
        }

    },

    actions: {
        activeButton(id) {
            this.buttons.forEach(button => {
                if (button.id == id) {
                    button.active = true;
                    sessionStorage.setItem('activeButton', id);
                } else {
                    button.active = false;
                };
            });
        },

        sessionActive() {
            const botonActivo = sessionStorage.getItem('activeButton');
            if (botonActivo) {
                this.activeButton(parseInt(botonActivo));
            } else {
                this.activeButton(null);
            }
        }
    }
});