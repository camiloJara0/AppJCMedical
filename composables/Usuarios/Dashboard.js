import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import { useCotizacionesStore } from "~/stores/Formularios/Cotizaciones";
import { useEquiposStore } from "~/stores/Formularios/Equipos/Equipo";
import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";

export async function traerDashboard() {
    const storeEquipos = useEquiposStore()
    const storeReportes = useReporteStore()
    const storeCotizaciones = useCotizacionesStore()
    const storeCitas = useCitasStore()

    const listaequipos = await storeEquipos.traer(false, true)
    const listareportes = await storeReportes.traer(false, true)
    const listacotizaciones = await storeCotizaciones.traer(false, true)
    const listacitas = await storeCitas.traer(false, true)

    const equipos = listaequipos?.length || 0
    const mantenimientosPendientes = listacitas?.filter(c => c.estado == 'inactiva').length || 0
    const cotizaciones = listacotizaciones?.filter(c => c.estado == 'pendiente').length || 0

    // Equipos críticos: último reporte de cada equipo con algún componente en estado "malo"
    const ultimosReportes = {}
    listareportes.forEach(r => {
        if (!ultimosReportes[r.equipo_id] || new Date(r.fecha) > new Date(ultimosReportes[r.equipo_id].fecha)) {
            ultimosReportes[r.equipo_id] = r
        }
    })
    const equiposCriticos = Object.values(ultimosReportes)
        .filter(r => r.estado_componentes?.some(ec => ec.estado === 'malo')).length

    // Chart Data: últimos 6 meses
    const ahora = new Date()
    const chartData = []
    for (let i = 5; i >= 0; i--) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
        const mes = fecha.toLocaleString('es-ES', { month: 'short' })
        const numero = listareportes.filter(r => {
            const rf = new Date(r.fecha)
            return rf.getMonth() === fecha.getMonth() && rf.getFullYear() === fecha.getFullYear()
        }).length
        chartData.push({ Fecha: mes, numero })
    }

    // Estado Data: estados de reportes + equipos críticos
    const estadoAgrupado = {}
    listareportes.forEach(r => {
        estadoAgrupado[r.estado] = (estadoAgrupado[r.estado] || 0) + 1
    })
    const estadoData = Object.entries(estadoAgrupado).map(([estado, cantidad]) => ({
        estado,
        cantidad
    }))
    // Agregar "En mal estado" desde equipos críticos
    estadoData.push({ estado: 'En mal estado', cantidad: equiposCriticos })

    // Resultado final
    const datos = {
        equipos,
        mantenimientosPendientes,
        cotizaciones,
        equiposCriticos,
        chartData,
        estadoData
    }

    return datos
}