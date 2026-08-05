# Mi app 💻 (Backend)

Backend para gestionar usuarios con autenticación JWT, control de acceso por roles y conexión a MongoDB. Permite crear, listar, actualizar y eliminar usuarios, hacer login para obtener un token de acceso, e incluye protecciones de seguridad (rate limiting, fuerza bruta y logging de eventos sospechosos).

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| [Node.js](https://nodejs.org/) | Entorno de ejecución |
| [Express 5](https://expressjs.com/) | Framework del servidor HTTP |
| [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Base de datos y modelado de datos |
| [JWT (jsonwebtoken)](https://www.npmjs.com/package/jsonwebtoken) | Autenticación basada en tokens |
| [bcryptjs](https://www.npmjs.com/package/bcryptjs) | Hasheo de contraseñas |
| [Joi](https://joi.dev/) | Validación de datos de entrada |
| [dotenv](https://www.npmjs.com/package/dotenv) | Variables de entorno |
| [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) | Rate limit global de la API |
| [rate-limiter-flexible](https://www.npmjs.com/package/rate-limiter-flexible) | Protección de fuerza bruta en el login |
| [cors](https://www.npmjs.com/package/cors) | Control de orígenes permitidos |

---

## Requisitos

- Node.js 18 o superior
- MongoDB activo (local o remoto)

## Instalación

1. Clonar el repositorio.
2. Instalar dependencias:

```bash
npm install
```

3. Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=7000
MONGO_URI=mongodb://127.0.0.1:27017/crud-user-back-s6
JWT_SECRET=mi_super_secreto
JWT_EXPIRES_IN=1h
FRONTEND_URLS=http://localhost:5173

# Rate limit global
RATE_LIMIT_WINDOW_MINUTES=15
RATE_LIMIT_MAX_REQUESTS=100

# Protección de fuerza bruta (login)
LOGIN_WINDOW_MINUTES=15
LOGIN_MAX_ATTEMPS=5
LOGIN_BLOCK_MINUTES=30
```

> Las 5 primeras variables son obligatorias: si falta alguna, `src/config/env.js` corta la ejecución al arrancar. Las de rate limit / fuerza bruta son opcionales (tienen valores por defecto si no se definen).

## Ejecutar el proyecto

```bash
npm run dev
```

La API queda disponible en `http://localhost:7000` (o el puerto que definas en `PORT`).

---

## Arquitectura de carpetas

```
Curso_FullStack/
├── package.json
├── scripts/
│   └── test.security.js       # Script para probar rate limit / fuerza bruta
└── src/
    ├── app.js                 # Punto de entrada: arma Express, conecta middlewares y rutas
    │
    ├── config/
    │   ├── env.js              # Carga y valida las variables de entorno
    │   ├── db.js                # Conexión a MongoDB con Mongoose
    │   └── cors.js               # Whitelist de orígenes permitidos (FRONTEND_URLS)
    │
    ├── routes/
    │   ├── auth.routes.js       # POST /auth/login
    │   └── user.routes.js       # GET / POST / PUT / DELETE de /users
    │
    ├── controllers/
    │   ├── auth.controller.js   # Recibe el request de login y llama al service
    │   └── user.controller.js   # Valida con Joi y llama a los services de usuarios
    │
    ├── services/
    │   ├── auth.service.js       # Lógica de login: valida password y firma el JWT
    │   └── user.service.js        # Lógica de negocio: permisos por rol, alta, baja y modificación
    │
    ├── models/
    │   ├── user.model.js          # Esquema de Usuario
    │   ├── securityLog.model.js    # Esquema de eventos de seguridad
    │   └── audit.model.js          # Esquema de auditoría de usuarios eliminados
    │
    ├── middlewares/
    │   ├── auth.middlewares.js       # Verifica el JWT y agrega req.user
    │   ├── role.middlewares.js        # Verifica que req.user.role esté permitido
    │   ├── ratelimit.middlewares.js     # Rate limit global + logging en SecurityLog
    │   └── bruteForce.middlewares.js    # Rate limit de intentos de login (IP + email)
    │
    ├── dto/
    │   └── user.dto.js             # Schemas de Joi: creación, actualización y params (id)
    │
    └── helper/
        └── response.helper.js       # successResponse / errorResponse / forbiddenResponse
```

---

## Autenticación

El login (`POST /auth/login`) devuelve un JWT y el rol del usuario. Para los endpoints protegidos hay que enviar:

```http
Authorization: Bearer <token>
```

`authMiddleware` decodifica el token y agrega `req.user = { userId, role }`. Si no hay token o es inválido, responde `401`.

---

## Roles y permisos

Roles disponibles: **ROOT**, **ADMIN**, **USER**, **GUEST**.

### GET /users (listar)

Requiere token. El comportamiento cambia según el rol de quien pregunta (`req.user.role`), resuelto en `getUsersService`:

| Rol | Sin filtros (`GET /users`) | Con `?id=` o `?email=` |
|---|---|---|
| **ROOT** | Ve a todos los usuarios | Ve a cualquier usuario |
| **ADMIN** | Ve a todos menos los ROOT | Puede ver a cualquiera, salvo un ROOT (403) |
| **USER** | Ve solo usuarios con rol `USER` o `GUEST` | Solo puede verse a sí mismo, aunque el id/email pertenezca a otro (403) |
| **GUEST** | Ve únicamente su propio usuario | Solo puede verse a sí mismo (403 en cualquier otro caso) |

> Antes, la ruta `GET /users` no exigía token. Ahora requiere `authMiddleware` + `authorizeRoles("ROOT","ADMIN","USER","GUEST")`, y la lógica de qué ve cada rol vive en el service, no en el middleware.

### POST /users (crear)

- Requiere token **y** rol `ROOT` o `ADMIN` (antes era público).
- Valida el body contra `createUserSchema` (Joi).
- Si el email ya existe, responde `409`.
- Hashea la contraseña con bcrypt antes de guardar.

### PUT /users/:id (actualizar)

- Requiere token y rol `ROOT` o `ADMIN`.
- El `email` **no se puede modificar**: si viene en el body, responde `400`.
- Solo se actualizan los campos enviados (`allowedFields`), incluyendo `role` si se manda.
- Si viene `password`, se vuelve a hashear.

### DELETE /users/:id (eliminar)

- Requiere token y rol `ROOT` o `ADMIN`.
- Antes de borrar, guarda una copia completa del usuario en la colección `Audit` (`usuarioEliminado` + `fechaEliminacion`), dentro de una transacción de Mongoose (`session.withTransaction`) para que el borrado y el registro de auditoría se hagan de forma atómica.

---

## Protección de seguridad

### Rate limit global

`src/middlewares/ratelimit.middlewares.js` limita la cantidad de requests por IP en una ventana de tiempo (configurable con `RATE_LIMIT_WINDOW_MINUTES` / `RATE_LIMIT_MAX_REQUESTS`). Al excederse, responde `429` y guarda un evento `rate_limit` en `SecurityLog`.

### Fuerza bruta en login

`src/middlewares/bruteForce.middlewares.js` usa `rate-limiter-flexible` con una clave `IP + email` para limitar intentos fallidos de login (`LOGIN_MAX_ATTEMPS` intentos cada `LOGIN_WINDOW_MINUTES` minutos, bloqueo de `LOGIN_BLOCK_MINUTES` minutos). Al superarse, responde `429` y guarda un evento `brute_force` en `SecurityLog`.

### Registro de eventos (`SecurityLog`)

Cada evento de seguridad guarda: `eventType` (`rate_limit`, `brute_force` o `suspicious_request`), `ip`, `method`, `path`, `userAgent`, `userEmail`, `userId` (opcional) y `details`.

### Probar la seguridad

```bash
npm run test:security
```

> El script `scripts/test.security.js` está pensado para disparar múltiples requests contra login y verificar que el rate limit responda `429`. Actualmente es solo el esqueleto — falta completar la lógica de las peticiones de prueba.

---

## Endpoints

### 1) Login

- **POST** `/auth/login` — no requiere token.

```bash
curl -X POST http://localhost:7000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"123456"}'
```

Respuesta:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login Exitoso",
  "data": { "token": "<jwt_token>", "role": "ADMIN" }
}
```

### 2) Listar usuarios

- **GET** `/users` — requiere token. Permisos según rol (ver tabla más arriba).
- Query params opcionales: `id`, `email`.

```bash
curl http://localhost:7000/users -H "Authorization: Bearer <token>"
```

### 3) Crear usuario

- **POST** `/users` — requiere token, rol `ROOT` o `ADMIN`.

Campos obligatorios: `nombre`, `apellido`, `email`, `password`, `fechaNacimiento`, `edad`, `genero`, `telefono`, `direccion`, `localidad`, `provincia`, `pais`, `codigoPostal`. `role` es opcional (Joi valida que sea uno de los 4 roles).

```bash
curl -X POST http://localhost:7000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "nombre": "Nicolás", "apellido": "Frugoni", "email": "nicolas@example.com",
    "password": "123456", "fechaNacimiento": "2000-01-01", "edad": 25,
    "genero": "Masculino", "telefono": "1122334455", "direccion": "Av. Siempre Viva 123",
    "localidad": "Córdoba", "provincia": "Córdoba", "pais": "Argentina",
    "codigoPostal": "5000", "role": "USER"
  }'
```

### 4) Actualizar usuario

- **PUT** `/users/:id` — requiere token, rol `ROOT` o `ADMIN`. El `email` no puede modificarse. Debe enviarse al menos un campo.

```bash
curl -X PUT http://localhost:7000/users/64f0c5d4f2b4d4a5c6e7f8a9 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "nombre": "Nicolás Actualizado", "edad": 26 }'
```

### 5) Eliminar usuario

- **DELETE** `/users/:id` — requiere token, rol `ROOT` o `ADMIN`. Guarda auditoría antes de borrar.

```bash
curl -X DELETE http://localhost:7000/users/64f0c5d4f2b4d4a5c6e7f8a9 \
  -H "Authorization: Bearer <token>"
```

---

## Formato de respuesta

Todas las respuestas siguen el mismo formato (`src/helper/response.helper.js`):

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { }
}
```

En errores, `success: false` y opcionalmente `errors` con el detalle de validación de Joi.

## Códigos de respuesta comunes

- `200` operación exitosa · `201` usuario creado · `400` validación / datos inválidos
- `401` token faltante o inválido · `403` acceso denegado por rol · `404` no encontrado
- `409` usuario ya existe · `429` demasiadas solicitudes (rate limit o fuerza bruta)

## Recomendación para probar en Postman / Thunder Client

1. `POST /auth/login` con un usuario existente.
2. Copiar el `token` recibido.
3. En los endpoints protegidos, agregar el header `Authorization: Bearer <token>`.
4. Para `POST`, `PUT` y `DELETE`, usar un usuario con rol `ROOT` o `ADMIN`.

---

## Autor: Zupel Joaquin

