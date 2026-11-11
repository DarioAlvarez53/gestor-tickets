// app.js — Gestor de tickets, con el micro-reto 60 completado.
// Basado en el código que Dario pegó en el chat principal el 2026-11-09
// (19:57 hora local), con los 6 arreglos que Muse le marcó a las 19:58:
// 1) crear, 2) eliminar uno, 3) cambiar estado, 4) editar título y
// 5) cambiar prioridad ya mandan el token con headersAuth(), y
// 6) cargarTickets ya no pinta nada si la respuesta no es ok (401 sin login).
// Lo demás es su código tal cual, sin otros cambios.

let tickets = [];

const headersAuth = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
}

const cargarTickets = async () => {
  const respuesta = await fetch("http://localhost:3000/api/tickets",{
    headers: headersAuth()
  });
  if (!respuesta.ok) return;
  tickets = await respuesta.json()
  mostrarTickets();
}

cargarTickets();

if (localStorage.getItem("tema") === "oscuro") {
  document.body.classList.add("oscuro");
}

const guardarTickets = () => {
  localStorage.setItem("tickets", JSON.stringify(tickets));
};

const agregarTicket = (tickets, titulo, prioridad) => {
  //Aqui se determina el id siuiente
  const nuevoId = Math.max(0, ...tickets.map((ticket) => ticket.id)) + 1;

  const nuevoTicket = {
    id: nuevoId,
    titulo: titulo,
    estado: "abierto",
    prioridad: prioridad,
    fecha: new Date().toLocaleDateString("es-MX"),
  };

  const nuevoListado = [...tickets, nuevoTicket];

  return nuevoListado;
};

const eliminarTicket = (tickets, id) => {
  return tickets.filter((ticket) => ticket.id !== id);
};

const actualizarEstado = (tickets, id, estado) => {
  const ticketActualizado = tickets.map((ticket) => {
    if (ticket.id === id) {
      return { ...ticket, estado: estado };
    }
    return ticket;
  });
  return ticketActualizado;
};

const resumenTickets = (tickets) => {
  const total = tickets.length;
  const abiertos = tickets.filter(
    (ticket) => ticket.estado === "abierto",
  ).length;
  const cerrados = tickets.filter(
    (ticket) => ticket.estado === "cerrado",
  ).length;
  const alta = tickets.filter((ticket) => ticket.prioridad === "alta").length;
  const media = tickets.filter((ticket) => ticket.prioridad === "media").length;
  const baja = tickets.filter((ticket) => ticket.prioridad === "baja").length;

  return {
    total: total,
    abiertos: abiertos,
    cerrados: cerrados,
    porPrioridad: {
      alta: alta,
      media: media,
      baja: baja,
    },
  };
};

const mostrarResumen = (tickets) => {
  const resumen = document.getElementById("resumen");
  resumen.innerHTML = "";
  const resumenDatos = resumenTickets(tickets);
  resumen.innerHTML += `
            <h2>Resumen General</h2>    
            <p>Abiertos: ${resumenDatos.abiertos}, Cerrados: ${resumenDatos.cerrados}, Total: ${resumenDatos.total}</p>
            <h2>Por prioridad</h2>
            <p>Alta: ${resumenDatos.porPrioridad.alta}, Media: ${resumenDatos.porPrioridad.media}, Baja: ${resumenDatos.porPrioridad.baja}</p>
            `;
  guardarTickets();
};

let textoBuscado = "";
let filtroActual = "todos";
let filtroPrioridad = "todos";
const mostrarTickets = () => {
  const lista = document.getElementById("lista-tickets");
  lista.innerHTML = "";

  const ticketsMostrar =
    filtroActual === "todos"
      ? tickets
      : tickets.filter((ticket) => ticket.estado === filtroActual);

  const ticketsPorPrioridad = ticketsMostrar.filter(
    (ticket) =>
      filtroPrioridad === "todos" || ticket.prioridad === filtroPrioridad,
  );

  const ticketsBuscados = ticketsPorPrioridad.filter((ticket) =>
    ticket.titulo.toLowerCase().includes(textoBuscado.toLowerCase()),
  );

  const ordenPrioridad = { alta: 1, media: 2, baja: 3 };

  const ticketsOrdenados = [...ticketsBuscados].sort(
    (a, b) => ordenPrioridad[a.prioridad] - ordenPrioridad[b.prioridad],
  );

  document.getElementById("contador-resultados").textContent =
    `Mostrando ${ticketsOrdenados.length} de ${tickets.length} tickets`;

  if (ticketsOrdenados.length === 0) {
    lista.innerHTML = `<li class="vacio">No hay tickets que mostrar</li>`;
    mostrarResumen();
    return;
  }

  for (let i = 0; i < ticketsOrdenados.length; i++) {
    const ticket = ticketsOrdenados[i];
    lista.innerHTML += `
                <li class="prioridad-${ticket.prioridad} ${ticket.estado === "cerrado" ? "cerrado" : ""}">
                    Ticket no. ${ticket.id}. 
                    ${ticket.titulo}. 
                    Estado: ${ticket.estado}. 
                    Prioridad: ${ticket.prioridad}. 
                    Fecha: ${ticket.fecha || "Sin fecha"}.
                    <button class="btn-eliminar" data-id="${ticket.id}">Eliminar</button>
                    <button class="btn-estado" data-id="${ticket.id}">${ticket.estado === "abierto" ? "Cerrar" : "Reabrir"}</button>
                    <button class="btn-editar" data-id="${ticket.id}">Editar</button>
                    <select class="select-prioridad" data-id="${ticket.id}">
                        <option value="alta" ${ticket.prioridad === "alta" ? "selected" : ""}>Alta</option>
                        <option value="media" ${ticket.prioridad === "media" ? "selected" : ""}>Media</option>
                        <option value="baja" ${ticket.prioridad === "baja" ? "selected" : ""}>Baja</option>
                    </select>

                </li>
                `;
  }
  mostrarResumen(tickets);
};

document.querySelectorAll(".btn-filtro").forEach((boton) => {
  boton.addEventListener("click", () => {
    filtroActual = boton.dataset.filtro;
    mostrarTickets();
  });
});

document.getElementById("buscador").addEventListener("input", (event) => {
  textoBuscado = event.target.value;
  mostrarTickets();
});

document
  .getElementById("filtro-prioridad")
  .addEventListener("change", (event) => {
    filtroPrioridad = event.target.value;
    mostrarTickets();
  });

document.getElementById("btn-limpiar").addEventListener("click", () => {
  ((filtroActual = "todos"), (filtroPrioridad = "todos"));
  textoBuscado = "";
  document.getElementById("buscador").value = "";
  document.getElementById("filtro-prioridad").value = "todos";
  mostrarTickets();
});

document.getElementById("btn-exportar").addEventListener("click", () => {
  const texto = JSON.stringify(tickets, null, 2);
  const archivo = new Blob([texto], { type: "application/json" });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "tickets.json";
  enlace.click();
  URL.revokeObjectURL(url);
});

document
  .getElementById("btn-limpiar-cerrados")
  .addEventListener("click", async () => {
    const cerrados = tickets.filter(
      (ticket) => ticket.estado === "cerrado",
    );
    if (cerrados.length === 0) {
      alert("No hay tickets cerrados por eliminar");
      return;
    }
    const confirmar = confirm(`¿Eliminar ${cerrados.length} tickets(s) cerrado(s)?`);
    if (confirmar) {
      for (const ticket of cerrados) {
        await fetch(`http://localhost:3000/api/tickets/${ticket.id}`, {
          method: "DELETE",
          headers: headersAuth()
        });
      }
      await cargarTickets();
    }
  });


// Modo oscuro
document.getElementById("btn-tema").addEventListener("click", () => {
  document.body.classList.toggle("oscuro");
  const tema = document.body.classList.contains("oscuro") ? "oscuro" : "claro";
  localStorage.setItem("tema", tema);
});

document.getElementById("btn-importar").addEventListener("click", () => {
  document.getElementById("input-importar").click();
});

document.getElementById("input-importar").addEventListener("change", (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const datos = JSON.parse(lector.result);
      if (!Array.isArray(datos)) {
        alert("El archivo no tiene una lista de tickets válida");
        return;
      }
      tickets = datos;
      mostrarTickets();
    } catch {
      alert("No se pudo leer el archivo, revisa que sea un JSON válido");
    }
  };
  lector.readAsText(archivo);
});

// Seleccionamos el formulario
const formulario = document.getElementById("form-ticket");
//Escuchando el boton
formulario.addEventListener("submit", async(event) => {
  event.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const prioridad = document.getElementById("prioridad").value;
  await fetch("http://localhost:3000/api/tickets", {
    method: "POST",
    headers: headersAuth(),
    body: JSON.stringify({ titulo, prioridad})
  });
  formulario.reset();
  await cargarTickets();
});

const lista = document.getElementById("lista-tickets");
lista.addEventListener("click", async (event) => {
  const id = Number(event.target.dataset.id);

  if (event.target.classList.contains("btn-eliminar")) {
    const ticket = tickets.find((ticket) => ticket.id === id);
    const confirmar = confirm(`¿Eliminar el ticket "${ticket.titulo}"?`);
    if (confirmar) {
      await fetch(`http://localhost:3000/api/tickets/${id}`,{
        method: "DELETE",
        headers: headersAuth()
      });
      await cargarTickets();
    }
  }

  if (event.target.classList.contains("btn-estado")) {
    const ticket = tickets.find((ticket) => ticket.id === id);
    const nuevoEstado = ticket.estado === "abierto" ? "cerrado" : "abierto";
    await fetch(`http://localhost:3000/api/tickets/${id}`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify({ estado: nuevoEstado})
    });
    await cargarTickets();
  }

  if (event.target.classList.contains("btn-editar")) {
    const ticket = tickets.find((ticket) => ticket.id === id);
    const nuevoTitulo = prompt("Nuevo titulo", ticket.titulo);
    if (nuevoTitulo && nuevoTitulo.trim() !== "") {
      await fetch(`http://localhost:3000/api/tickets/${id}`,{
        method: "PUT",
        headers: headersAuth(),
        body: JSON.stringify({ titulo: nuevoTitulo.trim() }),
      });
      await cargarTickets();
    }
  }
});
lista.addEventListener("change", async (event) => {
  if (event.target.classList.contains("select-prioridad")) {
    const id = Number(event.target.dataset.id);
    const nuevaPrioridad = event.target.value;
    await fetch(`http://localhost:3000/api/tickets/${id}`, {
      method: "PUT",
      headers: headersAuth(),
      body: JSON.stringify({ prioridad: nuevaPrioridad })
    })
    await cargarTickets();
  }
});

const formLogin = document.getElementById("form-login");
formLogin.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const respuesta = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    alert(datos.error);
    return;
  }
  localStorage.setItem("token", datos.token);
  await cargarTickets();
});

document.getElementById("btn-logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  location.reload();
});

const formRegistro = document.getElementById("form-registro");
formRegistro.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nombre = document.getElementById("registro-nombre").value;
  const email = document.getElementById("registro-email").value;
  const password = document.getElementById("registro-password").value;
  const respuesta = await fetch("http://localhost:3000/api/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, email, password })
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    alert(datos.error);
    return;
  }
  alert("Cuenta creada, ahora entra con tu correo y contraseña");
  formRegistro.reset();
});



mostrarTickets();
