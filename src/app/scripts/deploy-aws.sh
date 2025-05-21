#!/bin/bash

# Script para desplegar el simulador en AWS EC2
# Uso: ./deploy-aws.sh <coordinator-ip> <node1-ip> <node2-ip> <node3-ip>

if [ $# -ne 4 ]; then
  echo "Uso: $0 <coordinator-ip> <node1-ip> <node2-ip> <node3-ip>"
  exit 1
fi

COORDINATOR_IP=$1
NODE1_IP=$2
NODE2_IP=$3
NODE3_IP=$4

# Crear script para el coordinador
cat > setup-coordinator.sh << EOL
#!/bin/bash

# Actualizar el sistema
sudo yum update -y || sudo apt update -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo yum install -y nodejs || sudo apt install -y nodejs

# Instalar Git
sudo yum install -y git || sudo apt install -y git

# Clonar el repositorio (reemplaza con tu repositorio)
git clone https://github.com/tu-usuario/distributed-scheduler.git /home/ec2-user/app
cd /home/ec2-user/app

# Configurar nodos
sed -i "s/NODE1_IP/$NODE1_IP/g" lib/communication/simplified-server.ts
sed -i "s/NODE2_IP/$NODE2_IP/g" lib/communication/simplified-server.ts
sed -i "s/NODE3_IP/$NODE3_IP/g" lib/communication/simplified-server.ts

# Crear archivo de configuración
cat > .env << EOF
NODE_TYPE=COORDINATOR
PORT=3000
NODE_COUNT=3
EOF

# Instalar dependencias y construir
npm install
npm run build

# Iniciar la aplicación
npm install -g pm2
pm2 start npm --name "coordinator" -- start
pm2 save
pm2 startup
EOL

# Crear script para los nodos
cat > setup-node.sh << EOL
#!/bin/bash

# Actualizar el sistema
sudo yum update -y || sudo apt update -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo yum install -y nodejs || sudo apt install -y nodejs

# Instalar Git
sudo yum install -y git || sudo apt install -y git

# Clonar el repositorio (reemplaza con tu repositorio)
git clone https://github.com/tu-usuario/distributed-scheduler.git /home/ec2-user/app
cd /home/ec2-user/app

# Obtener IP privada
PRIVATE_IP=\$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)
NODE_ID=\$(hostname)

# Crear archivo de configuración
cat > .env << EOF
NODE_TYPE=PROCESSING
PORT=3001
NODE_ID=\$NODE_ID
NODE_IP=\$PRIVATE_IP
COORDINATOR_IP=$COORDINATOR_IP
EOF

# Instalar dependencias y construir
npm install
npm run build

# Iniciar la aplicación
npm install -g pm2
pm2 start npm --name "node" -- run node
pm2 save
pm2 startup
EOL

# Hacer los scripts ejecutables
chmod +x setup-coordinator.sh setup-node.sh

echo "Scripts generados. Ahora debes copiarlos a las instancias EC2 y ejecutarlos."
echo "Para el coordinador:"
echo "scp -i tu-clave.pem setup-coordinator.sh ec2-user@$COORDINATOR_IP:~/"
echo "ssh -i tu-clave.pem ec2-user@$COORDINATOR_IP 'bash ~/setup-coordinator.sh'"

echo "Para el nodo 1:"
echo "scp -i tu-clave.pem setup-node.sh ec2-user@$NODE1_IP:~/"
echo "ssh -i tu-clave.pem ec2-user@$NODE1_IP 'bash ~/setup-node.sh'"

echo "Para el nodo 2:"
echo "scp -i tu-clave.pem setup-node.sh ec2-user@$NODE2_IP:~/"
echo "ssh -i tu-clave.pem ec2-user@$NODE2_IP 'bash ~/setup-node.sh'"

echo "Para el nodo 3:"
echo "scp -i tu-clave.pem setup-node.sh ec2-user@$NODE3_IP:~/"
echo "ssh -i tu-clave.pem ec2-user@$NODE3_IP 'bash ~/setup-node.sh'"
