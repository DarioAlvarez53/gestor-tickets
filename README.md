# Gestor de Tickets

Aplicación fullstack para gestionar tickets de soporte: crear, ver, editar, cerrar y eliminar tickets, con filtros, buscador y resumen.

## Funcionalidades

- CRUD completo de tickets desde la página
- Filtros por estado y prioridad, buscador y contador de resultados
- Resumen general y por prioridad
- Orden por prioridad, fechas de creación, modo oscuro y diseño responsive
- Exportar e importar tickets en JSON
- Registro y login de usuarios, con rutas protegidas por token JWT

## Tecnologías

- Frontend: HTML, CSS y JavaScript
- Backend: Node.js y Express
- Base de datos: SQLite
- Autenticación: bcryptjs y JSON Web Token

## Cómo correrlo

1. Backend: entra a `backend-tickets`, instala dependencias con `npm install` y arranca con `node --experimental-sqlite server.js`. Corre en http://localhost:3000
2. Frontend: abre `index.html` en el navegador
3. Crea una cuenta desde la página y entra con ella
