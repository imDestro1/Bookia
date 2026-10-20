# BOOKIA

Plataforma web que centraliza la información de los libros que ofrecen los establecimientos de Huauchinango, Puebla: qué tienda tiene cada título, a qué precio y si está disponible.

Proyecto de Ingeniería en Sistemas Computacionales, TecNM Instituto Tecnológico Superior de Huauchinango (2026). Las reglas técnicas del proyecto están en la Carta Constitución de Bookia.

## Funciones del MVP

- Búsqueda pública por título o autor, con filtros por género, editorial, establecimiento y rango de precio.
- Ficha de libro con las tiendas que lo venden, precio y cuántos ejemplares tiene cada una.
- Directorio de establecimientos con su catálogo.
- Panel de administración (JWT en cookie httpOnly, rol `admin`) para dar de alta, editar y eliminar libros, establecimientos y ofertas.
- Bitácora de auditoría (`audit_logs`) de todas las operaciones de escritura.

## Stack

- **Frontend**: React + Vite + React Router + Tailwind CSS (`frontend/`)
- **Backend**: Node.js + Express, API REST (`backend/`)
- **Base de datos**: MongoDB con Mongoose
- **Calidad**: ESLint + Prettier, Jest/Supertest (backend), Vitest/Testing Library (frontend), GitHub Actions

El contrato de la API está en [API_CONTRACT.md](API_CONTRACT.md).

## Cómo correrlo en local

Requisitos: Node.js 22 y MongoDB corriendo en tu máquina. Elige una de estas dos opciones para MongoDB:

**Opción A: con Docker (recomendada).** Desde la raíz del repo:

```bash
docker compose up -d      # levanta MongoDB 7 en localhost:27017
```

Los datos se guardan en un volumen de Docker, así que no se pierden al apagar el contenedor. Para detenerlo: `docker compose down`.

**Opción B: MongoDB instalado.** Instala [MongoDB Community Server](https://www.mongodb.com/try/download/community) y asegúrate de que el servicio esté corriendo en el puerto 27017.

En ambos casos la cadena de conexión es `mongodb://127.0.0.1:27017/bookia` (ya viene así en `.env.example`). Puedes ver los datos con [MongoDB Compass](https://www.mongodb.com/products/tools/compass) conectándote a `mongodb://127.0.0.1:27017`.

Después:

```bash
# 1. Backend
cd backend
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

Abre `http://localhost:5173`. El panel de administración está en `http://localhost:5173/admin/login`; entra con el `ADMIN_EMAIL` y `ADMIN_PASSWORD` de tu `.env`.

`npm run seed` borra y vuelve a crear libros, establecimientos y ofertas, así que puedes correrlo cuando quieras regresar a los datos de ejemplo.

### Problemas comunes

- **`MongooseServerSelectionError` / `ECONNREFUSED 127.0.0.1:27017`**: MongoDB no está corriendo. Revisa `docker compose ps` o el servicio de MongoDB.
- **El backend no arranca y pide `JWT_SECRET`**: falta llenar ese valor en `backend/.env`.
- **El login no funciona**: corre `npm run seed` de nuevo después de cambiar `ADMIN_EMAIL` o `ADMIN_PASSWORD`.

## Pruebas

```bash
cd backend && npm run lint && npm test
cd frontend && npm run lint && npm test && npm run build
```

## Datos de ejemplo

Los establecimientos, precios y existencias del seed son ficticios: este MVP es un proyecto académico y no usa datos de comercios reales. Cada oferta indica cuántos ejemplares (`stock`) tiene la tienda; con 0 se muestra como agotado.
