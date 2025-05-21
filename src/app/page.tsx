import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Simulador de Planificación de Procesos Distribuido</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Arquitectura del Sistema</CardTitle>
            <CardDescription>Diseño de alto nivel del simulador distribuido</CardDescription>
          </CardHeader>
          <CardContent>
            <img src="/distributed-architecture-ec2.png" alt="Diagrama de arquitectura" className="w-full rounded-lg mb-4" />
            <p className="text-sm text-gray-600">
              El sistema consta de múltiples instancias EC2 que actúan como nodos de procesamiento, y una instancia
              central que coordina la simulación y visualiza los resultados.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Algoritmos Implementados</CardTitle>
            <CardDescription>Comparación de diferentes estrategias de planificación</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>FCFS (First Come First Served)</strong>: Procesos ejecutados en orden de llegada
              </li>
              <li>
                <strong>SJN (Shortest Job Next)</strong>: Prioriza procesos con menor tiempo de ejecución
              </li>
              <li>
                <strong>Round Robin</strong>: Asigna un quantum de tiempo a cada proceso de forma circular
              </li>
              <li>
                <strong>Prioridad</strong>: Ejecuta procesos según su nivel de prioridad asignado
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold">Comenzar con el Simulador</h2>
        <div className="flex gap-4">
          <Link href="/configuracion">
            <Button size="lg">Configurar Simulación</Button>
          </Link>
          <Link href="/documentacion">
            <Button variant="outline" size="lg">
              Ver Documentación
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
