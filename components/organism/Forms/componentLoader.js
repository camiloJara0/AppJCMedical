// utils/componentLoader.js
import { defineAsyncComponent } from 'vue';

export function loadComponent(name) {
  const componentMap = {
    Input: () => import('~/components/atoms/Inputs/Input.vue'),
    Select: () => import('~/components/atoms/Selects/Select.vue'),
    Label: () => import('~/components/atoms/Labels/Label.vue'),
    SelectSearch: () => import('~/components/atoms/Selects/SelectSearch.vue'),
    SelectMultiple: () => import('~/components/atoms/Selects/SelectMultiple.vue'),
    Textarea: () => import('~/components/atoms/Textareas/Textarea.vue'),
    Checkbox: () => import('~/components/atoms/Checkbox/Checkbox.vue'),
    GroupCampos: () => import('~/components/molecules/groupCampos/GroupCampos.vue'),
    Imagen: () => import('~/components/atoms/Images/Imagen.vue'),
    Permisos: () => import('~/components/atoms/Selects/Permisos.vue'),
    Card: () => import('~/components/molecules/Cards/Card.vue'),
    Button: () => import('~/components/atoms/Buttons/Button.vue'),
    Radio: () => import('~/components/atoms/RadioButtons/RadioButton.vue'),
  };

  const loader = componentMap[name];
  return loader ? defineAsyncComponent(loader) : null;
}

export async function cargarStore(storeName) {
  let tablaStore;

  switch (storeName) {
    case 'Categorias': {
      const { useCategoriasStore } = await import('~/stores/Formularios/Categorias');
      tablaStore = useCategoriasStore();
      break;
    }
    case 'Productos': {
      const { useProductosStore } = await import('~/stores/Formularios/Productos');
      tablaStore = useProductosStore();
      break;
    }
    case 'Cotizacion': {
      const { useCotizacionesStore } = await import('~/stores/Formularios/Cotizaciones');
      tablaStore = useCotizacionesStore();
      break;
    }
    case 'Clientes': {
      const { useClientesStore } = await import('~/stores/Formularios/Clientes');
      tablaStore = useClientesStore();
      break;
    }
    case 'Tecnicos': {
      const { useTecnicosStore } = await import('~/stores/Formularios/Tecnicos/Tecnico');
      tablaStore = useTecnicosStore();
      break;
    }
    case 'Tipo_equipos': {
      const { useTipo_equiposStore } = await import('~/stores/Formularios/Tipo_equipos/Tipo_equipo');
      tablaStore = useTipo_equiposStore();
      break;
    }
    case 'Equipos': {
      const { useEquiposStore } = await import('~/stores/Formularios/Equipos/Equipo');
      tablaStore = useEquiposStore();
      break;
    }
    case 'Citas': {
      const { useCitasStore } = await import('~/stores/Formularios/citas/Cita');
      tablaStore = useCitasStore();
      break;
    }
    case 'Reportes': {
      const { useReporteStore } = await import('~/stores/Formularios/Reportes/Reporte');
      tablaStore = useReporteStore();
      break;
    }
    case 'Sistemas': {
      const { useSistemasStore } = await import('~/stores/Formularios/Sistemas/Sistema');
      tablaStore = useSistemasStore();
      break;
    }
    case 'Componentes': {
      const { useComponentesStore } = await import('~/stores/Formularios/Componentes/Componente');
      tablaStore = useComponentesStore();
      break;
    }
    case 'Login': {
      const { useUsuariosStore } = await import('~/stores/Formularios/login/Login');
      tablaStore = useUsuariosStore();
      break;
    }
    default:
      console.warn(`Store "${storeName}" no reconocido.`);
      break;
  }

  return tablaStore;
}