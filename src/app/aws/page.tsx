import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AWSPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Implementación en AWS EC2</h1>

      <Tabs defaultValue="arquitectura" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="arquitectura">Arquitectura</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="scripts">Scripts</TabsTrigger>
        </TabsList>

        <TabsContent value="arquitectura">
          <Card>
            <CardHeader>
              <CardTitle>Arquitectura en AWS</CardTitle>
              <CardDescription>Diseño de la infraestructura en la nube</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <img src="/aws-ec2-multiple-instances.png" alt="Arquitectura AWS" className="w-full rounded-lg mb-4" />

              <h3 className="text-lg font-medium">Componentes</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Instancia Coordinadora:</strong> Una instancia EC2 t2.medium que ejecuta la aplicación web y
                  coordina la simulación.
                </li>
                <li>
                  <strong>Instancias de Procesamiento:</strong> Múltiples instancias EC2 t2.micro que actúan como nodos
                  de procesamiento.
                </li>
                <li>
                  <strong>VPC:</strong> Red virtual privada que conecta todas las instancias.
                </li>
                <li>
                  <strong>Grupo de Seguridad:</strong> Reglas de firewall que permiten la comunicación entre instancias.
                </li>
                <li>
                  <strong>Elastic IP:</strong> Dirección IP estática para acceder a la instancia coordinadora.
                </li>
              </ul>

              <h3 className="text-lg font-medium mt-6">Comunicación</h3>
              <p>
                Las instancias se comunican a través de WebSockets para intercambiar información sobre procesos, estados
                y métricas. La instancia coordinadora expone una API REST para la interfaz web y gestiona la
                distribución de procesos entre los nodos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de AWS</CardTitle>
              <CardDescription>Pasos para configurar la infraestructura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">1. Crear VPC y Subredes</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Crear VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=SimuladorVPC}]'

# Crear subredes
aws ec2 create-subnet --vpc-id vpc-id --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-id --cidr-block 10.0.2.0/24 --availability-zone us-east-1b`}
              </pre>

              <h3 className="text-lg font-medium">2. Configurar Grupo de Seguridad</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Crear grupo de seguridad
aws ec2 create-security-group --group-name SimuladorSG --description "Grupo de seguridad para simulador" --vpc-id vpc-id

# Permitir tráfico SSH
aws ec2 authorize-security-group-ingress --group-id sg-id --protocol tcp --port 22 --cidr 0.0.0.0/0

# Permitir tráfico HTTP/HTTPS
aws ec2 authorize-security-group-ingress --group-id sg-id --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-id --protocol tcp --port 443 --cidr 0.0.0.0/0

# Permitir tráfico de la aplicación
aws ec2 authorize-security-group-ingress --group-id sg-id --protocol tcp --port 3000-3010 --cidr 0.0.0.0/0

# Permitir tráfico interno entre instancias
aws ec2 authorize-security-group-ingress --group-id sg-id --protocol all --source-group sg-id`}
              </pre>

              <h3 className="text-lg font-medium">3. Lanzar Instancias EC2</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Lanzar instancia coordinadora
aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --count 1 --instance-type t2.medium --key-name mi-clave --security-group-ids sg-id --subnet-id subnet-id --user-data file://init-coordinator.sh

# Lanzar instancias de procesamiento
aws ec2 run-instances --image-id ami-0c55b159cbfafe1f0 --count 3 --instance-type t2.micro --key-name mi-clave --security-group-ids sg-id --subnet-id subnet-id --user-data file://init-node.sh

# Asignar etiquetas para identificar las instancias
aws ec2 create-tags --resources i-coordinador-id --tags Key=Role,Value=Coordinator
aws ec2 create-tags --resources i-node1-id i-node2-id i-node3-id --tags Key=Role,Value=ProcessingNode`}
              </pre>

              <h3 className="text-lg font-medium">4. Configurar Elastic IP</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Asignar Elastic IP a la instancia coordinadora
aws ec2 allocate-address
aws ec2 associate-address --instance-id i-coordinador-id --allocation-id eipalloc-id`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scripts">
          <Card>
            <CardHeader>
              <CardTitle>Scripts de Inicialización</CardTitle>
              <CardDescription>Scripts para configurar las instancias EC2</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Script para Instancia Coordinadora</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`#!/bin/bash
# init-coordinator.sh

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Git
sudo apt-get install -y git

# Clonar repositorio
git clone https://github.com/usuario/simulador-planificacion.git /home/ubuntu/simulador
cd /home/ubuntu/simulador

# Instalar dependencias
npm install

# Configurar variables de entorno
cat > .env << EOL
NODE_TYPE=COORDINATOR
PORT=3000
NODE_COUNT=3
EOL

# Instalar PM2 para gestionar el proceso
sudo npm install -g pm2

# Iniciar la aplicación
pm2 start npm --name "coordinator" -- start
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# Configurar Nginx como proxy inverso
sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/default > /dev/null << EOL
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

sudo systemctl restart nginx`}
              </pre>

              <h3 className="text-lg font-medium mt-6">Script para Instancias de Procesamiento</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`#!/bin/bash
# init-node.sh

# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Git
sudo apt-get install -y git

# Clonar repositorio
git clone https://github.com/usuario/simulador-planificacion.git /home/ubuntu/simulador
cd /home/ubuntu/simulador

# Instalar dependencias
npm install

# Obtener IP privada
PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)

# Configurar variables de entorno
cat > .env << EOL
NODE_TYPE=PROCESSING
PORT=3001
NODE_ID=$(hostname)
NODE_IP=$PRIVATE_IP
COORDINATOR_IP=10.0.1.10
EOL

# Instalar PM2 para gestionar el proceso
sudo npm install -g pm2

# Iniciar la aplicación
pm2 start npm --name "processing-node" -- run node
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save`}
              </pre>

              <h3 className="text-lg font-medium mt-6">Script para Recopilar Resultados</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`#!/bin/bash
# collect-results.sh

# Directorio para resultados
mkdir -p /home/ubuntu/resultados

# Obtener IPs de las instancias de procesamiento
NODES=$(aws ec2 describe-instances --filters "Name=tag:Role,Values=ProcessingNode" "Name=instance-state-name,Values=running" --query "Reservations[].Instances[].PrivateIpAddress" --output text)

# Recopilar logs y métricas de cada nodo
for NODE_IP in $NODES; do
  echo "Recopilando datos de $NODE_IP..."
  scp -i ~/.ssh/mi-clave.pem ubuntu@$NODE_IP:/home/ubuntu/simulador/logs/* /home/ubuntu/resultados/
done

# Comprimir resultados
cd /home/ubuntu
tar -czvf resultados.tar.gz resultados/

echo "Resultados recopilados y comprimidos en /home/ubuntu/resultados.tar.gz"`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
