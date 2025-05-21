import io from "socket.io-client"
import type { Process } from "../models/process"

export class SimplifiedClient {
  private socket: any
  private nodeId: string
  private coordinatorUrl: string

  constructor(nodeId: string, coordinatorUrl: string) {
    this.nodeId = nodeId
    this.coordinatorUrl = coordinatorUrl
    this.socket = io(coordinatorUrl)

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.socket.on("connect", () => {
      console.log("Connected to coordinator")
      this.registerNode()
    })

    this.socket.on("disconnect", () => {
      console.log("Disconnected from coordinator")
    })

    this.socket.on("processes", (processes: Process[]) => {
      console.log(`Received ${processes.length} processes`)
      // Aquí procesaríamos los procesos recibidos
      // En un entorno real, ejecutaríamos el algoritmo de planificación

      // Simulamos procesamiento
      setTimeout(() => {
        this.socket.emit("status", this.nodeId, "busy")

        // Simulamos completar los procesos
        setTimeout(() => {
          processes.forEach((process) => {
            // Simular ejecución
            process.startTime = Date.now()
            process.finishTime = process.startTime + process.burstTime * 1000
            process.waitTime = 0
            process.turnaroundTime = process.burstTime

            this.socket.emit("process-completed", this.nodeId, process)
          })

          this.socket.emit("status", this.nodeId, "idle")
        }, 5000)
      }, 1000)
    })
  }

  // Registrar el nodo en el coordinador
  private registerNode() {
    const info = {
      id: this.nodeId,
      ip: "127.0.0.1", // En un entorno real, sería la IP de la instancia EC2
      port: 3001,
      status: "idle",
    }

    this.socket.emit("register", info)
  }

  // Desconectar
  public disconnect() {
    this.socket.disconnect()
  }
}
