# MotoPrice | Repuestos de Motos
> Dynamic Price Tracker & Fast Counter Quoter (*Casas de Repuestos de Motos y Motopartes*)

Sistema especializado para casas de repuestos de motos diseñado para resolver la pérdida de ventas en mostrador y WhatsApp por falta de precios actualizados o demoras buscando en listas de proveedores.

Incluye **Cotizador Rápido de Mostrador**, matriz de compatibilidad por modelo de moto (*Smash 110, Wave 110, Tornado 250, Titan 150, Rouser NS 200*), botón **Copiar para WhatsApp**, jerarquía de fuentes de precios (🟢 Lista Oficial &gt; 🔵 Ref. MercadoLibre &gt; 🟡 Ajuste Dólar) e ingesta masiva de listas Excel de distribuidores (*W-Standard, Pietcard, Far*).

---

## 🚀 Inicio Rápido Local (Run Scripts)

Puedes iniciar los servicios directamente desde la raíz del proyecto con cualquiera de estos métodos:

### Opción 1: Un solo click (Lanzador Dual)
- Haz doble click en **[`dev.bat`](dev.bat)** (o ejecuta `.\dev.ps1` en PowerShell).
- Esto abrirá automáticamente dos ventanas de consola independientes:
  1. **Consola 1 (Backend)**: Activa `.venv` y arranca FastAPI en `http://127.0.0.1:8000`
  2. **Consola 2 (Frontend)**: Arranca Vite React en `http://localhost:5173`

---

### Opción 2: Consolas Individuales

#### 1. Backend (FastAPI + SQLite/PostgreSQL)
- Doble click en **[`run-backend.bat`](run-backend.bat)** (o ejecuta `.\run-backend.ps1`).
- O manualmente desde la consola:
  ```powershell
  cd backend
  .\.venv\Scripts\Activate.ps1
  python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
  ```
- **API URL**: `http://127.0.0.1:8000`
- **Swagger Docs**: `http://127.0.0.1:8000/docs`

#### 2. Frontend (React + Vite + Tailwind CSS)
- Doble click en **[`run-frontend.bat`](run-frontend.bat)** (o ejecuta `.\run-frontend.ps1`).
- O manualmente desde la consola:
  ```powershell
  cd frontend
  npm run dev
  ```
- **Web App**: `http://localhost:5173`

#### 3. Tests Automatizados
- Haz doble click en **[`run-tests.bat`](run-tests.bat)**.
- O desde la consola:
  ```powershell
  cd backend
  .\.venv\Scripts\python.exe -m pytest tests/ -v
  ```

---

## 🏍️ Funcionalidades del Demo para la Casa de Motos

1. **Cotizador Rápido de Mostrador**:
   - Barra de búsqueda optimizada para mostrador y teléfono móvil.
   - Búsqueda natural por modelo de moto + repuesto (ej: `smash transmision`, `wave bateria`, `tornado pastillas`, `rouser frenos`).
   - Chips rápidos de acceso directo para las motos más vendidas de Argentina.
2. **Botón "Copiar para WhatsApp"**:
   - Con 1 click genera y copia un texto formateado listo para pegar en chats de clientes:
     `🏍️ *Kit Transmisión Gilera Smash 110 (W-Standard 14/36)*: $24.500 contado/transferencia.`
3. **Cascada de Fuentes de Precio**:
   - 🟢 **Lista Oficial Proveedor**: Costo neto verificado + margen del comercio (W-Standard, Pietcard).
   - 🔵 **Referencia MercadoLibre**: Precio promedio de la competencia online para no vender por debajo ni quedar fuera de mercado.
   - 🟡 **Ajuste x Dólar**: Ajuste automático si el repuesto está atado a cotización USD o no tiene lista reciente.
4. **Actualizador Masivo de Listas de Distribuidores**:
   - Sube listas de precios de **W-Standard** (.xlsx) y **Pietcard** (.csv).
   - Detecta aumentos abusivos (&gt; 30%) con alertas de seguridad.
   - Permite aplicar aumentos al catálogo con 1 click o exportar lista para sistemas POS.
5. **Simulador de Márgenes en Cascada**:
   - Desglose interactivo: Precio Lista $\rightarrow$ Descuento 1 + Descuento 2 $\rightarrow$ IVA $\rightarrow$ Dólar $\rightarrow$ Margen $\rightarrow$ Redondeo comercial.

---

## 🌐 Despliegue en Producción (Render + Vercel)

Configurado idéntico a `business-manager`:
- **Backend**: Render Web Service (FastAPI + PostgreSQL gestionado).
- **Frontend**: Vercel (React + Vite con `vercel.json` para reescritura de rutas SPA).
