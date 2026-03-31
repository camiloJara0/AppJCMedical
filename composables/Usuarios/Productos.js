import { mapCampos } from "~/components/organism/Forms/useFormulario";
import { eliminarProductos } from "~/Core/Productos/DeleteProductos";
import { useProductosStore } from "~/stores/Formularios/Productos";

export function useProductoActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  /* ===============================
     MODALES
  =============================== */
  const store = useProductosStore()
  const agregarProducto = () => {
    show.value = true;
    isEditing.value = false;
    varView.soloVer = true;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  /* ===============================
     VER Producto
  =============================== */

  const verProducto = async (Producto) => {
    mapCampos(Producto, store.Formulario.Producto);

    store.Formulario.Producto.id = Producto.id;
    isEditing.value = true;
    show.value = true
    varView.isEditing = true
  };

  /* ===============================
     ELIMINAR Producto
  =============================== */

  const eliminarProductosModal = async () => {
    const Producto = store.Formulario.Producto;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el Producto?",
      html: `Se eliminará el Producto: <span>${Producto.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarProductos(Producto);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Producto eliminado con éxito.",
      background: "#6bc517",
      tiempo: 1500
    };

    notificaciones.mensaje();
    notificaciones.options.background = "#d33";

    cerrar();
    await llamadatos();
    refresh.value++;
  };

  return {
    agregarProducto,
    verProducto,
    cerrar,
    eliminarProductosModal
  };
}
