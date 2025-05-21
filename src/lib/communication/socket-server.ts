import type { Server as HttpServer } from "http"
import { Server, type Socket } from "socket.io"
import type { Process } from "../models/process"
import type { Node } from "../schedulers/load-balancer"

export interface NodeInfo {
  id: string
  ip: string
  port: number
  status: "idle" | "busy" | "offline"
}

export interface Message {
  type: string
  payload: any
}

export class SocketServer {
  private io: Server
  private connectedNodes: Map<string, Socket> = new Map()
  private nodeInfo: Map<string, NodeInfo> = new Map()

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log("New connection:", socket.id)

      // Registrar nodo
      socket.on("register", (info: NodeInfo) => {
        console.log(`Node registered: ${info.id} (${info.ip}:${info.port})`)
        this.connectedNodes.set(info.id, socket)
        this.nodeInfo.set(info.id, info)

        // Notificar a todos los nodos sobre el nuevo nodo
        this.broadcastNodeList()
      })

      // Actualizar estado del nodo
      socket.on("status", (nodeId: string, status: "idle" | "busy" | "offline") => {
        const info = this.nodeInfo.get(nodeId)
        if (info) {
          info.status = status
          this.nodeInfo.set(nodeId, info)
          this.broadcastNodeList()
        }
      })

      // Recibir procesos completados
      socket.on("process-completed", (nodeId: string, process: Process) => {
        console.log(`Process ${process.id} completed on node ${nodeId}`)
        this.io.emit("process-update", nodeId, process)
      })

      // Recibir métricas
      socket.on("metrics", (nodeId: string, metrics: any) => {
        console.log(`Received metrics from node ${nodeId}`)
        this.io.emit("metrics-update", nodeId, metrics)
      })

      // Desconexión
      socket.on("disconnect", () => {
        console.log("Node disconnected:", socket.id)

        // Encontrar y marcar el nodo como offline
        for (const [nodeId, s] of this.connectedNodes.entries()) {
          if (s.id === socket.id) {
            this.connectedNodes.delete(nodeId)
            const info = this.nodeInfo.get(nodeId)
            if (info) {
              info.status = "offline"
              this.nodeInfo.set(nodeId, info)
            }
            break
          }
        }

        this.broadcastNodeList()
      })
    })
  }

  // Enviar lista de nodos a todos los clientes
  private broadcastNodeList() {
    const nodes = Array.from(this.nodeInfo.values())
    this.io.emit("node-list", nodes)
  }

  // Distribuir procesos a los nodos
  public distributeProcesses(nodes: Node[]) {
    for (const node of nodes) {
      const socket = this.connectedNodes.get(node.id)
      if (socket) {
        console.log(`Sending ${node.processes.length} processes to node ${node.id}`)
        socket.emit("processes", node.processes)
      }
    }
  }

  // Iniciar simulación
  public startSimulation(algorithm: string, quantum?: number) {
    console.log(`Starting simulation with algorithm: ${algorithm}`)
    this.io.emit("start-simulation", { algorithm, quantum })
  }

  // Detener simulación
  public stopSimulation() {
    console.log("Stopping simulation")
    this.io.emit("stop-simulation")
  }

  // Solicitar migración de procesos
  public requestMigration(sourceNodeId: string, targetNodeId: string, processIds: string[]) {
    const sourceSocket = this.connectedNodes.get(sourceNodeId)
    if (sourceSocket) {
      console.log(`Requesting migration of ${processIds.length} processes from ${sourceNodeId} to ${targetNodeId}`)
      sourceSocket.emit("migrate-processes", targetNodeId, processIds)
    }
  }

  // Obtener información de todos los nodos
  public getNodeList(): NodeInfo[] {
    return Array.from(this.nodeInfo.values())
  }

  // Verificar si un nodo está conectado
  public isNodeConnected(nodeId: string): boolean {
    return this.connectedNodes.has(nodeId)
  }
}
