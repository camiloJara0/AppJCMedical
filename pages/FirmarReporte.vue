<script setup>
import { useRecibidoBuilder } from '~/build/Reporte/useRecibidoBuilder';
import FondoBlur from '~/components/atoms/Fondos/FondoBlur.vue';
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
let blobGuardado = '';
const nombrePDF = ref('');
const estado = ref('cargando')

definePageMeta({
    layout: 'authentication'
});

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
        if (!data.success) return;
        store.Formulario.recibido.reporte_id = data.id

        options.icono = 'success';
        options.titulo = 'Solicitud de Permiso';
        options.texto = 'Permiso aprobado correctamente';
        options.tiempo = 5000;
        await simple();

        localStorage.setItem('token', token)
        await exportarServicioPDF(data.id)

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
        varView.cargando = true
        const config = useRuntimeConfig()
        const token = localStorage.getItem('token')
        const res = await fetch(`${config.public.api}/api/reporteRealizado/${id}/pdf`, {
            method: 'POST',
            body: JSON.stringify({ id: id }),
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/pdf',
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
        // document.getElementById('pdfLoader').style.display = 'none';
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
    <!-- <FondoBlur>
        <Form v-if="estado === 'exito'" :Propiedades="porpiedadesForm"></Form>
        <iframe id="visorPDF" class="w-full h-150 border-0 relative z-10"></iframe>
    </FondoBlur> -->
  <FondoBlur>
    <div class="flex flex-col items-center justify-center w-full h-full px-4">
      
      <!-- Contenedor con efecto glassmorphism -->
      <div
        class="w-full max-w-4xl rounded-2xl shadow-2xl p-6 my-6 md:m-10 md:p-10
               bg-white dark:bg-gray-800 backdrop-blur-xl
               border border-white/30 dark:border-gray-700/40
               transition-all duration-300 overflow-y-auto scrollSectionFirma"
      >
        
        <!-- Encabezado -->
        <header class="text-center mb-6">
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Visor de Reporte
          </h1>
          <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mt-2">
            Firma y consulta tu reporte de manera segura
          </p>
        </header>
        
        <!-- Visor PDF -->
        <div
          class="relative w-full h-[65vh] md:h-[75vh] rounded-xl overflow-hidden border border-white/20 dark:border-gray-700/30 shadow-inner"
        >
          <iframe
            id="visorPDF"
            class="w-full h-full border-0"
            title="Visor PDF"
          ></iframe>
        </div>

        <!-- Formulario -->
        <Form
          v-if="estado === 'exito'"
          :Propiedades="porpiedadesForm"
          class="my-6"
        />
        
        
        <!-- Footer -->
        <footer class="mt-6 text-center text-xs md:text-sm text-gray-600 dark:text-gray-400">
          © 2026 ANANKE — Reportes seguros y accesibles
        </footer>
      </div>
    </div>
  </FondoBlur>


</template>

<style>
.scrollSectionFirma {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
}

.scrollSectionFirma::-webkit-scrollbar {
    width: 7px;
    height: 7px;
}
</style>