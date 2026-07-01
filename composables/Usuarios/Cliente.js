import { eliminarCliente } from "~/Core/Clientes/DeleteClientes";
import { useClientesStore } from "~/stores/Formularios/Clientes";

export function useClienteActions({
  stores,
  varView,
  notificaciones,
  llamadatos,
  refresh,
}) {

  const store = useClientesStore()
  
  const agregarCliente = () => {
    store.showNuevoCliente = true;
    varView.soloVer = false;
    varView.isEditing = false
  };

  const verCliente = async (Cliente) => {
    store.Formulario.Cliente.id = Cliente.id;
    store.Formulario.Cliente.nombre = Cliente.nombre;
    store.Formulario.Cliente.telefono = Cliente.telefono;
    store.Formulario.Cliente.correo = Cliente.correo;
    store.Formulario.Cliente.estado = Cliente.estado;
    store.showNuevoCliente = true
    store.editarCliente = true;
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

    await llamadatos();
    refresh.value++;
  };

  return {
    agregarCliente,
    verCliente,
    eliminarClientes
  };
}
