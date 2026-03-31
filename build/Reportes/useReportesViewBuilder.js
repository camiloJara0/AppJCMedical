// Builder para vista de reportes (solo lectura)
// Se usa solo para mostrar la información en el modal
export function useReportesViewBuilder(reporte) {
    return {
        reporte: reporte,
        titulo: 'Detalle del Reporte',
        estadoColor: (estado) => {
            const colores = {
                'completado': 'success',
                'pendiente': 'warning',
                'cancelado': 'error'
            }
            return colores[estado] || 'info'
        }
    }
}
