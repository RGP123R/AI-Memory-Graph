'use client'

import { Header } from '@/components/header'
import { InputPanel } from '@/components/input-panel'
import { GraphPanel } from '@/components/graph-panel'
import { ConceptsPanel } from '@/components/concepts-panel'
import { useState, useCallback } from 'react'

interface GraphNode {
  id: string
  label: string
}

interface GraphEdge {
  from: string
  to: string
  type?: string
  weight?: number
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export default function Home() {
  const [notes, setNotes] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [concepts, setConcepts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!notes.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-graph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: notes,
          use_semantic: true
        })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'Failed to generate graph')
        return
      }

      // Set concepts from backend
      setConcepts(data.concepts || [])

      // Convert backend graph format to frontend format
      // Backend provides: nodes with id/label, edges with source/target
      // Frontend expects: nodes with id/label, edges with from/to
      const nodes = (data.graph?.nodes || []).map((node: GraphNode, index: number) => ({
        id: String(index + 1),
        label: node.label || node.id,
      }))

      const edges = (data.graph?.edges || []).map((edge: any) => ({
        from: edge.source || edge.from,
        to: edge.target || edge.to,
        type: edge.type,
        weight: edge.weight
      }))

      // Map old labels to new IDs for edges
      const labelToId: Record<string, string> = {}
      ;(data.graph?.nodes || []).forEach((node: GraphNode, index: number) => {
        labelToId[node.label || node.id] = String(index + 1)
      })

      // Update edges to use IDs instead of labels
      const mappedEdges = edges.map((edge: any) => ({
        from: labelToId[edge.from] || edge.from,
        to: labelToId[edge.to] || edge.to,
        type: edge.type,
        weight: edge.weight
      }))

      setGraphData({ nodes, edges: mappedEdges })

    } catch (error) {
      console.error("Error generating graph:", error)
      setError(error instanceof Error ? error.message : 'Failed to connect to server. Make sure the backend is running.')
    } finally {
      setIsGenerating(false)
    }
  }, [notes])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <Header onGenerateGraph={handleGenerate} isGenerating={isGenerating} />
      
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">

          {/* Input Panel */}
          <div className="lg:col-span-1">
            <InputPanel 
              notes={notes}
              onNotesChange={setNotes}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Graph Panel */}
          <div className="lg:col-span-2">
            <GraphPanel 
              graphData={graphData}
              isGenerating={isGenerating}
            />
          </div>

        </div>

        {/* Concepts Panel */}
        {concepts.length > 0 && (
          <ConceptsPanel concepts={concepts} />
        )}

      </div>
    </main>
  )
}

