import type http from "http"
import { Server } from "socket.io"
import type { Process } from "../models/process"

// Configuración simplificada para 3 nodos fijos
const FIXED_NODES = [
  { id: "node-1", ip: "NODE1_IP", port: 3001, status: "idle" },
  { id: "node-2", ip: "NODE2_IP", port: 3001, status: "idle" },
  { id: "node-3", ip: "NODE3_IP", port: 3001, status: "idle" },
]

export class SimplifiedServer {
  private io: Server
  private connectedNodes: Map<string, any> = new Map()

  constructor(httpServer: http.Server) {
    this.io = new Server(httpServer, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket) => {
      console.log("New connection:", socket.id)

      // Registrar nodo
      socket.on("register", (info: any) => {
        console.log(`Node registered: ${info.id} (${info.ip}:${info.port})`)
        this.connectedNodes.set(info.id, socket)

        // Notificar a todos los nodos sobre el nuevo nodo
        this.io.emit(
          "node-list",
          FIXED_NODES.map((node) => ({
            ...node,
            status: this.connectedNodes.has(node.id) ? "idle" : "offline",
          })),
        )
      })

      // Actualizar estado del nodo
      socket.on("status", (nodeId: string, status: string) => {
        console.log(`Node ${nodeId} status: ${status}`)
        this.io.emit("node-status-update", nodeId, status)
      })

      // Recibir procesos completados
      socket.on("process-completed", (nodeId: string, process: Process) => {
        console.log(`Process ${process.id} completed on node ${nodeId}`)
        this.io.emit("process-update", nodeId, process)
      })

      // Desconexión
      socket.on("disconnect", () => {
        console.log("Node disconnected:", socket.id)

        // Encontrar y marcar el nodo como offline
        for (const [nodeId, s] of this.connectedNodes.entries()) {
          if (s.id === socket.id) {
            this.connectedNodes.delete(nodeId)
            break
          }
        }

        // Actualizar lista de nodos
        this.io.emit(
          "node-list",
          FIXED_NODES.map((node) => ({
            ...node,
            status: this.connectedNodes.has(node.id) ? "idle" : "offline",
          })),
        )
      })
    })
  }

  // Distribuir procesos a los nodos (simulado para entorno limitado)
  public distributeProcesses(processes: Process[]) {
    // Dividir procesos entre los 3 nodos
    const nodeProcesses: { [key: string]: Process[] } = {
      "node-1": [],
      "node-2": [],
      "node-3": [],
    }

    // Distribuir procesos de forma round-robin
    processes.forEach((process, index) => {
      const nodeId = `node-${(index % 3) + 1}`
      nodeProcesses[nodeId].push({ ...process, nodeId })
    })

    // Enviar procesos a cada nodo
    for (const [nodeId, nodeSocket] of this.connectedNodes.entries()) {
      if (nodeProcesses[nodeId]) {
        console.log(`Sending ${nodeProcesses[nodeId].length} processes to ${nodeId}`)
        nodeSocket.emit("processes", nodeProcesses[nodeId])
      }
    }

    return nodeProcesses
  }

  // Iniciar simulación
  public startSimulation(algorithm: string, quantum?: number) {
    console.log(`Starting simulation with algorithm: ${algorithm}`)
    this.io.emit("start-simulation", { algorithm, quantum })
  }
}
