import { ref } from "vue";
// Creacion de botones Aside de ejemplo Icono, titulo, subsecciones

export const buttons = ref([
    {
        id: 4,
        nombre: "Productos",
        secciones: [
            {

                titulo: "Productos",
                ruta: '/Productos'
            },
            {

                titulo: "Categorias",
                ruta: '/Categorias'
            },
            {
                titulo: "Tipo Equipos",
                ruta: '/Productos/Tipo_equipos'
            },
            {
                titulo: "Equipos",
                ruta: '/Productos/Equipos'
            },
        ],
        icon: "fa-store",
        tamaño: 'max-h-[25vh]',
        active: false,
    },
    {
        id: 1,
        nombre: "Datos",
        secciones: [
            {
                titulo: "Componentes",
                ruta: '/Datos'
            },
            {
                titulo: "Sistemas",
                ruta: '/Datos/Sistemas'
            },
        ],
        icon: "fa-building",
        tamaño: 'max-h-[37vh]',
        active: false,
    },
    {
        id: 2,
        nombre: "Historial",
        secciones: [
            {
                titulo: "Reportes",
                ruta: '/Historial'
            },
            {
                titulo: "Cotizaciones",
                ruta: '/Cotizacion'
            },
        ],
        icon: "fa-file",
        tamaño: 'max-h-[25vh]',
        active: false,
    },
    {
        id: 3,
        nombre: "Usuarios",
        secciones: [
            {
                titulo: "Clientes",
                ruta: '/Usuarios/Clientes'
            },
            {
                titulo: "Tecnicos",
                ruta: '/Usuarios'
            },
            {
                titulo: "Agenda",
                ruta: '/Citas'
            },
        ],
        icon: "fa-user",
        tamaño: 'max-h-[25vh] pb-0',
        showUp: true,
        active: false,
    },
]);

export const buttonsTecnicos = ref([
    {
        id: 4,
        nombre: "Productos",
        secciones: [
            {
                titulo: "Tipo Equipos",
                ruta: '/Productos/Tipo_equipos'
            },
            {
                titulo: "Equipos",
                ruta: '/Productos/Equipos'
            },
        ],
        icon: "fa-store",
        tamaño: 'max-h-[25vh]',
        active: false,
    },
    {
        id: 1,
        nombre: "Datos",
        secciones: [
            {
                titulo: "Componentes",
                ruta: '/Datos'
            },
            {
                titulo: "Sistemas",
                ruta: '/Datos/Sistemas'
            },
        ],
        icon: "fa-building",
        tamaño: 'max-h-[37vh]',
        active: false,
    },
    {
        id: 2,
        nombre: "Historial",
        secciones: [
            {
                titulo: "Reportes",
                ruta: '/Historial'
            },
        ],
        icon: "fa-file",
        tamaño: 'max-h-[25vh]',
        active: false,
    },
    {
        id: 3,
        nombre: "Usuarios",
        secciones: [
            {
                titulo: "Agenda",
                ruta: '/Citas'
            },
        ],
        icon: "fa-user",
        tamaño: 'max-h-[25vh] pb-0',
        showUp: true,
        active: false,
    },
]);

export const secciones = ['Configuracion','Resoluciones','Inventarios','Datos','Usuarios','Negocios','Productos','Formas de pago','Impuestos','Cajas','Historias','Consultas','Análisis','Evoluciones','Notas','Tratamientos','Medicacion',
    'Pacientes','Profesional','Citas','Crear','Rips','Reportes'];

export const seccionesConAcciones = secciones.flatMap(seccion => {
  const clave = seccion.replace(/\s+/g, '_'); // reemplaza espacios por guiones bajos
  return [`${clave}_get`, `${clave}_post`, `${clave}_put`, `${clave}_delete`, `${clave}_view`];
});