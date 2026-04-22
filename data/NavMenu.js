// Creacion de botones del Navbar
export const submenuNotificaciones = [
    { id: 1, nombre: 'Notificaciones', icon: 'lucide-bell', link: '#' },
    { id: 2, nombre: 'Alertas', icon: 'lucide-bell-ring', link: '#' }
];

export const submenuSesion = [
    { id: 1, nombre: 'Iniciar Sesión', icon: 'lucide-user', link: '/' },
    { id: 2, nombre: 'Cerrar Sesión', icon: 'i-lucide-arrow-left-to-line', link: '/', accion: () => { 
            localStorage.removeItem('rol')
            localStorage.removeItem('seccion')
            localStorage.removeItem('ultimaSincronizacion')
        } 
    },
]