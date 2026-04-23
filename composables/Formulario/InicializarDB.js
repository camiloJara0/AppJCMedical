import { useCategoriasStore } from "~/stores/Formularios/Categorias";
import { useCitasStore } from "~/stores/Formularios/citas/Cita";
import { useClientesStore } from "~/stores/Formularios/Clientes";
import { useComponentesStore } from "~/stores/Formularios/Componentes/Componente";
import { useCotizacionesStore } from "~/stores/Formularios/Cotizaciones";
import { useEquiposStore } from "~/stores/Formularios/Equipos/Equipo";
import { useProductosStore } from "~/stores/Formularios/Productos";
import { useReporteStore } from "~/stores/Formularios/Reportes/Reporte";
import { useSistemasStore } from "~/stores/Formularios/Sistemas/Sistema";
import { useTecnicosStore } from "~/stores/Formularios/Tecnicos/Tecnico";
import { useTipo_equiposStore } from "~/stores/Formularios/Tipo_equipos/Tipo_equipo";

export async function iniciar (onProgress = () => {}) {
    try {
        const reportes = useReporteStore()
        const categorias = useCategoriasStore()
        const citas = useCitasStore()
        const clientes = useClientesStore()
        const componentes = useComponentesStore()
        const cotizaciones = useCotizacionesStore()
        const equipos = useEquiposStore()
        const productos = useProductosStore()
        const sistemas = useSistemasStore()
        const tecnicos = useTecnicosStore()
        const tipo_equipos = useTipo_equiposStore()

        const pasos = [
            { texto: 'Cargando Reportes...', fn: () => reportes.traer() },
            { texto: 'Cargando Categorias...', fn: () => categorias.traer() },
            { texto: 'Cargando Citas...', fn: () => citas.traer() },
            { texto: 'Cargando Clientes...', fn: () => clientes.traer() },
            { texto: 'Cargando Componentes...', fn: () => componentes.traer() },
            { texto: 'Cargando Cotizaciones...', fn: () => cotizaciones.traer() },
            { texto: 'Cargando Equipos...', fn: () => equipos.traer() },
            { texto: 'Cargando Productos...', fn: () => productos.traer() },
            { texto: 'Cargando Sistemas...', fn: () => sistemas.traer() },
            { texto: 'Cargando Tecnicos...', fn: () => tecnicos.traer() },
            { texto: 'Cargando Tipo de equipos...', fn: () => tipo_equipos.traer() },
        ];

        const total = pasos.length;

        for (let i = 0; i < total; i++) {
            const porcentaje = Math.round(((i + 1) / total) * 100);
            onProgress(porcentaje, pasos[i].texto);
            await pasos[i].fn();
        }

        return true;
    } catch (error) {
        console.error('Error al traer datos:', error);
        throw error;
    }
}