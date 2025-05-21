import type { Process } from "../models/process"

export function simulateRoundRobin(processes: Process[], quantum: number): Process[] {
  const result: Process[] = []
  const readyQueue: Process[] = []
  const completedProcesses: Process[] = []

  // Clonar los procesos para no modificar los originales
  const clonedProcesses = processes.map((p) => ({ ...p }))

  // Ordenar por tiempo de llegada
  clonedProcesses.sort((a, b) => a.arrivalTime - b.arrivalTime)

  let currentTime = 0

  // Mientras haya procesos pendientes o en la cola de listos
  while (clonedProcesses.length > 0 || readyQueue.length > 0) {
    // Añadir procesos que han llegado a la cola de listos
    while (clonedProcesses.length > 0 && clonedProcesses[0].arrivalTime <= currentTime) {
      const process = clonedProcesses.shift()!
      readyQueue.push(process)
    }

    if (readyQueue.length === 0) {
      // No hay procesos en la cola, avanzar el tiempo
      if (clonedProcesses.length > 0) {
        currentTime = clonedProcesses[0].arrivalTime
      } else {
        break
      }
      continue
    }

    // Obtener el siguiente proceso de la cola
    const currentProcess = readyQueue.shift()!

    // Si es la primera vez que se ejecuta, registrar tiempo de respuesta
    if (currentProcess.startTime === undefined) {
      currentProcess.startTime = currentTime
      currentProcess.responseTime = currentTime - currentProcess.arrivalTime
    }

    // Calcular tiempo de ejecución en este quantum
    const executionTime = Math.min(quantum, currentProcess.remainingTime)

    // Ejecutar el proceso por el quantum o hasta completarse
    currentTime += executionTime
    currentProcess.remainingTime -= executionTime

    // Añadir nuevos procesos que hayan llegado durante la ejecución
    while (clonedProcesses.length > 0 && clonedProcesses[0].arrivalTime <= currentTime) {
      const process = clonedProcesses.shift()!
      readyQueue.push(process)
    }

    // Verificar si el proceso ha terminado
    if (currentProcess.remainingTime === 0) {
      currentProcess.finishTime = currentTime
      currentProcess.turnaroundTime = currentProcess.finishTime - currentProcess.arrivalTime
      currentProcess.waitTime = currentProcess.turnaroundTime - currentProcess.burstTime
      completedProcesses.push(currentProcess)
    } else {
      // Si no ha terminado, volver a la cola
      readyQueue.push(currentProcess)
    }
  }

  return completedProcesses
}
    