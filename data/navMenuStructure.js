// Estructura de botones del menú de navegación por rol

export const navMenuAdmin = [
    {
        id: 1,
        nombre: 'Agenda',
        icono: 'fa-solid fa-calendar-day',
        ruta: '/Citas',
        action: 'Citas',
        accesoRapido: true
    },
    {
        id: 2,
        nombre: 'Categorías',
        icono: 'fa-solid fa-building',
        ruta: '/Categorias',
        action: 'Categorias'
    },
    {
        id: 3,
        nombre: 'Clientes',
        icono: 'fa-solid fa-users',
        ruta: '/Usuarios/Clientes',
        action: 'Clientes'
    },
    {
        id: 4,
        nombre: 'Componentes',
        icono: 'fa-solid fa-microchip',
        ruta: '/Datos',
        action: 'Componentes'
    },
    {
        id: 5,
        nombre: 'Cotizaciones',
        icono: 'fa-solid fa-money-bill',
        ruta: '/Cotizacion',
        action: 'Cotizaciones',
        accesoRapido: true
    },
    {
        id: 6,
        nombre: 'Equipos',
        icono: 'fa-solid fa-desktop',
        ruta: '/Productos/Equipos',
        action: 'Equipos',
        accesoRapido: true
    },
    {
        id: 7,
        nombre: 'Reportes',
        icono: 'fa-solid fa-file-lines',
        ruta: '/Historial',
        action: 'Reportes',
        accesoRapido: true
    },
    {
        id: 8,
        nombre: 'Sistemas',
        icono: 'fa-solid fa-network-wired',
        ruta: '/Datos/Sistemas',
        action: 'Sistemas'
    },
    {
        id: 9,
        nombre: 'Tipo Equipos',
        icono: 'fa-solid fa-screwdriver-wrench',
        ruta: '/Productos/Tipo_equipos',
        action: 'TipoEquipos'
    },
    {
        id: 10,
        nombre: 'Técnicos',
        icono: 'fa-solid fa-user-gear',
        ruta: '/Usuarios',
        action: 'Tecnicos',
    },
    {
        id: 11,
        nombre: 'Productos',
        icono: 'fa-solid fa-store',
        ruta: '/Productos',
        action: 'Productos',
        accesoRapido: true
    }
]

export const navMenuTecnico = [
    {
        id: 1,
        nombre: 'Agenda',
        icono: 'fa-solid fa-calendar-day',
        ruta: '/Citas',
        action: 'Citas',
        accesoRapido: true
    },
    {
        id: 2,
        nombre: 'Componentes',
        icono: 'fa-solid fa-microchip',
        ruta: '/Datos',
        action: 'Componentes',
        accesoRapido: true
    },
    {
        id: 3,
        nombre: 'Equipos',
        icono: 'fa-solid fa-desktop',
        ruta: '/Productos/Equipos',
        action: 'Equipos',
        accesoRapido: true
    },
    {
        id: 4,
        nombre: 'Reportes',
        icono: 'fa-solid fa-file-lines',
        ruta: '/Historial',
        action: 'Reportes',
        accesoRapido: true
    },
    {
        id: 5,
        nombre: 'Sistemas',
        icono: 'fa-solid fa-network-wired',
        ruta: '/Datos/Sistemas',
        action: 'Sistemas',
        accesoRapido: true
    },
    {
        id: 6,
        nombre: 'Tipo Equipos',
        icono: 'fa-solid fa-screwdriver-wrench',
        ruta: '/Productos/Tipo_equipos',
        action: 'TipoEquipos'
    }
]

export const navMenuSuperAdmin = [
    {
        id: 1,
        nombre: 'Panel',
        icono: 'fa-solid fa-gauge-high',
        ruta: '/Backoffice',
        action: 'Backoffice',
        accesoRapido: true
    },
    {
        id: 2,
        nombre: 'Usuarios',
        icono: 'fa-solid fa-users-gear',
        ruta: '/Backoffice/Usuarios',
        action: 'BackofficeUsuarios'
    },
    {
        id: 3,
        nombre: 'Roles',
        icono: 'fa-solid fa-user-shield',
        ruta: '/Backoffice/Roles',
        action: 'BackofficeRoles'
    },
    {
        id: 4,
        nombre: 'Auditoría',
        icono: 'fa-solid fa-clipboard-list',
        ruta: '/Backoffice/Auditoria',
        action: 'BackofficeAuditoria',
        accesoRapido: true
    },
    {
        id: 5,
        nombre: 'Errores',
        icono: 'fa-solid fa-bug',
        ruta: '/Backoffice/Errores',
        action: 'BackofficeErrores',
        accesoRapido: true,
    },
    {
        id: 6,
        nombre: 'Métricas',
        icono: 'fa-solid fa-chart-line',
        ruta: '/Backoffice/Metricas',
        action: 'BackofficeMetricas'
    },
    {
        id: 7,
        nombre: 'Sistema',
        icono: 'fa-solid fa-server',
        ruta: '/Backoffice/Sistema',
        action: 'BackofficeSistema',
        accesoRapido: true
    }
]
