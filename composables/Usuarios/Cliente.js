import { eliminarCliente } from "~/Core/Clientes/DeleteClientes";
import { useClientesStore } from "~/stores/Formularios/Clientes";

export function useClienteActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
  show,
  isEditing
}) {

  const store = useClientesStore()
  
  const agregarCliente = () => {
    show.value = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const cerrar = () => {
    show.value = false;
    isEditing.value = false;
    varView.soloVer = true;
  };

  const verCliente = async (Cliente) => {
    store.Formulario.Cliente.id = Cliente.id;
    store.Formulario.Cliente.nombre = Cliente.nombre;
    store.Formulario.Cliente.telefono = Cliente.telefono;
    store.Formulario.Cliente.correo = Cliente.correo;
    store.Formulario.Cliente.estado = Cliente.estado;
    show.value = true
    isEditing.value = true;
    varView.isEditing = true
  };

  const eliminarClientes = async (cliente) => {
    store.Formulario.Cliente = cliente;
    const Cliente = store.Formulario.Cliente;

    notificaciones.options = {
      icono: "warning",
      titulo: "¿Deseas eliminar el Cliente?",
      html: `Se eliminará el Cliente: <span>${Cliente.nombre}</span>`,
      confirmtext: "Sí, eliminar",
      canceltext: "Atrás"
    };

    const respuesta = await notificaciones.alertRespuesta();

    if (respuesta !== "confirmado") return;

    const eliminado = await eliminarCliente(Cliente);

    if (!eliminado) return;

    notificaciones.options = {
      position: "top-end",
      texto: "Cliente eliminado con éxito.",
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
    agregarCliente,
    verCliente,
    cerrar,
    eliminarClientes
  };
}
