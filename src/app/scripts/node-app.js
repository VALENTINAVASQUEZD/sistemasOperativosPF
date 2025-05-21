// Script simplificado para ejecutar en los nodos
const { SimplifiedClient } = require("../lib/communication/simplified-client")

// Obtener configuración del entorno
const nodeId = process.env.NODE_ID || `node-${Math.floor(Math.random() * 1000)}`
const coordinatorUrl = `http://${process.env.COORDINATOR_IP || "localhost"}:3000`

console.log(`Iniciando nodo ${nodeId}, conectando a ${coordinatorUrl}`)

// Crear cliente
const client = new SimplifiedClient(nodeId, coordinatorUrl)

// Manejar cierre
process.on("SIGINT", () => {
  console.log("Cerrando nodo...")
  client.disconnect()
  process.exit(0)
})

console.log("Nodo iniciado y esperando procesos...")
