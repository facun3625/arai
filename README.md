# Araí Yerba Mate - Tienda Oficial

E-commerce premium desarrollado con Next.js, Prisma y Tailwind CSS.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ 
- npm / yarn / pnpm

### Instalación

1. Clona el repositorio:
   ```bash
   git clone [url-del-repo]
   cd arai
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Copia el archivo `.env.example` a `.env` y ajusta los valores necesarios.
   ```bash
   cp .env.example .env
   ```

4. Prepara la base de datos:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🛠️ Tecnologías
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Framer Motion.
- **Estado**: Zustand.
- **Backend**: Next.js API Routes.
- **Base de datos**: Prisma ORM con SQLite (local) / PostgreSQL (recomendado para prod).

## 📁 Estructura del Proyecto
- `src/app`: Páginas y rutas del App Router.
- `src/components`: Componentes reutilizables de UI.
- `src/store`: Gestión de estado global (carrito, auth).
- `prisma`: Esquema de la base de datos y migraciones.
- `public`: Activos estáticos (imágenes, logos).

## 📜 Licencia
Privado - Todos los derechos reservados.
