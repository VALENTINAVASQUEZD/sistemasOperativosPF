import type { Process } from "../models/process"

export function simulateSJN(processes: Process[]): Process[] {
  const result: Process[] = []
  const pendingProcesses = [...processes]
  let currentTime = 0

  while (pendingProcesses.length > 0) {
    // Filtrar procesos que ya han llegado
    const availableProcesses = pendingProcesses.filter((p) => p.arrivalTime <= currentTime)

    if (availableProcesses.length === 0) {
      // No hay procesos disponibles, avanzar el tiempo hasta el siguiente proceso
      const nextArrival = Math.min(...pendingProcesses.map((p) => p.arrivalTime))
      currentTime = nextArrival
      continue
    }

    // Seleccionar el proceso con menor tiempo de ráfaga
    const shortestJob = availableProcesses.sort((a, b) => a.burstTime - b.burstTime)[0]
    const index = pendingProcesses.findIndex((p) => p.id === shortestJob.id)

    // Eliminar el proceso de la lista de pendientes
    const process = { ...pendingProcesses.splice(index, 1)[0] }

    // Calcular métricas
    process.startTime = currentTime
    process.waitTime = currentTime - process.arrivalTime
    process.responseTime = process.waitTime

    // Ejecutar el proceso
    currentTime += process.burstTime
    process.finishTime = currentTime
    process.turnaroundTime = process.finishTime - process.arrivalTime
    process.remainingTime = 0

    result.push(process)
  }

  return result
}
