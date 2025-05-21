import type { Process } from "../models/process"
import type { Node } from "../schedulers/load-balancer"

export interface Metrics {
  averageWaitTime: number
  averageTurnaroundTime: number
  averageResponseTime: number
  throughput: number
  cpuUtilization: number[]
  loadBalance: number
}

export function calculateMetrics(processes: Process[], nodes: Node[], totalTime: number): Metrics {
  // Calcular tiempos promedio
  const completedProcesses = processes.filter((p) => p.finishTime !== undefined)
  const totalProcesses = completedProcesses.length || 1 // Evitar división por cero

  const totalWaitTime = completedProcesses.reduce((sum, p) => sum + (p.waitTime || 0), 0)
  const totalTurnaroundTime = completedProcesses.reduce((sum, p) => sum + (p.turnaroundTime || 0), 0)
  const totalResponseTime = completedProcesses.reduce((sum, p) => sum + (p.responseTime || 0), 0)

  // Calcular utilización de CPU por nodo
  const cpuUtilization = nodes.map((node) => {
    const nodeProcesses = completedProcesses.filter((p) => p.nodeId === node.id)
    const totalBurstTime = nodeProcesses.reduce((sum, p) => sum + p.burstTime, 0)
    return totalTime > 0 ? totalBurstTime / totalTime : 0
  })

  // Si no hay nodos, crear un valor predeterminado
  if (cpuUtilization.length === 0) {
    cpuUtilization.push(0)
  }

  // Calcular balance de carga (desviación estándar de la carga)
  const loads = nodes.map((node) => node.load)
  const avgLoad = loads.length > 0 ? loads.reduce((sum, load) => sum + load, 0) / loads.length : 0
  const variance =
    loads.length > 0 ? loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length : 0
  const loadBalance = avgLoad > 0 ? Math.sqrt(variance) / avgLoad : 0 // Coeficiente de variación

  return {
    averageWaitTime: totalWaitTime / totalProcesses,
    averageTurnaroundTime: totalTurnaroundTime / totalProcesses,
    averageResponseTime: totalResponseTime / totalProcesses,
    throughput: totalTime > 0 ? totalProcesses / totalTime : 0,
    cpuUtilization,
    loadBalance,
  }
}
