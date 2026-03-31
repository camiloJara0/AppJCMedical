


export async function traerDatos(onProgress = () => {}) {
    try {


        const pasos = [
            { texto: 'Cargando Categorias, productos...', fn: () => {} },
            // { texto: 'Cargando historias clínicas...', fn: () => historiaStore.indexDBDatos() },
            // { texto: 'Cargando citas...', fn: () => citasStore.indexDBDatos() },
            // { texto: 'Cargando profesionales...', fn: () => profesionalesStore.indexDBDatos() },
            // { texto: 'Cargando pacientes...', fn: () => pacientesStore.indexDBDatos() },
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

