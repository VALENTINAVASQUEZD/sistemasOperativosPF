#!/bin/bash
# Instala dependencias básicas
sudo apt update && sudo apt install -y curl git build-essential

# Instala Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Clona el repo y entra al proyecto
git clone https://github.com/VALENTINAVASQUEZD/sistemasOperativosPF
cd tu-repo

# Instala dependenciass
npm install

# Ejecuta nodo con la IP privada del coordinador
nohup node scripts/node-app.js --coordinator=http://172.31.83.142:3000 > out.log 2>&1 &
