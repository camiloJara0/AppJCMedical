import { eliminarCategoria } from "~/Core/Categorias/DeleteCategoria";
import { useCategoriasStore } from "~/stores/Formularios/Categorias";

export function useCategoriaActions({
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

  const store = useCategoriasStore()
  const agregarCategoria = () => {
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  /* ===============================
     VER Categoria
  =============================== */

  const verCategoria = async (Categoria) => {
    store.Formulario.Categoria.id = Categoria.id;
    store.Formulario.Categoria.nombre = Categoria.nombre;
    store.Formulario.Categoria.descripcion = Categoria.descripcion;
    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  /* ===============================
     ELIMINAR Categoria
  =============================== */

  const eliminarCategorias = async (categoria) => {
    store.Formulario.Categoria = categoria;
    const Categoria = store.Formulario.Categoria;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar la Categoria?",
      html: `Se eliminará la Categoria: <span>${Categoria.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarCategoria(Categoria);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Categoria eliminado con éxito.",
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
    agregarCategoria,
    verCategoria,
    cerrar,
    eliminarCategorias
  };
}
