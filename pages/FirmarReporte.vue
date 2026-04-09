<script setup>
import { useRecibidoBuilder } from '~/build/Reporte/useRecibidoBuilder';
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import Form from '~/components/organism/Forms/Form.vue';
import { decryptData } from '~/composables/Formulario/crypto';
import { useReporteStore } from '~/stores/Formularios/Reportes/Reporte';

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const {
  options,
  simple,
} = useNotificacionesStore()

const token = route.query.token
const varView = useVarView()
const store = useReporteStore()
const estado = ref('cargando')

onMounted(async () => {

  if (!token) return

  try {
    const response = await fetch(`${config.public.api}/api/aprobarToken`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })
    })

    
    const data = await response.json()
    if(!data.success) return;
    store.Formulario.recibido.reporte_id = data.id

    options.icono = 'success';
    options.titulo = 'Solicitud de Permiso';
    options.texto = 'Permiso aprobado correctamente';
    options.tiempo = 5000;
    await simple();

    localStorage.setItem('token', token)
    // await exportarServicioPDF(data.id)

    estado.value = 'exito'
    // Si está logueado → redirigir según lógica

  } catch (error) {
    options.icono = 'error';
    options.titulo = 'Solicitud de Permiso';
    options.texto = 'No se puedo aprobar el permiso';
    options.tiempo = 5000;
    await simple();

    estado.value = 'error'
  }

})

// PDF
async function exportarServicioPDF(id) {
    try {
        console.log("Obteniendo PDF para el reporte con ID:", id);
        varView.cargando = true
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const res = await fetch(`${config.public.api}/api/reporte/${id}/pdf`, {
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
        blobGuardado = blob
        const url = window.URL.createObjectURL(blob);

        // Leer el nombre desde el header
        const disposition = res.headers.get('Content-Disposition');
        let fileName = `reporte_${id}.pdf`;
        if (disposition) {
            const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/);
            if (match && match[1]) {
                fileName = decodeURIComponent(match[1]);
            }
        }

        nombrePDF.value = fileName

        // Opcion de abrimos el PDF en una nueva pestaña sin descargar
        document.getElementById('visorPDF').src = url;
        document.getElementById('visorPDF').onload = () => {
        document.getElementById('pdfLoader').style.display = 'none';
        };

        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        varView.cargando = false
    } catch (err) {
        console.error("Error al obtener el PDF:", err);
        varView.cargando = false
    }
}

async function descargarPDF() {
    if (!blobGuardado) return;
    const url = window.URL.createObjectURL(blobGuardado);

    const a = document.createElement("a");
    a.href = url;
    a.download = nombrePDF.value;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

const cerrarPDF = () => {
    varView.showPDFServicio = false
}

const porpiedadesForm = useRecibidoBuilder({
    storeId: 'RegistrarFirma',
    storePinia: 'Reportes',
})

</script>

<template>
    <FondoDefault>
            <!-- Contenedor del visor -->
            <Form v-if="estado === 'exito'" :Propiedades="porpiedadesForm"></Form>
            <iframe id="visorPDF" class="w-full h-150 border-0 relative z-10"></iframe>
    </FondoDefault>
</template>