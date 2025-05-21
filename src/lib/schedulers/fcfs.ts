import type { Process } from "../models/process"

export function simulateFCFS(processes: Process[]): Process[] {
  const result = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime)
  let currentTime = 0

  for (const process of result) {
    // Si el tiempo actual es menor que el tiempo de llegada, avanzar
    if (currentTime < process.arrivalTime) {
      currentTime = process.arrivalTime
    }

    // Calcular métricas
    process.startTime = currentTime
    process.waitTime = currentTime - process.arrivalTime
    process.responseTime = process.waitTime

    // Ejecutar el proceso
    currentTime += process.burstTime
    process.finishTime = currentTime
    process.turnaroundTime = process.finishTime - process.arrivalTime
    process.remainingTime = 0
  }

  return result
}
