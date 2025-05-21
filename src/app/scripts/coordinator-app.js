// Script simplificado para ejecutar en el coordinador
const express = require("express")
const http = require("http")
const next = require("next")
const { SimplifiedServer } = require("../lib/communication/simplified-server")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()
  const httpServer = http.createServer(server)

  // Inicializar servidor de comunicación
  const communicationServer = new SimplifiedServer(httpServer)

  // Exponer el servidor de comunicación para que la aplicación Next.js pueda usarlo
  global.communicationServer = communicationServer

  server.all("*", (req, res) => {
    return handle(req, res)
  })

  const port = process.env.PORT || 3000
  httpServer.listen(port, () => {
    console.log(`> Coordinador listo en http://localhost:${port}`)
  })
})
