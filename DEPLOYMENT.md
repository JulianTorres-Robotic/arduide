# ArduIDE - Arduino Web IDE

IDE web para programación Arduino usando bloques visuales (Blockly) con compilación real y carga a placas.

## 📁 Estructura del Proyecto

```
├── server/                 # Backend Node.js + MariaDB
│   ├── src/
│   │   ├── index.js       # Entry point del servidor
│   │   ├── db/            # Conexión a base de datos
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API endpoints
│   │   └── scripts/       # Scripts de setup
│   ├── package.json
│   └── .env.example
│
├── src/                    # Frontend React + Vite
│   ├── components/        # Componentes React
│   ├── contexts/          # Context providers
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilidades y API client
│   └── pages/             # Páginas de la app
│
└── docs/                   # Documentación adicional
```

## 🚀 Despliegue en Plesk

### 1. Requisitos del Servidor

- Node.js 18+ 
- MariaDB 10.5+
- Arduino CLI instalado
- Git

### 2. Instalar Arduino CLI en el Servidor

```bash
# Descargar e instalar
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Mover a PATH
sudo mv bin/arduino-cli /usr/local/bin/

# Instalar cores de Arduino
arduino-cli core update-index
arduino-cli core install arduino:avr

# Verificar instalación
arduino-cli version
```

### 3. Configurar Base de Datos MariaDB

1. En Plesk, crea una nueva base de datos MariaDB
2. Anota: host, puerto, usuario, contraseña y nombre de la BD
3. Ejecuta el script de setup (ver sección Backend)

### 4. Desplegar Backend

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/arduide.git
cd arduide/server

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus valores

# Crear tablas en la base de datos
npm run setup-db

# Iniciar servidor (usar PM2 para producción)
npm install -g pm2
pm2 start src/index.js --name arduide-api
pm2 save
```

### 5. Desplegar Frontend

```bash
# En el directorio raíz del proyecto
cd arduide

# Instalar dependencias
npm install

# Configurar URL de la API
cp .env.example .env
nano .env  # Establecer VITE_API_URL

# Build de producción
npm run build

# El contenido de 'dist/' va a la carpeta pública de Plesk
```

### 6. Configurar Plesk

#### Para el Backend (Node.js):
1. Ve a "Hosting Settings" del dominio
2. Habilita "Node.js Support"
3. Configura:
   - Document Root: `/server`
   - Application Startup File: `src/index.js`
   - Application Mode: `production`

#### Para el Frontend:
1. Sube el contenido de `dist/` a la carpeta `httpdocs` (o subdirectorio)
2. Configura un proxy inverso o subdomain para la API

### 7. Configurar Proxy (Nginx)

Si usas Nginx, añade esta configuración para el API:

```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 🔧 Variables de Entorno

### Backend (server/.env)
```env
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=arduide_db
JWT_SECRET=tu-clave-super-secreta-cambiar-en-produccion
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://tu-dominio.com
```

### Frontend (.env)
```env
VITE_API_URL=https://tu-dominio.com/api
```

## 🔐 Seguridad

- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Rate limiting
- ✅ Helmet.js para headers de seguridad
- ✅ Validación de inputs
- ✅ CORS configurado

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/signup` - Crear cuenta
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual
- `PUT /api/auth/profile` - Actualizar perfil
- `POST /api/auth/change-password` - Cambiar contraseña

### Proyectos
- `GET /api/projects` - Listar proyectos
- `GET /api/projects/:id` - Obtener proyecto
- `POST /api/projects` - Crear proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto
- `GET /api/projects/:id/versions` - Historial de versiones

### Compilación
- `GET /api/compile/boards` - Placas disponibles
- `POST /api/compile` - Compilar código
- `POST /api/compile/validate` - Validar código

## 🐛 Troubleshooting

### Error de conexión a MariaDB
- Verificar credenciales en .env
- Verificar que el servicio MariaDB está corriendo
- Verificar permisos del usuario de BD

### Arduino CLI no funciona
- Verificar que está en PATH: `which arduino-cli`
- Verificar cores instalados: `arduino-cli core list`
- Revisar permisos de /tmp para builds

### CORS errors
- Verificar CORS_ORIGIN en .env del backend
- Asegurar que incluye el protocolo (https://)

## 📄 Licencia

MIT License
