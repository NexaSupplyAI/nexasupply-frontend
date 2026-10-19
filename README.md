# NexaSupply AI Frontend

Aplicación Angular para operar los cinco microservicios reales de NexaSupply AI.

## Requisitos

- Node.js 24.15+ (o Node.js 22.22.3+)
- npm 11+
- Backend local disponible en los puertos 8081–8085

## Ejecutar

Desde la raíz del proyecto, primero inicia el backend:

```bash
DOCKER_CONTEXT=default docker compose up -d
```

Después inicia Angular:

```bash
cd nexasupply-frontend
npm ci
npm start
```

Abre `http://localhost:4200`.

## Microservicios consumidos

| Pantalla | Servicio | URL local |
|---|---|---|
| Inventario | inventory-service | `http://localhost:8081` |
| Pedidos | order-service | `http://localhost:8082` |
| Abastecimiento | supplier-service | `http://localhost:8083` |
| Dashboard y reportes | reporting-service | `http://localhost:8084` |
| Asistente | ai-orchestrator | `http://localhost:8085` |

Las URLs están centralizadas en `src/app/core/api-config.ts`. En `localhost`, Angular consume directamente los puertos 8081–8085. Fuera de local utiliza las rutas same-origin `/backend/*`, atendidas por `server.mjs`, para no exponer los servicios internos al navegador.

## Contenedor y Azure

`Dockerfile` compila Angular y ejecuta el servidor BFF ligero incluido en `server.mjs`. El BFF:

- sirve la SPA y resuelve sus rutas;
- recibe la identidad inyectada por la autenticación de Container Apps;
- asigna roles del lado servidor;
- firma JWT internos de corta duración;
- enruta `/backend/*` hacia los cinco Container Apps;
- protege escrituras mediante `PUBLIC_ORIGIN`.

Variables del contenedor frontend:

```text
INVENTORY_SERVICE_URL
ORDER_SERVICE_URL
SUPPLIER_SERVICE_URL
REPORTING_SERVICE_URL
AI_SERVICE_URL
PUBLIC_ORIGIN
INTERNAL_JWT_SECRET
INTERNAL_JWT_ISSUER
INTERNAL_JWT_AUDIENCE
NEXASUPPLY_DEFAULT_ROLES
NEXASUPPLY_ROLE_BINDINGS
```

`INTERNAL_JWT_SECRET` debe suministrarse como secreto del entorno y nunca incorporarse a la imagen.

## Flujos disponibles

- Productos, categorías, almacenes, saldos, stock bajo, entradas y movimientos.
- Pedidos, líneas, confirmación/reserva, finalización/consumo y cancelación/liberación.
- Proveedores, catálogo por proveedor, órdenes de compra, aprobación, recepciones y posteo a inventario.
- Dashboard consolidado, snapshots y exportaciones a almacenamiento local/Blob.
- Conversaciones, chat Foundry, herramientas ejecutadas y auditoría.
- `X-Correlation-ID` automático en todas las solicitudes.
- El navegador no almacena tokens de las APIs; el BFF intercambia la identidad de Easy Auth por un JWT interno efímero.

Con `FOUNDRY_ENABLED=false`, la pantalla de IA muestra el error 503 controlado del backend sin afectar el resto de la aplicación.

## Verificación

```bash
npm test -- --watch=false
npm run test:server
npm run build
```
