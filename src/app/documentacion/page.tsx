import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocumentacionPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Documentación del Simulador</h1>

      <Tabs defaultValue="arquitectura" className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="arquitectura">Arquitectura</TabsTrigger>
          <TabsTrigger value="algoritmos">Algoritmos</TabsTrigger>
          <TabsTrigger value="aws">Implementación AWS</TabsTrigger>
          <TabsTrigger value="codigo">Código</TabsTrigger>
        </TabsList>

        <TabsContent value="arquitectura">
          <Card>
            <CardHeader>
              <CardTitle>Arquitectura del Sistema</CardTitle>
              <CardDescription>Componentes principales del simulador distribuido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Componentes Principales</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Nodo Coordinador:</strong> Instancia EC2 central que gestiona la simulación, distribuye
                  procesos y recopila métricas.
                </li>
                <li>
                  <strong>Nodos de Procesamiento:</strong> Instancias EC2 que simulan CPUs o núcleos, ejecutando los
                  algoritmos de planificación.
                </li>
                <li>
                  <strong>Sistema de Comunicación:</strong> Protocolo basado en WebSockets para la comunicación en
                  tiempo real entre nodos.
                </li>
                <li>
                  <strong>Interfaz de Visualización:</strong> Dashboard web para configurar simulaciones y visualizar
                  resultados.
                </li>
              </ul>

              <h3 className="text-lg font-medium mt-6">Flujo de Trabajo</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>El usuario configura los parámetros de la simulación en el nodo coordinador.</li>
                <li>El coordinador genera procesos con características aleatorias (o predefinidas).</li>
                <li>Los procesos se distribuyen a los nodos de procesamiento según la estrategia configurada.</li>
                <li>Cada nodo ejecuta su cola de procesos utilizando el algoritmo de planificación seleccionado.</li>
                <li>
                  Si la migración está habilitada, los procesos pueden moverse entre nodos para balancear la carga.
                </li>
                <li>El coordinador recopila métricas de rendimiento de todos los nodos.</li>
                <li>Los resultados se visualizan en gráficos comparativos.</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="algoritmos">
          <Card>
            <CardHeader>
              <CardTitle>Algoritmos de Planificación</CardTitle>
              <CardDescription>Detalles de implementación de los algoritmos soportados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">First Come First Served (FCFS)</h3>
                <p className="mt-2">
                  Los procesos se ejecutan en el orden exacto en que llegan a la cola de listos. Es un algoritmo no
                  apropiativo.
                </p>
                <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm overflow-x-auto">
                  {`function fcfs(processes) {
  // Ordenar por tiempo de llegada
  return processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium">Shortest Job Next (SJN)</h3>
                <p className="mt-2">
                  Selecciona el proceso con el menor tiempo de ráfaga. Puede ser apropiativo (SRTF) o no apropiativo.
                </p>
                <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm overflow-x-auto">
                  {`function sjn(processes, currentTime) {
  // Filtrar procesos que ya han llegado
  const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime);
  // Ordenar por tiempo de ráfaga
  return availableProcesses.sort((a, b) => a.burstTime - b.burstTime);
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium">Round Robin</h3>
                <p className="mt-2">
                  Asigna un quantum de tiempo a cada proceso y los ejecuta de forma circular. Es un algoritmo
                  apropiativo.
                </p>
                <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm overflow-x-auto">
                  {`function roundRobin(processes, quantum) {
  let result = [];
  let queue = [...processes];
  
  while (queue.length > 0) {
    const currentProcess = queue.shift();
    
    // Ejecutar por quantum o hasta completar
    const executionTime = Math.min(quantum, currentProcess.remainingTime);
    currentProcess.remainingTime -= executionTime;
    
    result.push({
      id: currentProcess.id,
      executionTime: executionTime
    });
    
    // Si no ha terminado, volver a la cola
    if (currentProcess.remainingTime > 0) {
      queue.push(currentProcess);
    }
  }
  
  return result;
}`}
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium">Prioridad</h3>
                <p className="mt-2">
                  Ejecuta los procesos según su nivel de prioridad. Puede ser apropiativo o no apropiativo.
                </p>
                <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm overflow-x-auto">
                  {`function priority(processes, currentTime) {
  // Filtrar procesos que ya han llegado
  const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime);
  // Ordenar por prioridad (menor número = mayor prioridad)
  return availableProcesses.sort((a, b) => a.priority - b.priority);
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aws">
          <Card>
            <CardHeader>
              <CardTitle>Implementación en AWS EC2</CardTitle>
              <CardDescription>Guía para desplegar el simulador en instancias EC2</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">Requisitos de Infraestructura</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Nodo Coordinador:</strong> 1 instancia t2.medium (2 vCPU, 4 GB RAM)
                </li>
                <li>
                  <strong>Nodos de Procesamiento:</strong> 2-10 instancias t2.micro (1 vCPU, 1 GB RAM)
                </li>
                <li>
                  <strong>Grupo de Seguridad:</strong> Permitir tráfico TCP en puertos 22 (SSH), 80 (HTTP), 443 (HTTPS)
                  y 3000-3010 (aplicación)
                </li>
                <li>
                  <strong>VPC:</strong> Red virtual para comunicación entre instancias
                </li>
              </ul>

              <h3 className="text-lg font-medium mt-6">Pasos de Despliegue</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Crear las instancias EC2 con Amazon Linux 2 o Ubuntu Server.</li>
                <li>Instalar Node.js y npm en todas las instancias.</li>
                <li>Clonar el repositorio del simulador en cada instancia.</li>
                <li>Configurar las variables de entorno con las IPs privadas de todas las instancias.</li>
                <li>Iniciar el servicio coordinador en la instancia principal.</li>
                <li>Iniciar los servicios de nodo en las instancias de procesamiento.</li>
                <li>Acceder a la interfaz web a través de la IP pública del coordinador.</li>
              </ol>

              <h3 className="text-lg font-medium mt-6">Script de Inicialización</h3>
              <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm overflow-x-auto">
                {`#!/bin/bash
# Instalar dependencias
sudo yum update -y
sudo yum install -y nodejs npm git

# Clonar repositorio
git clone https://github.com/usuario/simulador-planificacion.git
cd simulador-planificacion

# Instalar dependencias del proyecto
npm install

# Configurar variables de entorno
echo "NODE_TYPE=COORDINATOR" > .env
echo "PORT=3000" >> .env
echo "NODE_IPS=10.0.1.10,10.0.1.11,10.0.1.12" >> .env

# Iniciar servicio
npm start`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codigo">
          <Card>
            <CardHeader>
              <CardTitle>Estructura del Código</CardTitle>
              <CardDescription>Organización y componentes principales del código fuente</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-x-auto">
                {`simulador-planificacion/
├── coordinator/
│   ├── index.js           # Punto de entrada del coordinador
│   ├── process-generator.js  # Generador de procesos
│   ├── metrics-collector.js  # Recolector de métricas
│   └── load-balancer.js   # Balanceador de carga
├── node/
│   ├── index.js           # Punto de entrada del nodo
│   ├── scheduler.js       # Implementación de algoritmos
│   └── process-queue.js   # Gestión de cola de procesos
├── common/
│   ├── models/
│   │   ├── process.js     # Modelo de proceso
│   │   └── metrics.js     # Modelo de métricas
│   └── communication/
│       ├── socket.js      # Comunicación por WebSockets
│       └── protocol.js    # Protocolo de mensajes
├── frontend/
│   ├── components/        # Componentes React
│   ├── pages/             # Páginas de la aplicación
│   └── charts/            # Visualizaciones y gráficos
├── scripts/
│   ├── setup-aws.sh       # Script de configuración AWS
│   └── deploy.sh          # Script de despliegue
└── package.json           # Dependencias del proyecto`}
              </pre>

              <h3 className="text-lg font-medium mt-6">Componentes Principales</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Coordinador:</strong> Gestiona la simulación global, distribuye procesos y recopila
                  resultados.
                </li>
                <li>
                  <strong>Nodo:</strong> Implementa los algoritmos de planificación y ejecuta procesos.
                </li>
                <li>
                  <strong>Comunicación:</strong> Gestiona el intercambio de mensajes entre nodos.
                </li>
                <li>
                  <strong>Frontend:</strong> Interfaz de usuario para configuración y visualización.
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
