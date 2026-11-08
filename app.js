let tickets = JSON.parse(localStorage.getItem("tickets")) || [
            { id: 1, titulo: "No imprime", estado: "abierto", prioridad: "alta" },
            { id: 2, titulo: "Correo lento", estado: "cerrado", prioridad: "baja" },
            { id: 3, titulo: "Sin internet", estado: "abierto", prioridad: "media" },
            { id: 4, titulo: "Teclado falla", estado: "abierto", prioridad: "baja" },
        ]

        if(localStorage.getItem("tema") === "oscuro") {
            document.body.classList.add("oscuro");
        }

        const guardarTickets = () => {
            localStorage.setItem("tickets", JSON.stringify(tickets))
        }

        const agregarTicket = (tickets, titulo, prioridad) => {
            //Aqui se determina el id siuiente
            const nuevoId = Math.max(0, ...tickets.map(ticket => ticket.id)) + 1

            const nuevoTicket = {
                id: nuevoId,
                titulo: titulo,
                estado: "abierto",
                prioridad: prioridad,
                fecha: new Date().toLocaleDateString("es-MX")
            }

            const nuevoListado = [...tickets, nuevoTicket]

            return nuevoListado;
        }

        const eliminarTicket = (tickets, id) => {
            return tickets.filter(ticket => ticket.id !== id)
        }

        const actualizarEstado = (tickets, id, estado) => {
            const ticketActualizado = tickets.map(ticket => {
                if(ticket.id === id){
                    return{...ticket, estado: estado}
                }
                return ticket
            })
            return ticketActualizado
        }
        
        const resumenTickets = (tickets) => {
            const total = tickets.length
            const abiertos = tickets.filter(ticket => ticket.estado === "abierto").length
            const cerrados = tickets.filter(ticket => ticket.estado === "cerrado").length
            const alta = tickets.filter(ticket => ticket.prioridad === "alta").length
            const media = tickets.filter(ticket => ticket.prioridad === "media").length
            const baja = tickets.filter(ticket => ticket.prioridad === "baja").length
            
            return {
                total: total,
                abiertos: abiertos,
                cerrados: cerrados,
                porPrioridad: {
                    alta: alta,
                    media: media,
                    baja: baja
                }
            }
            
        }

        const mostrarResumen = (tickets) => {
            const resumen = document.getElementById("resumen")
            resumen.innerHTML="";
            const resumenDatos = resumenTickets(tickets)
            resumen.innerHTML += `
            <h2>Resumen General</h2>    
            <p>Abiertos: ${resumenDatos.abiertos}, Cerrados: ${resumenDatos.cerrados}, Total: ${resumenDatos.total}</p>
            <h2>Por prioridad</h2>
            <p>Alta: ${resumenDatos.porPrioridad.alta}, Media: ${resumenDatos.porPrioridad.media}, Baja: ${resumenDatos.porPrioridad.baja}</p>
            `
            guardarTickets();
        }

        let textoBuscado = "";
        let filtroActual = "todos";
        let filtroPrioridad = "todos";
        const mostrarTickets = () => {
            const lista = document.getElementById("lista-tickets");
            lista.innerHTML="";

            const ticketsMostrar = filtroActual === "todos"
                ? tickets
                : tickets.filter(ticket => ticket.estado === filtroActual);

            const ticketsPorPrioridad = ticketsMostrar.filter(ticket => 
                filtroPrioridad === "todos" || ticket.prioridad === filtroPrioridad
            );

            const ticketsBuscados = ticketsPorPrioridad.filter(ticket => ticket.titulo.toLowerCase().includes(textoBuscado.toLowerCase()))

            const ordenPrioridad =  {alta: 1, media: 2, baja: 3}

            const ticketsOrdenados = [...ticketsBuscados].sort((a,b) => ordenPrioridad[a.prioridad] -  ordenPrioridad[b.prioridad])

            document.getElementById("contador-resultados").textContent =
            `Mostrando ${ticketsOrdenados.length} de ${tickets.length} tickets`;

            if(ticketsOrdenados.length === 0){
                lista.innerHTML = `<li class="vacio">No hay tickets que mostrar</li>`;
                mostrarResumen();
                return;
            }

            for(let i = 0; i < ticketsOrdenados.length; i++){
                const ticket = ticketsOrdenados[i]
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
                `
            }
            mostrarResumen(tickets)
        }

        document.querySelectorAll(".btn-filtro").forEach(
            boton =>{
                boton.addEventListener("click", () => {
                    filtroActual = boton.dataset.filtro;
                    mostrarTickets()
                })
            }
        )

        document.getElementById("buscador").addEventListener("input", (event) => {
            textoBuscado = event.target.value;
            mostrarTickets()
        })

        document.getElementById("filtro-prioridad").addEventListener("change", (event) => {
            filtroPrioridad = event.target.value;
            mostrarTickets();
        })

        document.getElementById("btn-limpiar").addEventListener("click", () => {
            filtroActual = "todos",
            filtroPrioridad = "todos";
            textoBuscado = "";
            document.getElementById("buscador").value = "";
            document.getElementById("filtro-prioridad").value = "todos";
            mostrarTickets();
        })

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

        document.getElementById("btn-limpiar-cerrados").addEventListener("click", () => {
            const cerrados = tickets.filter(ticket => ticket.estado === "cerrado").length;
            if(cerrados === 0){
                alert("No hay tickets cerrados por eliminar");
                return;
            }
            const confirmar = confirm(`¿Eliminar ${cerrados} tickets(s) cerrado(s)?`);
            if(confirm) {
                tickets = tickets.filter(ticket => ticket.estado !== "cerrado");
                mostrarTickets()
            }
        })

        // Modo oscuro
        document.getElementById("btn-tema").addEventListener("click", () => {
            document.body.classList.toggle("oscuro");
            const tema = document.body.classList.contains("oscuro") ? "oscuro" : "claro";
            localStorage.setItem("tema", tema);
        })

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
        const formulario = document.getElementById("form-ticket")
        //Escuchando el boton
        formulario.addEventListener("submit", (event) => {
            event.preventDefault();
            const titulo = document.getElementById("titulo").value;
            const prioridad = document.getElementById("prioridad").value;
            tickets = agregarTicket(tickets, titulo, prioridad)
            mostrarTickets();
            formulario.reset();
        })

        const lista = document.getElementById("lista-tickets")
        lista.addEventListener("click", (event) => {
            const id = Number(event.target.dataset.id);
        
            if(event.target.classList.contains("btn-eliminar")) {
                const ticket = tickets.find(ticket => ticket.id === id);
                const confirmar = confirm(`¿Eliminar el ticket "${ticket.titulo}"?`);
                if(confirmar) {
                    tickets = eliminarTicket(tickets, id);
                    mostrarTickets();
                }
            }

            if(event.target.classList.contains("btn-estado")){
                const ticket = tickets.find(ticket => ticket.id === id)
                const nuevoEstado = ticket.estado === "abierto" ? "cerrado" : "abierto"
                tickets = actualizarEstado(tickets, id, nuevoEstado);
                mostrarTickets()
            }

            if(event.target.classList.contains("btn-editar")){
                const ticket = tickets.find(ticket => ticket.id === id)
                const nuevoTitulo = prompt("Nuevo titulo", ticket.titulo)
                if(nuevoTitulo && nuevoTitulo.trim() !== ""){
                    tickets = tickets.map(ticket => ticket.id === id ? {...ticket, titulo: nuevoTitulo.trim()}:ticket)
                    mostrarTickets()
                }
            }
        })
        lista.addEventListener("change", (event) => {
            if (event.target.classList.contains("select-prioridad")) {
                const id = Number(event.target.dataset.id);
                const nuevaPrioridad = event.target.value;
                tickets = tickets.map(ticket =>
                ticket.id === id ? { ...ticket, prioridad: nuevaPrioridad } : ticket
                );
                mostrarTickets();
            }
        });
        mostrarTickets()