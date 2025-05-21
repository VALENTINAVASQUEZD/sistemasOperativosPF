import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function ImplementacionPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Guía de Implementación</h1>

      <Alert className="mb-8">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Nota importante</AlertTitle>
        <AlertDescription>
          Esta guía proporciona instrucciones paso a paso para implementar el simulador en un entorno AWS EC2. Asegúrate
          de tener una cuenta de AWS y los permisos necesarios antes de comenzar.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="requisitos" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
          <TabsTrigger value="instalacion">Instalación</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
          <TabsTrigger value="ejecucion">Ejecución</TabsTrigger>
        </TabsList>

        <TabsContent value="requisitos">
          <Card>
            <CardHeader>
              <CardTitle>Requisitos Previos</CardTitle>
              <CardDescription>Lo que necesitas antes de comenzar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Cuenta de AWS</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Cuenta de AWS activa con acceso a EC2</li>
                <li>Usuario IAM con permisos para crear y gestionar instancias EC2</li>
                <li>Par de claves EC2 para acceso SSH</li>
                <li>Conocimientos básicos de AWS CLI</li>
              </ul>

              <h3 className="text-lg font-medium mt-6">Software Local</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>AWS CLI instalado y configurado</li>
                <li>Cliente SSH</li>
                <li>Git</li>
                <li>Node.js y npm (para desarrollo local)</li>
              </ul>

              <h3 className="text-lg font-medium mt-6">Conocimientos Técnicos</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Fundamentos de sistemas operativos y planificación de procesos</li>
                <li>Conceptos básicos de redes y comunicación entre sistemas</li>
                <li>Experiencia con JavaScript/TypeScript y Node.js</li>
                <li>Familiaridad con WebSockets para comunicación en tiempo real</li>
              </ul>

              <h3 className="text-lg font-medium mt-6">Recursos de AWS Recomendados</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Instancia Coordinadora:</strong> t2.medium (2 vCPU, 4 GB RAM)
                </li>
                <li>
                  <strong>Instancias de Procesamiento:</strong> t2.micro (1 vCPU, 1 GB RAM)
                </li>
                <li>
                  <strong>Almacenamiento:</strong> 8 GB por instancia
                </li>
                <li>
                  <strong>Ancho de Banda:</strong> Moderado (suficiente para comunicación entre instancias)
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instalacion">
          <Card>
            <CardHeader>
              <CardTitle>Instalación del Simulador</CardTitle>
              <CardDescription>Pasos para instalar el simulador en AWS EC2</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">1. Clonar el Repositorio</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Clonar el repositorio en tu máquina local
git clone https://github.com/usuario/simulador-planificacion.git
cd simulador-planificacion

# Revisar la estructura del proyecto
ls -la`}
              </pre>

              <h3 className="text-lg font-medium mt-6">2. Crear Infraestructura en AWS</h3>
              <p>Puedes utilizar la consola de AWS o AWS CLI para crear la infraestructura:</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Crear VPC
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=SimuladorVPC

# Crear Internet Gateway y adjuntarlo a la VPC
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# Crear subredes
SUBNET_ID=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --query 'Subnet.SubnetId' --output text)
aws ec2 create-tags --resources $SUBNET_ID --tags Key=Name,Value=SimuladorSubnet

# Crear tabla de rutas y asociarla a la subred
ROUTE_TABLE_ID=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $ROUTE_TABLE_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --subnet-id $SUBNET_ID --route-table-id $ROUTE_TABLE_ID

# Crear grupo de seguridad
SG_ID=$(aws ec2 create-security-group --group-name SimuladorSG --description "Grupo de seguridad para simulador" --vpc-id $VPC_ID --query 'GroupId' --output text)

# Configurar reglas de seguridad
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 3000-3010 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol all --source-group $SG_ID`}
              </pre>

              <h3 className="text-lg font-medium mt-6">3. Preparar Scripts de Inicialización</h3>
              <p>Crea los scripts de inicialización para las instancias:</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Crear script para el coordinador
cat > init-coordinator.sh << 'EOL'
#!/bin/bash
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
cat > .env << EOF
NODE_TYPE=COORDINATOR
PORT=3000
NODE_COUNT=3
EOF

# Instalar PM2 para gestionar el proceso
sudo npm install -g pm2

# Iniciar la aplicación
pm2 start npm --name "coordinator" -- start
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save

# Configurar Nginx como proxy inverso
sudo apt-get install -y nginx
sudo tee /etc/nginx/sites-available/default > /dev/null << EOF
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
EOF

sudo systemctl restart nginx
EOL

# Crear script para los nodos de procesamiento
cat > init-node.sh << 'EOL'
#!/bin/bash
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
cat > .env << EOF
NODE_TYPE=PROCESSING
PORT=3001
NODE_ID=$(hostname)
NODE_IP=$PRIVATE_IP
COORDINATOR_IP=10.0.1.10
EOF

# Instalar PM2 para gestionar el proceso
sudo npm install -g pm2

# Iniciar la aplicación
pm2 start npm --name "processing-node" -- run node
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
EOL

# Hacer los scripts ejecutables
chmod +x init-coordinator.sh init-node.sh`}
              </pre>

              <h3 className="text-lg font-medium mt-6">4. Lanzar Instancias EC2</h3>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Lanzar instancia coordinadora
COORDINATOR_ID=$(aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --count 1 \
  --instance-type t2.medium \
  --key-name mi-clave \
  --security-group-ids $SG_ID \
  --subnet-id $SUBNET_ID \
  --user-data file://init-coordinator.sh \
  --query 'Instances[0].InstanceId' \
  --output text)

# Etiquetar instancia coordinadora
aws ec2 create-tags --resources $COORDINATOR_ID --tags Key=Name,Value=Coordinator Key=Role,Value=Coordinator

# Asignar IP elástica al coordinador
ELASTIC_IP=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
aws ec2 associate-address --instance-id $COORDINATOR_ID --allocation-id $ELASTIC_IP

# Lanzar instancias de procesamiento
for i in {1..3}; do
  NODE_ID=$(aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --count 1 \
    --instance-type t2.micro \
    --key-name mi-clave \
    --security-group-ids $SG_ID \
    --subnet-id $SUBNET_ID \
    --user-data file://init-node.sh \
    --query 'Instances[0].InstanceId' \
    --output text)
  
  # Etiquetar instancia de procesamiento
  aws ec2 create-tags --resources $NODE_ID --tags Key=Name,Value=ProcessingNode-$i Key=Role,Value=ProcessingNode
done`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Simulador</CardTitle>
              <CardDescription>Ajustes necesarios después de la instalación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">1. Configurar el Coordinador</h3>
              <p>Una vez que las instancias estén en funcionamiento, necesitarás configurar el coordinador:</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Conectarse a la instancia coordinadora
ssh -i mi-clave.pem ubuntu@<IP-PUBLICA-COORDINADOR>

# Verificar que el servicio esté funcionando
pm2 status

# Si es necesario, reiniciar el servicio
pm2 restart coordinator

# Verificar los logs
pm2 logs coordinator`}
              </pre>

              <h3 className="text-lg font-medium mt-6">2. Configurar los Nodos de Procesamiento</h3>
              <p>Para cada nodo de procesamiento, necesitarás actualizar la dirección IP del coordinador:</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# Conectarse a la instancia del nodo
ssh -i mi-clave.pem ubuntu@<IP-PUBLICA-NODO>

# Editar el archivo .env para actualizar la IP del coordinador
cd /home/ubuntu/simulador
nano .env

# Cambiar la línea COORDINATOR_IP=10.0.1.10 por la IP privada real del coordinador
# Guardar y salir (Ctrl+X, Y, Enter)

# Reiniciar el servicio
pm2 restart processing-node

# Verificar los logs
pm2 logs processing-node`}
              </pre>

              <h3 className="text-lg font-medium mt-6">3. Verificar la Comunicación</h3>
              <p>Asegúrate de que los nodos puedan comunicarse con el coordinador:</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# En el coordinador, verificar los logs para confirmar las conexiones
pm2 logs coordinator

# Deberías ver mensajes como:
# "Node registered: Node-1 (10.0.1.11:3001)"
# "Node registered: Node-2 (10.0.1.12:3001)"
# "Node registered: Node-3 (10.0.1.13:3001)"`}
              </pre>

              <h3 className="text-lg font-medium mt-6">4. Configurar Parámetros de Simulación</h3>
              <p>Puedes ajustar los parámetros de simulación en el archivo de configuración:</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# En el coordinador
cd /home/ubuntu/simulador
nano config/simulation.json

# Ejemplo de configuración:
{
  "defaultAlgorithm": "fcfs",
  "defaultQuantum": 2,
  "defaultProcessCount": 20,
  "enableMigration": true,
  "simulationSpeed": 1.0,
  "logLevel": "info"
}

# Guardar y reiniciar el servicio
pm2 restart coordinator`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ejecucion">
          <Card>
            <CardHeader>
              <CardTitle>Ejecución de Simulaciones</CardTitle>
              <CardDescription>Cómo ejecutar y monitorear simulaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">1. Acceder a la Interfaz Web</h3>
              <p>Una vez que todo esté configurado, puedes acceder a la interfaz web del simulador:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Abre un navegador web y navega a la dirección IP pública del coordinador.</li>
                <li>Deberías ver la página principal del simulador.</li>
                <li>Navega a la sección "Configuración" para configurar una simulación.</li>
              </ol>

              <h3 className="text-lg font-medium mt-6">2. Configurar una Simulación</h3>
              <p>En la página de configuración:</p>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Selecciona el número de nodos (debe coincidir con el número de instancias de procesamiento).</li>
                <li>Elige el algoritmo de planificación (FCFS, SJN, Round Robin, Prioridad).</li>
                <li>Configura el número de procesos a simular.</li>
                <li>Decide si deseas habilitar la migración de procesos.</li>
                <li>Si seleccionas Round Robin, configura el quantum de tiempo.</li>
                <li>Haz clic en "Iniciar Simulación".</li>
              </ol>

              <h3 className="text-lg font-medium mt-6">3. Monitorear la Simulación</h3>
              <p>Durante la simulación, puedes monitorear el progreso y los resultados:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>La página de simulación mostrará la distribución de procesos entre nodos.</li>
                <li>Podrás ver métricas en tiempo real como tiempos de espera y utilización de CPU.</li>
                <li>Al finalizar, se mostrarán gráficos comparativos de los diferentes algoritmos.</li>
              </ul>

              <h3 className="text-lg font-medium mt-6">4. Verificar Logs del Sistema</h3>
              <p>Para un análisis más detallado, puedes revisar los logs del sistema:</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# En el coordinador
pm2 logs coordinator

# En los nodos de procesamiento
pm2 logs processing-node

# También puedes guardar los logs en archivos para análisis posterior
pm2 logs coordinator --lines 1000 > coordinator_logs.txt
pm2 logs processing-node --lines 1000 > node_logs.txt`}
              </pre>

              <h3 className="text-lg font-medium mt-6">5. Recopilar Resultados</h3>
              <p>Para recopilar y analizar los resultados de múltiples simulaciones:</p>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`# En el coordinador
cd /home/ubuntu/simulador
mkdir -p resultados

# Copiar los archivos de resultados
cp logs/metrics-*.json resultados/
cp logs/simulation-*.log resultados/

# Comprimir los resultados para descargarlos
tar -czvf resultados.tar.gz resultados/

# En tu máquina local, descargar los resultados
scp -i mi-clave.pem ubuntu@<IP-PUBLICA-COORDINADOR>:/home/ubuntu/simulador/resultados.tar.gz .

# Descomprimir y analizar
tar -xzvf resultados.tar.gz
cd resultados`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
