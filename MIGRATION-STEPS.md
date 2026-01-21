# ArduIDE - Instrucciones de Migración

## Archivos Nuevos Creados

### Backend (server/)
- `server/package.json` - Dependencias del backend
- `server/.env.example` - Variables de entorno de ejemplo
- `server/src/index.js` - Entry point del servidor Express
- `server/src/db/connection.js` - Conexión a MariaDB
- `server/src/middleware/auth.js` - Middleware de autenticación JWT
- `server/src/routes/auth.js` - Endpoints de autenticación
- `server/src/routes/projects.js` - CRUD de proyectos
- `server/src/routes/compile.js` - Compilación Arduino
- `server/src/scripts/setup-database.js` - Script para crear tablas

### Frontend (src/)
- `src/lib/api-client.ts` - Cliente API para el nuevo backend
- `src/lib/cloud-storage-new.ts` - Wrapper compatible con el código existente
- `src/hooks/useAuthNew.ts` - Hook de autenticación actualizado

### Documentación
- `DEPLOYMENT.md` - Guía completa de despliegue en Plesk
- `.env.example` - Variables de entorno del frontend

## Pasos para Completar la Migración

### 1. Actualizar Imports en el Código Existente

Reemplaza los imports de Supabase:

```typescript
// ANTES
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/hooks/useAuth';
import { ... } from '@/lib/cloud-storage';

// DESPUÉS
import { useAuth } from '@/hooks/useAuthNew';
import { ... } from '@/lib/cloud-storage-new';
```

### 2. Eliminar Archivos de Supabase (opcional)

Una vez que todo funcione, puedes eliminar:
- `src/integrations/supabase/` (toda la carpeta)
- `supabase/` (toda la carpeta)
- `src/hooks/useAuth.ts` (el viejo)
- `src/lib/cloud-storage.ts` (el viejo)

### 3. Renombrar Archivos Nuevos

```bash
mv src/hooks/useAuthNew.ts src/hooks/useAuth.ts
mv src/lib/cloud-storage-new.ts src/lib/cloud-storage.ts
```

### 4. Actualizar .env

Crea un archivo `.env` en la raíz con:
```
VITE_API_URL=https://tu-dominio.com/api
```

## Configuración en Plesk

1. **Crear Base de Datos MariaDB**
   - En Plesk > Databases > Add Database
   - Nombre: `arduide_db`
   - Usuario: crear uno nuevo con todos los permisos

2. **Configurar Node.js Application**
   - En Plesk > Node.js
   - Application Root: `/server`
   - Application Startup File: `src/index.js`
   - Node.js Version: 18+

3. **Configurar Variables de Entorno**
   - En la sección Node.js de Plesk
   - Añadir todas las variables del `.env.example`

4. **Ejecutar Setup de BD**
   ```bash
   cd server
   npm run setup-db
   ```

5. **Iniciar Aplicación**
   - Usar el botón "Restart" en Plesk
   - O usar PM2 para gestión avanzada

## Verificar que Todo Funciona

1. **Health Check del API**
   ```bash
   curl https://tu-dominio.com/api/health
   ```
   Debe retornar: `{"status":"ok","version":"1.0.0",...}`

2. **Test de Registro**
   - Abrir la app en el navegador
   - Crear una cuenta nueva
   - Verificar que se puede crear/guardar proyectos

3. **Test de Compilación**
   - Crear un proyecto simple
   - Compilar y verificar que genera HEX
