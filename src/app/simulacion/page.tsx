"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Process, generateRandomProcesses } from "@/lib/models/process"
import { type Node, createNode, distributeProcesses, migrateProcesses } from "@/lib/schedulers/load-balancer"
import { simulateFCFS } from "@/lib/schedulers/fcfs"
import { simulateSJN } from "@/lib/schedulers/sjn"
import { simulateRoundRobin } from "@/lib/schedulers/round-robin"
import { simulatePriority } from "@/lib/schedulers/priority"
import { calculateMetrics, type Metrics } from "@/lib/metrics/collector"
import { useRouter, useSearchParams } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function SimulacionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parámetros de la simulación
  const numNodes = Number.parseInt(searchParams.get("nodes") || "3")
  const algorithm = searchParams.get("algorithm") || "fcfs"
  const numProcesses = Number.parseInt(searchParams.get("processes") || "20")
  const enableMigration = searchParams.get("migration") === "true"
  const quantum = Number.parseInt(searchParams.get("quantum") || "2")

  // Estado de la simulación
  const [processes, setProcesses] = useState<Process[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [simulationResults, setSimulationResults] = useState<{ [key: string]: Process[] }>({})
  const [metrics, setMetrics] = useState<{ [key: string]: Metrics }>({})
  const [isSimulating, setIsSimulating] = useState(false)
  const [progress, setProgress] = useState(0)

  // Inicializar la simulación
  useEffect(() => {
    initializeSimulation()
  }, [numNodes, numProcesses])

  const initializeSimulation = () => {
    // Generar procesos aleatorios
    const newProcesses = generateRandomProcesses(numProcesses)
    setProcesses(newProcesses)

    // Crear nodos
    const newNodes: Node[] = []
    for (let i = 0; i < numNodes; i++) {
      newNodes.push(createNode(`Node-${i + 1}`))
    }
    setNodes(newNodes)

    // Reiniciar resultados
    setSimulationResults({})
    setMetrics({})
    setProgress(0)
  }

  const runSimulation = async () => {
    setIsSimulating(true)
    setProgress(0)

    // Distribuir procesos entre nodos
    let distributedNodes = distributeProcesses([...processes], nodes)

    // Aplicar migración si está habilitada
    if (enableMigration) {
      distributedNodes = migrateProcesses(distributedNodes)
    }

    // Actualizar nodos
    setNodes(distributedNodes)

    // Simular cada algoritmo
    const results: { [key: string]: Process[] } = {}
    const metricsResults: { [key: string]: Metrics } = {}

    const algorithms = ["fcfs", "sjn", "rr", "priority"]
    let completedAlgorithms = 0

    for (const alg of algorithms) {
      // Simular con un pequeño retraso para mostrar progreso
      await new Promise((resolve) => setTimeout(resolve, 500))

      let simulatedProcesses: Process[] = []

      // Ejecutar el algoritmo correspondiente
      switch (alg) {
        case "fcfs":
          simulatedProcesses = simulateFCFS([...processes])
          break
        case "sjn":
          simulatedProcesses = simulateSJN([...processes])
          break
        case "rr":
          simulatedProcesses = simulateRoundRobin([...processes], quantum)
          break
        case "priority":
          simulatedProcesses = simulatePriority([...processes])
          break
      }

      results[alg] = simulatedProcesses

      // Calcular métricas
      const totalTime = Math.max(...simulatedProcesses.map((p) => p.finishTime || 0))
      metricsResults[alg] = calculateMetrics(simulatedProcesses, distributedNodes, totalTime)

      // Actualizar progreso
      completedAlgorithms++
      setProgress(Math.floor((completedAlgorithms / algorithms.length) * 100))
    }

    setSimulationResults(results)
    setMetrics(metricsResults)
    setIsSimulating(false)
    setProgress(100)
  }

  const getAlgorithmName = (key: string) => {
    switch (key) {
      case "fcfs":
        return "First Come First Served"
      case "sjn":
        return "Shortest Job Next"
      case "rr":
        return "Round Robin"
      case "priority":
        return "Prioridad"
      default:
        return key
    }
  }

  const getMetricsData = () => {
    return Object.keys(metrics).map((key) => ({
      name: getAlgorithmName(key),
      waitTime: Number(metrics[key].averageWaitTime.toFixed(2)),
      turnaroundTime: Number(metrics[key].averageTurnaroundTime.toFixed(2)),
      responseTime: Number(metrics[key].averageResponseTime.toFixed(2)),
      throughput: Number(metrics[key].throughput.toFixed(4)),
    }))
  }

  const getUtilizationData = () => {
    if (Object.keys(metrics).length === 0) return []

    // Usar el algoritmo seleccionado o el primero disponible
    const selectedMetrics = metrics[algorithm] || metrics[Object.keys(metrics)[0]]

    return selectedMetrics.cpuUtilization.map((util, index) => ({
      name: `Nodo ${index + 1}`,
      utilization: Number((util * 100).toFixed(2)),
    }))
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Simulador de Planificación de Procesos</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Parámetros de la simulación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Nodos:</span>
                <Badge variant="outline">{numNodes}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Algoritmo:</span>
                <Badge variant="outline">{getAlgorithmName(algorithm)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Procesos:</span>
                <Badge variant="outline">{numProcesses}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Migración:</span>
                <Badge variant="outline">{enableMigration ? "Habilitada" : "Deshabilitada"}</Badge>
              </div>
              {algorithm === "rr" && (
                <div className="flex justify-between">
                  <span>Quantum:</span>
                  <Badge variant="outline">{quantum} ms</Badge>
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => router.push("/configuracion")}>
                Cambiar
              </Button>
              <Button className="flex-1" onClick={runSimulation} disabled={isSimulating}>
                {isSimulating ? "Simulando..." : "Ejecutar"}
              </Button>
            </div>

            {isSimulating && (
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center mt-1">{progress}% completado</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Distribución de Procesos</CardTitle>
            <CardDescription>Asignación de procesos a nodos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.map((node) => (
                <div key={node.id} className="border rounded-md p-3">
                  <h3 className="font-medium">{node.id}</h3>
                  <p className="text-sm text-gray-500">Carga: {node.load}</p>
                  <p className="text-sm text-gray-500">Procesos: {node.processes.length}</p>
                  <div className="mt-2 text-xs">
                    {node.processes.slice(0, 5).map((process) => (
                      <Badge key={process.id} variant="secondary" className="mr-1 mb-1">
                        {process.id}
                      </Badge>
                    ))}
                    {node.processes.length > 5 && <Badge variant="outline">+{node.processes.length - 5} más</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {Object.keys(metrics).length > 0 && (
        <Tabs defaultValue="comparacion" className="mb-8">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="comparacion">Comparación de Algoritmos</TabsTrigger>
            <TabsTrigger value="utilizacion">Utilización de CPU</TabsTrigger>
            <TabsTrigger value="procesos">Detalles de Procesos</TabsTrigger>
          </TabsList>

          <TabsContent value="comparacion">
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Algoritmos</CardTitle>
                <CardDescription>Métricas de rendimiento para cada algoritmo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMetricsData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="waitTime" name="Tiempo de Espera" fill="#8884d8" />
                      <Bar dataKey="turnaroundTime" name="Tiempo de Retorno" fill="#82ca9d" />
                      <Bar dataKey="responseTime" name="Tiempo de Respuesta" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Algoritmo</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Tiempo de Espera</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Tiempo de Retorno</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Tiempo de Respuesta</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Throughput</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getMetricsData().map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.name}</td>
                          <td className="px-4 py-2 text-sm">{item.waitTime}</td>
                          <td className="px-4 py-2 text-sm">{item.turnaroundTime}</td>
                          <td className="px-4 py-2 text-sm">{item.responseTime}</td>
                          <td className="px-4 py-2 text-sm">{item.throughput}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilizacion">
            <Card>
              <CardHeader>
                <CardTitle>Utilización de CPU por Nodo</CardTitle>
                <CardDescription>Porcentaje de tiempo que cada nodo estuvo ocupado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getUtilizationData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="utilization" name="Utilización (%)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Balance de Carga</h3>
                  {Object.keys(metrics).map((key) => (
                    <div key={key} className="flex items-center justify-between mb-2">
                      <span>{getAlgorithmName(key)}:</span>
                      <Badge variant={metrics[key].loadBalance < 0.2 ? "success" : "secondary"}>
                        {(metrics[key].loadBalance * 100).toFixed(2)}% de variación
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="procesos">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Procesos</CardTitle>
                <CardDescription>Información detallada de cada proceso</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue={algorithm}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="fcfs">FCFS</TabsTrigger>
                    <TabsTrigger value="sjn">SJN</TabsTrigger>
                    <TabsTrigger value="rr">Round Robin</TabsTrigger>
                    <TabsTrigger value="priority">Prioridad</TabsTrigger>
                  </TabsList>

                  {Object.keys(simulationResults).map((key) => (
                    <TabsContent key={key} value={key}>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead>
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Llegada</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Ráfaga</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Prioridad</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Inicio</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Fin</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Espera</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Retorno</th>
                              <th className="px-4 py-2 text-left text-sm font-medium">Nodo</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {simulationResults[key].map((process) => (
                              <tr key={process.id}>
                                <td className="px-4 py-2 text-sm">{process.id}</td>
                                <td className="px-4 py-2 text-sm">{process.arrivalTime}</td>
                                <td className="px-4 py-2 text-sm">{process.burstTime}</td>
                                <td className="px-4 py-2 text-sm">{process.priority}</td>
                                <td className="px-4 py-2 text-sm">{process.startTime}</td>
                                <td className="px-4 py-2 text-sm">{process.finishTime}</td>
                                <td className="px-4 py-2 text-sm">{process.waitTime}</td>
                                <td className="px-4 py-2 text-sm">{process.turnaroundTime}</td>
                                <td className="px-4 py-2 text-sm">{process.nodeId || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
