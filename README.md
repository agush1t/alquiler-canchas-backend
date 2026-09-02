# Sistema Backend de Alquiler de Canchas

API backend para gestionar **canchas** y **reservas** por franja horaria, con
arquitectura en capas:

```
routes → controllers → services (lógica de negocio) → repositories → dao → models
```

MongoDB Atlas + Mongoose, validación con **Zod**, relaciones por `ObjectId`,
`populate`, una vista con **Handlebars** y actualizaciones en **tiempo real**
con **Socket.io**.

## El corazón del sistema: disponibilidad horaria

A diferencia de un simple contador de "cupos", acá cada cancha tiene un
horario de apertura/cierre y cada reserva ocupa una franja concreta
(`startTime` + `quantity` horas). Antes de confirmar una reserva, el backend:

1. Calcula la franja horaria pedida (`startTime` → `startTime + quantity` horas).
2. Verifica que esa franja esté dentro del horario de funcionamiento de la cancha.
3. Busca todas las reservas activas de esa cancha en esa fecha y chequea que
   **ninguna se superponga** con la franja pedida.
4. Si todo es válido, descuenta... nada — simplemente crea la reserva, porque
   la "disponibilidad" se calcula dinámicamente comparando horarios, no
   restando de un contador.

Esta lógica vive en `src/services/reserva.service.js` (método `createReserva`)
y se apoya en `src/utils/time.js` para las comparaciones de horarios.

## Arquitectura de carpetas

```
src/
  config/        # variables de entorno y conexión a Mongo
  models/        # Cancha, Reserva (Mongoose)
  dao/           # única capa que habla directamente con Mongoose
  repositories/  # intermediario entre negocio y DAO
  services/      # lógica de negocio real (disponibilidad, filtros, eventos)
  controllers/   # reciben req/res, delegan a services/
  validators/    # schemas Zod (se ejecutan antes de tocar la DB)
  middlewares/   # validate.js, errorHandler.js
  routes/        # definición de endpoints
  sockets/       # inicialización y singleton de Socket.io
  utils/time.js  # helpers de horarios (HH:mm, superposición de rangos)
  app.js         # configuración de Express
  server.js      # entry point: conecta DB, levanta HTTP + Socket.io
views/           # plantillas Handlebars
public/          # CSS y JS del cliente (incluye el cliente de Socket.io)
```

## Instalación

```bash
git clone <URL_DE_TU_REPO>
cd alquiler-canchas-backend
npm install
cp .env.example .env
# Editá .env con tu MONGO_URI real de Atlas
npm run dev
```

Servidor en `http://localhost:8080`. Vista en tiempo real en `/canchas`.

## Variables de entorno

Ver `.env.example`. Nunca subas tu `.env` real (ya está en `.gitignore`).

## Endpoints

### Canchas (`/api/canchas`)

| Método | Ruta             | Descripción                                   |
|--------|------------------|-------------------------------------------------|
| GET    | /api/canchas     | Lista con filtros, paginación y orden           |
| GET    | /api/canchas/:id | Obtiene una cancha                              |
| POST   | /api/canchas     | Crea una cancha                                 |
| PUT    | /api/canchas/:id | Actualiza una cancha                            |
| DELETE | /api/canchas/:id | Elimina una cancha                              |

**Query params de `GET /api/canchas`:** `sportType`, `location`, `minPrice`,
`maxPrice`, `isActive` (`true`/`false`), `search`, `page`, `limit`, `sort`
(formato `campo:asc|desc`, ej. `pricePerHour:asc`).

Body para crear una cancha:
```json
{
  "name": "Cancha 1",
  "sportType": "futbol5",
  "location": "Palermo",
  "pricePerHour": 12000,
  "openingHour": 9,
  "closingHour": 23
}
```
`sportType` acepta: `futbol5`, `futbol7`, `futbol11`, `padel`, `tenis`, `basquet`, `voley`.

### Reservas (`/api/reservas`)

| Método | Ruta                                  | Descripción                                  |
|--------|----------------------------------------|-----------------------------------------------|
| GET    | /api/reservas                          | Lista reservas (con `populate` de canchas)    |
| GET    | /api/reservas/:id                      | Obtiene una reserva (con `populate`)          |
| GET    | /api/reservas/disponibilidad/:canchaId?date=YYYY-MM-DD | Franjas ocupadas de una cancha en una fecha |
| POST   | /api/reservas                          | Crea una reserva (valida superposición)       |
| PATCH  | /api/reservas/:id/status               | Cambia el estado de una reserva               |

Body para crear una reserva (las canchas se referencian por `ObjectId` +
`quantity` = horas reservadas; **nunca** se guarda el objeto completo):
```json
{
  "clientName": "Juan Pérez",
  "clientEmail": "juan@mail.com",
  "date": "2026-09-05",
  "startTime": "18:00",
  "canchas": [
    { "cancha": "64f1c2...", "quantity": 2 }
  ],
  "notes": "Cumpleaños, van a ser 10 personas"
}
```

Si esa cancha ya tiene una reserva activa que se superpone con `18:00-20:00`
ese mismo día, la API responde `409 Conflict` con el detalle del conflicto.

## Tiempo real (Socket.io)

La vista `/canchas` escucha (`public/js/canchas.js`):

- `cancha:created` / `cancha:updated` / `cancha:deleted` → actualiza la tabla de canchas
- `reserva:created` → si es de hoy, la agrega a la tabla "Reservas de hoy" sin recargar
- `reserva:statusChanged` → actualiza el estado de una reserva en vivo

Probalo abriendo `/canchas` en dos pestañas: creá una reserva desde Postman
y vas a ver cómo aparece sola en ambas pestañas al instante.

## Validación

Todos los `POST`/`PUT`/`PATCH` pasan por schemas de **Zod**
(`src/validators/`) antes de llegar a la base de datos. Errores devuelven
`400` con el detalle de los campos inválidos; conflictos de horario
devuelven `409`.

## Deploy / Entrega en GitHub

```bash
git init
git add .
git commit -m "Entrega final: alquiler de canchas"
git branch -M main
git remote add origin <URL_DE_TU_REPO_VACIO_EN_GITHUB>
git push -u origin main
```

Verificá con `git status` antes del commit que `.env` y `node_modules/` no
aparezcan en la lista.
