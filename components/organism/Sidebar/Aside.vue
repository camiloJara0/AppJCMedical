<script setup>
import { useShowNavbar } from '~/stores/navbarResponsive.js';
import { useButtonsAside } from '~/stores/ButtonActive';
import { storeToRefs } from 'pinia';
import ButtonRounded from '~/components/atoms/Buttons/ButtonRounded.vue';
import { navMenuAdmin, navMenuTecnico } from '~/data/navMenuStructure.js';
import { useReporteStore } from '~/stores/Formularios/Reportes/Reporte';
import { useCotizacionesStore } from '~/stores/Formularios/Cotizaciones';
import { useCitasStore } from '~/stores/Formularios/citas/Cita';

const storeAside = useButtonsAside();
const reporteStore = useReporteStore()
const cotizacionesStore = useCotizacionesStore()
const citasStore = useCitasStore()
const buttons = ref([]);
const varView = useVarView()
const route = useRoute()
const rol = ref('')
const navMenu = ref([])

const { numeroPendientes } = storeToRefs(reporteStore)
const { citasPendientes } = storeToRefs(citasStore)
const { cotizacionesPendientes } = storeToRefs(cotizacionesStore)
const { botonActivo } = storeToRefs(storeAside);

onMounted(() => {
    storeAside.sessionActive();
    const login = varView.getUser
    rol.value = varView.getRol
    if (!login || Object.keys(login).length === 0) {
        // router.push('/')
    }
    buttons.value = storeAside.getbuttons(rol.value);
    
    reporteStore.traer(false, false)
    citasStore.traer(false, false)
    cotizacionesStore.traer(false, false)
    // Cargar menú según rol
    navMenu.value = rol.value === 'Admin' ? navMenuAdmin : navMenuTecnico;
});

// Funcion para Responsive, si aside esta activo se oculta navbar
const { showNavbarBurguer, cambiarEstado } = useShowNavbar();
const cambiarEstadoFalse = () => {
    if (showNavbarBurguer.value) {
        cambiarEstado(false);
    }
};

const isActive = (path) => route.path === path
</script>

<template>
    <div class="section-asidebar" :class="{ 'expandido': varView.expandido }">
        <div class="asidebar-shadow flex items-center h-full">
            <div class="section-asidebar__content w-full flex flex-col p-1.25 items-center rounded-r-lg dark:bg-(--color-default-claro) bg-(--color-default-700) shadow-lg"
                :class="{ 'h-full': varView.expandido, 'h-[75%] clip': !varView.expandido }">

                <!-- Estado colapsado -->
                <div v-if="!varView.expandido"
                    class="menu-colapsado flex md:flex-col flex-row items-center justify-between md:h-screen md:w-16 md:py-4 pb-2 overflow-y-auto"
                    :class="{ 'select-none hidden': rol !== 'Admin' && rol !== 'Tecnico' }">

                    <!-- Botón expandir -->
                    <ButtonRounded @click="() => {
                        varView.expandido = true;
                        cambiarEstadoFalse()
                    }" tooltip="Abrir Menú" tooltip-position="right"
                        color="flex items-center justify-center w-10 h-10 rounded-full md:text-gray-200 text-gray-200 font-bold md:dark:text-black transition">
                        <i class="fa-solid fa-angle-right text-lg"></i>
                    </ButtonRounded>

                    <!-- Navegación por íconos -->
                    <nav class="flex md:flex-col flex-row items-center gap-6">
                        <NuxtLink v-for="btn in navMenu.filter(n => n.accesoRapido)" :key="btn.id" :to="btn.ruta"
                             class="relative">
                            <UButton v-if="btn.nombre == 'Reportes' && numeroPendientes > 0"
                                class="rounded-full absolute md:top-0 top-5 -right-1 w-4 h-5 flex justify-center items-center text-xs"
                                color="error">
                                {{ numeroPendientes }}
                            </UButton>
                            <UButton v-if="btn.nombre == 'Agenda' && citasPendientes > 0"
                                class="rounded-full absolute md:top-0 top-5 -right-1 w-4 h-5 flex justify-center items-center text-xs"
                                color="error">
                                {{ citasPendientes }}
                            </UButton>
                            <UButton v-if="btn.nombre == 'Cotizaciones' && cotizacionesPendientes > 0"
                                class="rounded-full absolute md:top-0 top-5 -right-1 w-4 h-5 flex justify-center items-center text-xs"
                                color="error">
                                {{ cotizacionesPendientes }}
                            </UButton>
                            <ButtonRounded :tooltip="btn.nombre" tooltip-position="right"
                                color="flex items-center justify-center w-10 h-10 rounded-full transition py-5">
                                <i
                                    :class="[
                                        btn.icono,
                                        'text-lg',
                                        {'text-gray-300 md:dark:text-gray-800': !isActive(btn.ruta)}, 
                                        { 'text-white md:dark:text-gray-600': isActive(btn.ruta) }
                                    ]">
                                </i>
                            </ButtonRounded>
                        </NuxtLink>
                    </nav>

                    <!-- Perfil / Logout -->
                    <a href="/" class="flex-col items-center gap-3 md:flex hidden">
                        <i
                            class="fa-solid fa-right-from-bracket text-lg text-white md:text-gray-300 dark:text-red-800 hover:text-red-600 cursor-pointer"></i>
                    </a>
                </div>

                <!-- Estado expandido -->
                <div v-else
                    class="menu-expandido dark:bg-(--color-default-claro) bg-(--color-default-700) flex flex-col justify-between w-full h-full shadow-lg rounded-lg py-4 px-3 overflow-y-auto scrollAside">
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

                        <!-- Navegación por íconos -->
                        <div class="lista" @click="cambiarEstadoFalse()">
                            <NuxtLink v-for="btn in navMenu" :key="btn.id"
                                class="flex items-center md:justify-between gap-2 py-2 px-2 -mx-2 relative"
                                :to="btn.ruta" :class="{ 'bg-(--color-default-100)': isActive(btn.ruta) }">
                                <span class="text-gray-200 dark:text-gray-800 font-medium text-sm"
                                    :class="{ 'text-white dark:text-gray-300': isActive(btn.ruta) }">
                                    {{ btn.nombre }}
                                </span>
                                <i
                                    :class="[btn.icono, 'text-lg text-gray-400 dark:text-gray-600 transition', { 'text-white! dark:text-gray-300!': isActive(btn.ruta) }]"></i>
                                <UButton v-if="btn.nombre == 'Reportes' && numeroPendientes > 0"
                                    class="rounded-full md:absolute top-0 -right-1 w-4 h-5 flex justify-center items-center text-xs"
                                    color="error">
                                    {{ numeroPendientes }}
                                </UButton>
                                <UButton v-if="btn.nombre == 'Agenda' && citasPendientes > 0"
                                    class="rounded-full md:absolute top-0 -right-1 w-4 h-4 flex justify-center items-center text-xs"
                                    color="error">
                                    {{ citasPendientes }}
                                </UButton>
                                <UButton v-if="btn.nombre == 'Cotizaciones' && cotizacionesPendientes > 0"
                                    class="rounded-full md:absolute top-0 -right-1 w-4 h-4 flex justify-center items-center text-xs"
                                    color="error">
                                    {{ cotizacionesPendientes }}
                                </UButton>
                            </NuxtLink>
                        </div>
                    </div>

                    <!-- Perfil -->
                    <div class="menu-item py-4 border-t border-gray-700 dark:border-gray-200 mt-4">
                        <div class="flex items-center md:justify-between gap-2 mb-2">
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
    height: 85vh;
    padding: 10px 0;
    transition: width 0.4s ease, transform 0.6s ease, opacity 0.6s ease;

}

.lista a {
    border-radius: 5px;
}

.lista a:hover {
    background-color: var(--color-default-100);
    color: white !important;
}

.lista a:hover span {
    color: white !important;
}

.lista a:hover i {
    color: var(--color-gray-200) !important;
}

.section-asidebar.expandido {
    /* ancho expandido */
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

.scrollAside {
    scrollbar-width: thin;
    scrollbar-color: var(--color-default-500) transparent;
}

.scrollAside::-webkit-scrollbar {
    width: 3px;
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
        height: calc(100vh - 30px);
        width: 70%;
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
        padding: 10px;
    }

    .clip {
        clip-path: none;
    }
}
</style>
