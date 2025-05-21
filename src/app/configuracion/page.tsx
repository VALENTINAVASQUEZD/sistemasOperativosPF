"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

export default function ConfiguracionPage() {
  const router = useRouter()
  const [numNodes, setNumNodes] = useState(3)
  const [algorithm, setAlgorithm] = useState("fcfs")
  const [numProcesses, setNumProcesses] = useState(20)
  const [enableMigration, setEnableMigration] = useState(false)
  const [quantum, setQuantum] = useState(2)

  const handleSubmit = () => {
    const params = new URLSearchParams()
    params.set("nodes", numNodes.toString())
    params.set("algorithm", algorithm)
    params.set("processes", numProcesses.toString())
    params.set("migration", enableMigration.toString())
    params.set("quantum", quantum.toString())

    router.push(`/simulacion?${params.toString()}`)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Configuración de la Simulación</h1>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Parámetros de Simulación</CardTitle>
            <CardDescription>Configura los parámetros para tu experimento de planificación distribuida</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nodes">Número de Nodos (Instancias EC2)</Label>
              <div className="flex items-center gap-4">
                <Slider
                  id="nodes"
                  min={1}
                  max={10}
                  step={1}
                  value={[numNodes]}
                  onValueChange={(value) => setNumNodes(value[0])}
                  className="flex-1"
                />
                <span className="w-8 text-center">{numNodes}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="algorithm">Algoritmo de Planificación</Label>
              <Select value={algorithm} onValueChange={setAlgorithm}>
                <SelectTrigger id="algorithm">
                  <SelectValue placeholder="Selecciona un algoritmo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fcfs">First Come First Served (FCFS)</SelectItem>
                  <SelectItem value="sjn">Shortest Job Next (SJN)</SelectItem>
                  <SelectItem value="rr">Round Robin</SelectItem>
                  <SelectItem value="priority">Prioridad</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {algorithm === "rr" && (
              <div className="space-y-2">
                <Label htmlFor="quantum">Quantum (ms)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="quantum"
                    min={1}
                    max={10}
                    step={1}
                    value={[quantum]}
                    onValueChange={(value) => setQuantum(value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{quantum}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="processes">Número de Procesos</Label>
              <Input
                id="processes"
                type="number"
                min={1}
                max={100}
                value={numProcesses}
                onChange={(e) => setNumProcesses(Number.parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="migration" checked={enableMigration} onCheckedChange={setEnableMigration} />
              <Label htmlFor="migration">Habilitar Migración de Procesos</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Iniciar Simulación</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
