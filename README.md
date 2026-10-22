# BOOKIA

Plataforma web que centraliza la información de los libros que ofrecen los establecimientos de Huauchinango, Puebla: qué tienda tiene cada título, a qué precio y si está disponible.

Proyecto de Ingeniería en Sistemas Computacionales, TecNM Instituto Tecnológico Superior de Huauchinango (2026). Las reglas técnicas del proyecto están en la Carta Constitución de Bookia.

## Funciones del MVP

- Búsqueda pública por título o autor, con filtros por género, editorial, establecimiento y rango de precio.
- Ficha de libro con las tiendas que lo venden, precio y cuántos ejemplares tiene cada una.
- Directorio de establecimientos con su catálogo.
- Panel de administración (JWT en cookie httpOnly, rol `admin`) para dar de alta, editar y eliminar libros, establecimientos y ofertas.
- Bitácora de auditoría (`audit_logs`) de todas las operaciones de escritura.

## Módulos

El repositorio tiene dos módulos independientes, cada uno con su propio `package.json`, pruebas y README:

| Carpeta | Qué es | Tecnología |
| --- | --- | --- |
| [`api/`](api/README.md) | API REST: rutas, controladores, modelos, autenticación, seed y su documentación (contrato, `requests.http`, colección de Postman) | Node.js + Express, MongoDB con Mongoose, Jest/Supertest |
| [`frontend/`](frontend/) | Aplicación web que consume la API | React + Vite + React Router + Tailwind CSS, Vitest/Testing Library |

El frontend solo habla con la API por HTTP (`/api/...`); ninguno importa código del otro, así que la API se puede correr, probar y entregar sola. El contrato entre los dos está en [api/API_CONTRACT.md](api/API_CONTRACT.md).

Calidad en ambos módulos: ESLint + Prettier y GitHub Actions.

## Cómo correrlo en local

Requisitos: Node.js 22 y MongoDB. Instala [MongoDB Community Server](https://www.mongodb.com/try/download/community) y deja el servicio corriendo en el puerto 27017 (o usa MongoDB Atlas y pon su cadena en `MONGODB_URI`).

La cadena de conexión local es `mongodb://127.0.0.1:27017/bookia` (ya viene así en `.env.example`). Puedes ver los datos con [MongoDB Compass](https://www.mongodb.com/products/tools/compass) conectándote a `mongodb://127.0.0.1:27017`.

Después:

```bash
# 1. API
cd api
cp .env.example .env      # en Windows: copy .env.example .env
# Edita .env: pon un JWT_SECRET cualquiera (texto largo) y una ADMIN_PASSWORD
npm install
npm run seed              # crea el admin y los datos de ejemplo
npm run dev               # API en http://localhost:4000

# 2. Frontend (en otra terminal)
cd frontend
npm install
npm run dev               # app en http://localhost:5173
```

Abre `http://localhost:5173`. El panel de administración está en `http://localhost:5173/admin/login`; entra con el `ADMIN_EMAIL` y `ADMIN_PASSWORD` de tu `.env`. Desde la pestaña **Dueños** el admin crea cuentas de dueño de tienda y las asigna a una librería; el dueño entra por el mismo acceso y solo ve **Mi tienda** (los datos y ofertas de su librería). Ojo: `npm run seed` recrea las librerías y borra las cuentas de dueño.

`npm run seed` borra y vuelve a crear libros, establecimientos y ofertas, así que puedes correrlo cuando quieras regresar a los datos de ejemplo.

### Problemas comunes

- **`MongooseServerSelectionError` / `ECONNREFUSED 127.0.0.1:27017`**: MongoDB no está corriendo. Revisa que el servicio de MongoDB esté iniciado.
- **La API no arranca y pide `JWT_SECRET`**: falta llenar ese valor en `api/.env`.
- **El login no funciona**: corre `npm run seed` de nuevo después de cambiar `ADMIN_EMAIL` o `ADMIN_PASSWORD`.

## Pruebas

```bash
cd api && npm run lint && npm test
cd frontend && npm run lint && npm test && npm run build
```

## Datos de ejemplo

Los establecimientos, precios y existencias del seed son ficticios: este MVP es un proyecto académico y no usa datos de comercios reales. Cada oferta indica cuántos ejemplares (`stock`) tiene la tienda; con 0 se muestra como agotado.
