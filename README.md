# 🐾 Koto Education — Web App

Webapp completa para Koto Education (Terrassa). Incluye **web pública** de presentación y **panel de administración** privado.

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4 + shadcn/ui**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Recharts** para gráficos
- **date-fns** para fechas

---

## 🚀 Guía de puesta en marcha

### 1. Supabase — Crear proyecto

1. Ve a [supabase.com](https://supabase.com) → **New Project**
2. Ponle nombre: `koto-education`
3. Región: `West EU (Ireland)` o la más cercana

### 2. Supabase — Configurar base de datos

1. Ve a **SQL Editor** en el panel de Supabase
2. Copia y pega todo el contenido de `supabase/migrations/001_initial_schema.sql`
3. Haz clic en **Run**

### 3. Supabase — Auth

1. Ve a **Authentication → Settings**
2. **Site URL**: tu dominio de Vercel (ej: `https://kotoeducation.vercel.app`)
3. **Redirect URLs**: `https://kotoeducation.vercel.app/api/auth/callback` y `http://localhost:3000/api/auth/callback`

### 4. Supabase — Storage

1. Ve a **Storage → New bucket**
2. Nombre: `gallery` · Marcar como **Public bucket**

### 5. Variables de entorno

```bash
cp .env.local.example .env.local
```

Rellena con los valores de **Settings → API** en Supabase.

### 6. Ejecutar

```bash
npm install
npm run dev
```

---

## 🔐 Acceso al panel de administración

Ve a `/login`, introduce tu email → recibirás un magic link → acceso directo.

---

## 🌐 Deploy en Vercel

1. [vercel.com](https://vercel.com) → New Project → importar `xamape-art/kotoeducation`
2. Añadir las 3 variables de entorno de Supabase
3. Deploy
4. Actualizar la URL en Supabase Authentication Settings

---

> Original README below:

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
