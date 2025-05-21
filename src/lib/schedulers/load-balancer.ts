import type { Process } from "../models/process"

export interface Node {
  id: string
  processes: Process[]
  load: number
}

export function createNode(id: string): Node {
  return {
    id,
    processes: [],
    load: 0,
  }
}

export function distributeProcesses(processes: Process[], nodes: Node[]): Node[] {
  // Clonar los nodos para no modificar los originales
  const clonedNodes = nodes.map((node) => ({ ...node, processes: [...node.processes] }))

  // Distribuir procesos equitativamente (round-robin)
  processes.forEach((process, index) => {
    const nodeIndex = index % clonedNodes.length
    const node = clonedNodes[nodeIndex]

    // Asignar proceso al nodo
    const processClone = { ...process }
    processClone.nodeId = node.id
    node.processes.push(processClone)
    node.load += processClone.burstTime
  })

  return clonedNodes
}

export function migrateProcesses(nodes: Node[]): Node[] {
  // Clonar los nodos para no modificar los originales
  const clonedNodes = nodes.map((node) => ({ ...node, processes: [...node.processes] }))

  // Calcular carga promedio
  const totalLoad = clonedNodes.reduce((sum, node) => sum + node.load, 0)
  const averageLoad = totalLoad / clonedNodes.length

  // Identificar nodos sobrecargados y subcargados
  const overloadedNodes = clonedNodes.filter((node) => node.load > averageLoad * 1.2)
  const underloadedNodes = clonedNodes.filter((node) => node.load < averageLoad * 0.8)

  // Migrar procesos de nodos sobrecargados a subcargados
  for (const sourceNode of overloadedNodes) {
    // Mientras el nodo esté sobrecargado y haya nodos subcargados
    while (sourceNode.load > averageLoad * 1.1 && underloadedNodes.length > 0) {
      // Encontrar el nodo menos cargado
      underloadedNodes.sort((a, b) => a.load - b.load)
      const targetNode = underloadedNodes[0]

      // Encontrar un proceso adecuado para migrar (que no haya comenzado)
      const pendingProcesses = sourceNode.processes.filter((p) => p.startTime === undefined)
      if (pendingProcesses.length === 0) break

      // Seleccionar el proceso con mayor tiempo de ráfaga
      pendingProcesses.sort((a, b) => b.burstTime - a.burstTime)
      const processToMigrate = pendingProcesses[0]

      // Migrar el proceso
      const processIndex = sourceNode.processes.findIndex((p) => p.id === processToMigrate.id)
      sourceNode.processes.splice(processIndex, 1)
      sourceNode.load -= processToMigrate.burstTime

      processToMigrate.nodeId = targetNode.id
      targetNode.processes.push(processToMigrate)
      targetNode.load += processToMigrate.burstTime

      // Actualizar estado del nodo destino
      if (targetNode.load >= averageLoad * 0.9) {
        const index = underloadedNodes.findIndex((n) => n.id === targetNode.id)
        underloadedNodes.splice(index, 1)
      }
    }
  }

  return clonedNodes
}
