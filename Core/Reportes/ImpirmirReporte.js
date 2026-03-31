export async function imprimirReporte(reporte) {
    const config = useRuntimeConfig()
    const token = localStorage.getItem('token')
    try {
        const res = await fetch(`${config.public.api}/api/reporte/${reporte}/pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/pdf'
            }
        });
        if (!res.ok) {
            throw new Error(`Error en la petición: ${res.status}`);
        }

        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        // Leer el nombre desde el header
        const disposition = res.headers.get('Content-Disposition');
        let fileName = `reporte_${reporte}.pdf`;
        if (disposition) {
            const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/);
            if (match && match[1]) {
                fileName = decodeURIComponent(match[1]);
            }
        }

        // Descargar
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName; // nombre dinámico
        document.body.appendChild(a);
        a.click();
        a.remove();

    } catch (err) {
        console.error("Error al obtener el PDF:", err);
    }
}