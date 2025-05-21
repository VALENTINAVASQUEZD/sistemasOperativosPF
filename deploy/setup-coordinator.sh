#!/bin/bash
# Actualiza sistema
sudo apt update && sudo apt install -y curl git build-essential

# Instala Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clona el repo y entra al proyecto
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

# Instala dependencias
npm install

# Crea .env con IPs de nodos
echo '
export NODE_IPS=("172.31.x.x" "172.31.y.y" "172.31.z.z")
' > .env

# Ejecuta coordinador
nohup node scripts/coordinator-app.js > out.log 2>&1 &
