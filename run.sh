#!/bin/bash

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

echo -e "${BLUE}🚀 Iniciando ArduIDE Setup...${NC}"

# 1. Instalar dependencias del Frontend (Raíz)
echo -e "${GREEN}📦 Instalando dependencias del Frontend...${NC}"
npm install

# 2. Instalar dependencias del Backend
echo -e "${GREEN}📦 Instalando dependencias del Backend...${NC}"
cd server && npm install
cd ..

# 3. Verificar archivos .env
if [ ! -f .env ]; then
    echo -e "${BLUE}📄 Creando .env para Frontend desde el ejemplo...${NC}"
    cp .env.example .env 2>/dev/null || echo "VITE_API_URL=http://localhost:3001" > .env
fi

if [ ! -f server/.env ]; then
    echo -e "${BLUE}📄 Creando .env para Backend desde el ejemplo...${NC}"
    cp server/.env.example server/.env 2>/dev/null
fi

# 4. Ejecutar ambos servicios simultáneamente
echo -e "${BLUE}✨ Iniciando Frontend y Backend...${NC}"

# Usamos npx para ejecutar concurrentemente sin instalar paquetes globales
npx concurrently \
  -n "FRONTEND,BACKEND" \
  -c "bgBlue.bold,bgGreen.bold" \
  "npm run dev" \
  "cd server && npm run dev"