export interface Process {
  id: string
  arrivalTime: number
  burstTime: number
  remainingTime: number
  priority: number
  nodeId?: string
  startTime?: number
  finishTime?: number
  waitTime?: number
  turnaroundTime?: number
  responseTime?: number
}

export function createProcess(id: string, arrivalTime: number, burstTime: number, priority: number): Process {
  return {
    id,
    arrivalTime,
    burstTime,
    remainingTime: burstTime,
    priority,
  }
}

export function generateRandomProcesses(count: number): Process[] {
  const processes: Process[] = []

  for (let i = 0; i < count; i++) {
    const id = `P${i + 1}`
    const arrivalTime = Math.floor(Math.random() * 20) // Llegada entre 0 y 19
    const burstTime = Math.floor(Math.random() * 10) + 1 // Ráfaga entre 1 y 10
    const priority = Math.floor(Math.random() * 10) + 1 // Prioridad entre 1 y 10

    processes.push(createProcess(id, arrivalTime, burstTime, priority))
  }

  return processes
}
