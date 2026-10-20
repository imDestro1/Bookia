# BOOKIA

Plataforma web que centraliza la información de los libros que ofrecen los establecimientos de Huauchinango, Puebla: qué tienda tiene cada título, a qué precio y si está disponible.

Proyecto de Ingeniería en Sistemas Computacionales, TecNM Instituto Tecnológico Superior de Huauchinango (2026). Las reglas técnicas del proyecto están en la Carta Constitución de Bookia.

## Funciones del MVP

- Búsqueda pública por título o autor, con filtros por género, editorial, establecimiento y rango de precio.
- Ficha de libro con las tiendas que lo venden, precio y disponibilidad.
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

Requisitos: Node.js 22 y una base de MongoDB (local o un clúster gratuito de MongoDB Atlas).

```bash
# Backend
cd backend
cp .env.example .env   # llena MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npm run seed           # crea el usuario admin y datos de ejemplo
npm run dev            # http://localhost:4000

# Frontend (otra terminal)
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Entra al panel en `http://localhost:5173/admin/login` con el `ADMIN_EMAIL` y `ADMIN_PASSWORD` del `.env`.

## Pruebas

```bash
cd backend && npm run lint && npm test
cd frontend && npm run lint && npm test && npm run build
```

## Despliegue sugerido

- Base de datos: MongoDB Atlas (capa gratuita).
- Backend: Render o Railway (`npm start`), con las variables de `.env.example` y `NODE_ENV=production`.
- Frontend: Vercel o Netlify (`npm run build`, carpeta `dist`), con `VITE_API_URL` apuntando al backend.

> Si frontend y backend quedan en dominios distintos, la cookie `sameSite: strict` no viaja entre ellos. Lo más simple es servir ambos bajo el mismo dominio (por ejemplo, con un rewrite de `/api` en Vercel/Netlify hacia el backend).

Los establecimientos de los datos de ejemplo son ficticios; se deben reemplazar por los comercios reales que participen.
