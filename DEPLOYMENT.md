# Guía de Despliegue de MotoPrice (Demo en la Nube / VPS)

Esta guía explica cómo desplegar MotoPrice en internet para que el cliente (y los vendedores de mostrador) puedan probar el sistema en vivo desde sus celulares o computadoras del mostrador.

---

## Opción 1: Render (Backend) + Vercel (Frontend) — *Recomendada (100% Gratuita para Demo)*

Esta es la configuración más rápida y limpia, idéntica a los estándares de producción modernos.

### 1. Desplegar el Backend en Render
1. Entrá a [render.com](https://render.com) e iniciá sesión con GitHub.
2. Hacé click en **New +** > **Web Service**.
3. Seleccioná tu repositorio de GitHub: `Serech-dev/motoprice`.
4. Completá los campos:
   - **Name**: `motoprice-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. En **Environment Variables**, agregá:
   - `CORS_ALLOWED_ORIGINS` = `*` (o la URL de tu Vercel una vez creado)
   - `DATABASE_URL` = `sqlite:///./autoparts.db`
6. Click en **Create Web Service**.  
   *Al finalizar el build, Render te dará una URL tipo:* `https://motoprice-api.onrender.com`.

### 2. Desplegar el Frontend en Vercel
1. Entrá a [vercel.com](https://vercel.com) e iniciá sesión con GitHub.
2. Click en **Add New...** > **Project** y seleccioná `motoprice`.
3. Configurá:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click en Edit y seleccioná `frontend`.
4. En **Environment Variables**:
   - `VITE_API_URL` = `https://motoprice-api.onrender.com` *(la URL de tu Render sin barra final)*
5. Click en **Deploy**.
6. ¡Listo! Ya tenés la URL pública para pasarle al cliente (ej: `https://motoprice.vercel.app`).

---

## Opción 2: Despliegue en un VPS Propio (Ubuntu / Debian con Docker)

Si tenés un VPS (DigitalOcean, Hetzner, AWS, etc.):

1. Cloná el repositorio en el servidor:
   ```bash
   git clone git@github.com:Serech-dev/motoprice.git
   cd motoprice
   ```

2. Levantá el contenedor con Docker Compose:
   ```bash
   docker compose up -d --build
   ```

3. El backend quedará corriendo en el puerto `8000` con volumen persistente en `backend_data`.
   Podés apuntar Nginx o Caddy con tu dominio o IP pública y SSL automático.

---

## Credenciales Demo Configuradas para el Cliente

Cuando el cliente o tú abran la URL, la pantalla de inicio tiene dos botones de **1 Toque** para acceder sin tener que tipear:

| Rol | Botón de 1 Toque | Email | Contraseña | Perfil y Permisos |
|---|---|---|---|---|
| **Mostrador** | 🛵 *Acceso Demo (Mostrador)* | `demo@motoprice.com` | `demo123` | Cotizador rápido, búsqueda multitérmino por modelo, botón WhatsApp |
| **Administrador** | ⚙️ *Acceso Administrador* | `admin@motoprice.com` | `admin123` | Control de listas, simulador de márgenes, catálogo y licencias |

---

## Control y Estado de la Licencia
- En la barra superior (`Navbar`), verás el chip **"Prueba: 30d"**.
- Al hacer click, se abre el modal con:
  - Días restantes de la prueba gratuita de 30 días.
  - El abono mensual acordado de **\$30.000 ARS/mes**.
  - Detalle de servicios de mantenimiento incluidos (soporte, actualización de listas mayoristas, respaldo).
