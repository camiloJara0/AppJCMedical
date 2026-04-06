<script setup>
import ButtonAside from './ButtonAside.vue';
import { useShowNavbar } from '~/stores/navbarResponsive.js';
import { useButtonsAside } from '~/stores/ButtonActive';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';

const storeAside = useButtonsAside();
const buttons = ref([]);
const varView = useVarView()
const footer = useSeccionFooter();
const router = useRouter()


onMounted(() => {
    storeAside.sessionActive();
    const login = varView.getUser
    console.log(login)
    if(!login || Object.keys(login).length === 0) {
        router.push('/Home')
    }
    const permisosStore = varView.getPermisos
    buttons.value = storeAside.getbuttons(permisosStore);
});

// Funcion para Responsive, si aside esta activo se oculta navbar
const { showNavbarBurguer, cambiarEstado } = useShowNavbar();
const cambiarEstadoFalse = () => {
    if (showNavbarBurguer.value) {
        cambiarEstado(false);
    }
};

function accesoRapidoSelected(nombre) {
    switch (nombre) {
        case 'Categorias': {
            const button = buttons.value.find(btn => btn.nombre === 'Productos');
            console.log(button, buttons.value);
            if (button) {
                console.log(button.secciones);
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(1);
            }
            break;
        }
        case 'Datos': {
            const button = buttons.value.find(btn => btn.nombre === 'Datos');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(1);
            }
            break;
        }
        case 'Productos': {
            const button = buttons.value.find(btn => btn.nombre === 'Productos');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(0);
            }
            break;
        }
        case 'Citas': {
            const button = buttons.value.find(btn => btn.nombre === 'Usuarios');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(2);
            }
            break;
        }
        case 'Clientes': {
            const button = buttons.value.find(btn => btn.nombre === 'Usuarios');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(0);
            }
            break;
        }
        case 'Tecnicos': {
            const button = buttons.value.find(btn => btn.nombre === 'Usuarios');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(1);
            }
            break;
        }
        case 'TipoEquipos': {
            const button = buttons.value.find(btn => btn.nombre === 'Productos');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(2);
            }
            break;
        }
        case 'Equipos': {
            const button = buttons.value.find(btn => btn.nombre === 'Productos');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(3);
            }
            break;
        }
        case 'Reportes': {
            const button = buttons.value.find(btn => btn.nombre === 'Historial');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(0);
            }
            break;
        }
        case 'Cotizaciones': {
            const button = buttons.value.find(btn => btn.nombre === 'Historial');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(1);
            }
            break;
        }
        case 'Sistemas': {
            const button = buttons.value.find(btn => btn.nombre === 'Datos');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(1);
            }
            break;
        }
        case 'Componentes': {
            const button = buttons.value.find(btn => btn.nombre === 'Datos');
            if (button) {
                footer.cambiarSecciones(button.secciones);
                footer.cambiarIdActivo(0);
            }
            break;
        }
        default:
            console.log("No se encontró el caso para:", nombre);
    }
}
</script>

<template>
    <div class="section-asidebar" :class="{ 'expandido': varView.expandido }">
        <div class="asidebar-shadow flex items-center h-full">
            <div class="section-asidebar__content w-full flex flex-col p-1.25 items-center rounded-r-lg dark:bg-(--color-default-claro) bg-(--color-default-700) shadow-lg"
                :class="{ 'h-full': varView.expandido, 'h-[75%] clip': !varView.expandido }">

                <!-- Estado colapsado -->
                <div v-if="!varView.expandido"
                    class="menu-colapsado flex md:flex-col flex-row items-center justify-between md:h-screen md:w-16 md:py-4 pb-2">

                    <!-- Botón expandir -->
                    <ButtonRounded @click="() => {
                        varView.expandido = true;
                        cambiarEstadoFalse()
                    }" tooltip="Abrir Menú" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full md:text-gray-200 text-white font-bold md:dark:text-black transition">
                        <i class="fa-solid fa-angle-right text-lg"></i>
                    </ButtonRounded>

                    <!-- Navegación por íconos -->
                    <nav class="flex md:flex-col flex-row items-center gap-6" @click="cambiarEstadoFalse()">
                        <!-- <ButtonAside v-for="button in buttons" :key="button.nombre" :data="button" /> -->
                        <NuxtLink to="/Citas" @click="accesoRapidoSelected('Citas')">
                            <ButtonRounded tooltip="Agenda" tooltip-position="right"
                                color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-300 md:dark:text-black transition py-5">
                                <i class="fa-solid fa-calendar-day text-lg"></i>
                            </ButtonRounded>
                        </NuxtLink>
                        <NuxtLink to="/Cotizacion" @click="accesoRapidoSelected('Cotizaciones')">
                            <ButtonRounded tooltip="Cotizaciones" tooltip-position="right"
                                color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-300 md:dark:text-black transition py-5">
                                <i class="fa-solid fa-money-bill text-lg"></i>
                            </ButtonRounded>
                        </NuxtLink>
                        <NuxtLink to="/Usuarios" @click="accesoRapidoSelected('Tecnicos')">
                            <ButtonRounded tooltip="Tecnicos" tooltip-position="right"
                                color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-300 md:dark:text-black transition py-5">
                                <i class="fa-solid fa-user-gear text-lg"></i>
                            </ButtonRounded>
                        </NuxtLink>
                        <NuxtLink to="/Historial" @click="accesoRapidoSelected('Reportes')">
                            <ButtonRounded tooltip="Reportes" tooltip-position="right"
                                color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-300 md:dark:text-black transition py-5">
                                <i class="fa-solid fa-file-lines text-lg"></i>
                            </ButtonRounded>
                        </NuxtLink>
                        <NuxtLink to="/Productos" @click="accesoRapidoSelected('Productos')">
                            <ButtonRounded tooltip="Productos" tooltip-position="right"
                                color="flex items-center justify-center w-10 h-10 rounded-full text-white md:text-gray-300 md:dark:text-black transition py-5">
                                <i class="fa-solid fa-store text-lg"></i>
                            </ButtonRounded>
                        </NuxtLink>
                    </nav>

                    <!-- Perfil / Logout -->
                    <a href="/" class="flex-col items-center gap-3 md:flex flex-none">
                        <i
                            class="fa-solid fa-right-from-bracket text-lg text-white md:text-gray-300 dark:text-black hover:text-red-600 cursor-pointer"></i>
                    </a>
                </div>

                <!-- Estado expandido -->
                <div v-else
                    class="menu-expandido dark:bg-(--color-default-claro) bg-(--color-default-700) flex flex-col justify-between w-full h-full shadow-lg rounded-lg py-4 px-3">
                    <!-- Header -->
                    <div>
                        <div
                            class="flex justify-between items-center md:flex flex-row-reverse border-b border-gray-700 dark:border-gray-200 pb-3 mb-4">
                            <h2 class="text-lg font-bold text-gray-200 dark:text-gray-800 tracking-wide">
                                Menú</h2>
                            <ButtonRounded @click="varView.expandido = false" tooltip="Cerrar Menú"
                                tooltip-position="right"
                                color="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-default-200)] text-white hover:bg-[var(--color-default-200)] transition">
                                <i class="fa-solid fa-angle-left"></i>
                            </ButtonRounded>
                        </div>

                        <!-- Sección Explorar -->
                        <p class="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
                            Secciones</p>

                        <!-- Items dinámicos -->
                        <!-- <div v-for="button in buttons" :key="button.nombre"
                        @click="() => { storeAside.activeButton(button.id); footer.cambiarIdActivo(0) }"
                        class="menu-item py-2 border-b border-gray-600 dark:border-gray-100 rounded-md transition">
                        <a class="flex items-center justify-between gap-2 mb-2"
                            :href="`/${button.nombre}/${button.secciones[0].titulo}`"
                            @click="footer.cambiarSecciones(button.secciones)">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">{{
                                button.nombre }}</span>
                            <i class="fa-solid text-lg text-gray-400 dark:text-gray-600 transition"
                                :class="button.icon"></i>
                        </a>
                    </div> -->

                        <!-- Sección Explorar -->
                        <!-- <p class="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider my-2">
                        Acceso Rapido</p> -->

                        <!-- Navegación por íconos -->
                        <div @click="cambiarEstadoFalse()">

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Citas"
                            @click="accesoRapidoSelected('Citas')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Agenda</span>
                            <i class="fa-solid fa-calendar-day text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Categorias"
                            @click="accesoRapidoSelected('Categorias')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Categorías</span>
                            <i class="fa-solid fa-building text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Usuarios/Clientes"
                            @click="accesoRapidoSelected('Clientes')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Clientes</span>
                            <i class="fa-solid fa-users text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Datos"
                            @click="accesoRapidoSelected('Componentes')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Componentes</span>
                            <i class="fa-solid fa-microchip text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Cotizacion"
                            @click="accesoRapidoSelected('Cotizaciones')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Cotizaciones</span>
                            <i class="fa-solid fa-money-bill text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Productos/Equipos"
                            @click="accesoRapidoSelected('Equipos')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Equipos</span>
                            <i class="fa-solid fa-desktop text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Historial"
                            @click="accesoRapidoSelected('Reportes')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Reportes</span>
                            <i class="fa-solid fa-file-lines text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Datos/Sistemas"
                            @click="accesoRapidoSelected('Sistemas')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Sistemas</span>
                            <i class="fa-solid fa-network-wired text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Productos/Tipo_equipos"
                            @click="accesoRapidoSelected('TipoEquipos')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Tipo Equipos</span>
                            <i class="fa-solid fa-screwdriver-wrench text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Usuarios"
                            @click="accesoRapidoSelected('Tecnicos')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Técnicos</span>
                            <i class="fa-solid fa-user-gear text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        <NuxtLink class="flex items-center justify-between gap-2 py-2" to="/Productos"
                            @click="accesoRapidoSelected('Productos')">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Productos</span>
                            <i class="fa-solid fa-store text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </NuxtLink>

                        </div>
                    </div>

                    <!-- Perfil -->
                    <div class="menu-item py-4 border-t border-gray-700 dark:border-gray-200 mt-4">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="text-gray-200 dark:text-gray-800 font-medium text-sm">Perfil</span>
                            <i class="fa-solid fa-user text-lg text-gray-400 dark:text-gray-600 transition"></i>
                        </div>
                        <div class="flex flex-col gap-1 pl-2">
                            <!-- <a class="text-gray-400 dark:text-gray-600 font-semibold text-sm text-wrap transition">{{
                            varView.getRol }}</a> -->
                            <a href="/"
                                class="text-red-500 font-semibold text-sm hover:text-red-700 text-wrap transition">
                                Cerrar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<style scoped>
.section-asidebar {
    /* ancho colapsado */
    grid-area: aside;
    width: 50px;
    height: 80vh;
    padding: 10px 0;
    transition: width 0.4s ease, transform 0.6s ease, opacity 0.6s ease;

}

.section-asidebar.expandido {
    /* ancho expandido */
    /* width: 100%; */
    width: 180px;
    padding: 10px 5px 10px 0;
}

/* Estado colapsado */
.section-asidebar .menu-colapsado {
    transition: all 0.3s ease;
    transform: translateX(-4px);
    opacity: 0.9;
}

/* Estado expandido */
.section-asidebar .menu-expandido {
    transition: all 0.3s ease;
    transform: translateX(0);
    opacity: 1;
    animation: fadeIn 0.6s ease;
}

/* Animación extra */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.clip {
    clip-path: polygon(50% 0%, 100% 0, 100% 13%, 85% 15%, 85% 100%, 30% 100%, 0 100%, 0% 45%, 0 0);
}

.section-asidebar__content {
    box-shadow: none;
}

.asidebar-shadow {
    filter: drop-shadow(4px 4px 10px rgba(0, 0, 0, 0.45));
}

/* Links */
.submenu-link {
    font-size: 0.95rem;
    font-weight: 500;
    transition: color 0.2s ease;
}

.submenu-link:hover {
    color: var(--color-warning);
}

/* Responsive móvil */
@media screen and (max-width: 768px) {
    .section-asidebar {
        position: fixed;
        top: 40px;
        left: 0;
        right: 0;
        width: 100%;
        height: 40px;
        border-radius: 0;
        z-index: 9;
        padding: 0;
        margin: 0;
    }

    .section-asidebar.expandido {
        height: auto;
        width: 100%;
    }

    .section-asidebar__content {
        background: inherit;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        padding: 0;
        margin: 0;
        border-radius: 0;
    }

    .menu-colapsado {
        display: flex;
        width: 100%;
        justify-content: space-around;
    }

    .menu-expandido {
        border-top: 1px solid #e5e7eb;
        padding: 10px;
    }
}
</style>
