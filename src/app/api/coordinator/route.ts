import { type NextRequest, NextResponse } from "next/server"
import { type Process, generateRandomProcesses } from "@/lib/models/process"
import { type Node, createNode, distributeProcesses, migrateProcesses } from "@/lib/schedulers/load-balancer"
import { simulateFCFS } from "@/lib/schedulers/fcfs"
import { simulateSJN } from "@/lib/schedulers/sjn"
import { simulateRoundRobin } from "@/lib/schedulers/round-robin"
import { simulatePriority } from "@/lib/schedulers/priority"
import { calculateMetrics } from "@/lib/metrics/collector"

// Nota: En un entorno real, esto se ejecutaría en el servidor de coordinación
// y utilizaría la clase SocketServer para comunicarse con los nodos

export async function POST(request: NextRequest) {
  const data = await request.json()

  const { action, numNodes = 3, numProcesses = 20, algorithm = "fcfs", enableMigration = false, quantum = 2 } = data

  switch (action) {
    case "initialize": {
      // Generar procesos aleatorios
      const processes = generateRandomProcesses(numProcesses)

      // Crear nodos
      const nodes: Node[] = []
      for (let i = 0; i < numNodes; i++) {
        nodes.push(createNode(`Node-${i + 1}`))
      }

      // Distribuir procesos entre nodos
      let distributedNodes = distributeProcesses([...processes], nodes)

      // Aplicar migración si está habilitada
      if (enableMigration) {
        distributedNodes = migrateProcesses(distributedNodes)
      }

      return NextResponse.json({ processes, nodes: distributedNodes })
    }

    case "simulate": {
      const { processes } = data

      if (!processes || !Array.isArray(processes)) {
        return NextResponse.json({ error: "Invalid processes data" }, { status: 400 })
      }

      // Simular con el algoritmo seleccionado
      let simulatedProcesses: Process[] = []

      switch (algorithm) {
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
        default:
          return NextResponse.json({ error: "Invalid algorithm" }, { status: 400 })
      }

      // Calcular métricas
      const { nodes } = data
      const totalTime = Math.max(...simulatedProcesses.map((p) => p.finishTime || 0))
      const metrics = calculateMetrics(simulatedProcesses, nodes, totalTime)

      return NextResponse.json({ processes: simulatedProcesses, metrics })
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }
}
