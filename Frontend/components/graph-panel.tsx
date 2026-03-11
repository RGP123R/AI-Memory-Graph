'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force'
import { drag } from 'd3-drag'
import { zoom, ZoomBehavior, zoomIdentity } from 'd3-zoom'
import * as d3Selection from 'd3-selection'

interface GraphPanelProps {
  graphData: any
  isGenerating: boolean
}

interface Node extends SimulationNodeDatum {
  id: string
  label: string
  group?: number
}

interface Link extends SimulationLinkDatum<Node> {
  source: string | Node
  target: string | Node
  type?: string
  weight?: number
}

export function GraphPanel({ graphData, isGenerating }: GraphPanelProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const simulationRef = useRef<ReturnType<typeof forceSimulation<Node, Link>> | null>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const nodesRef = useRef<Node[]>([])
  const linksRef = useRef<Link[]>([])
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 600
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Initialize and update simulation
  useEffect(() => {
    if (!graphData || !svgRef.current) return

    const svg = d3Selection.select(svgRef.current)
    
    // Clear previous content
    svg.selectAll('*').remove()

    // Convert data to proper format
    const nodes: Node[] = graphData.nodes.map((node: any, index: number) => ({
      id: node.id,
      label: node.label,
      x: dimensions.width / 2 + (Math.random() - 0.5) * 100,
      y: dimensions.height / 2 + (Math.random() - 0.5) * 100,
      group: index
    }))

    const links: Link[] = graphData.edges
      .filter((edge: any) => {
        const sourceExists = nodes.some((n: Node) => n.id === edge.from)
        const targetExists = nodes.some((n: Node) => n.id === edge.to)
        return sourceExists && targetExists
      })
      .map((edge: any) => ({
        source: edge.from,
        target: edge.to,
        type: edge.type,
        weight: edge.weight || 0.5
      }))

    nodesRef.current = nodes
    linksRef.current = links

    // Create container group for zoom/pan
    const g = svg.append('g').attr('class', 'graph-container')

    // Add zoom behavior
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString())
      })

    zoomBehaviorRef.current = zoomBehavior
    svg.call(zoomBehavior)

    // Create force simulation
    const simulation = forceSimulation<Node>(nodes)
      .force('link', forceLink<Node, Link>(links)
        .id((d: Node) => d.id)
        .distance(100)
        .strength((d: Link) => d.weight || 0.5))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', forceCollide().radius(50))

    simulationRef.current = simulation

    // Draw edges
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'rgba(100, 50, 200, 0.3)')
      .attr('stroke-width', (d: Link) => Math.max(1, (d.weight || 0.5) * 3))
      .attr('stroke-dasharray', (d: Link) => d.type === 'SIMILAR' ? '5,5' : 'none')

    // Draw edge labels
    const linkLabel = g.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(links.filter((d: Link) => d.type && d.type !== 'RELATED'))
      .join('text')
      .attr('font-size', '10px')
      .attr('fill', 'rgba(100, 50, 200, 0.6)')
      .attr('text-anchor', 'middle')
      .text((d: Link) => d.type || '')

    // Define node groups
    const nodeGroup = g.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, Node>('g')
      .data(nodes)
      .join('g')
      .call(drag<SVGGElement, Node>()
        .on('start', (event: any, d: Node) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event: any, d: Node) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event: any, d: Node) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }) as any)

    // Draw node circles
    const colors = [
      '#6432C8',
      '#9650DC',
      '#7846D2',
      '#B464E6',
      '#8C46D8',
    ]

    nodeGroup.append('circle')
      .attr('r', 30)
      .attr('fill', (d: Node, i: number) => colors[i % colors.length])
      .attr('stroke', 'rgba(255,255,255,0.8)')
      .attr('stroke-width', 2)
      .attr('cursor', 'grab')
      .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))')

    // Draw node labels
    nodeGroup.append('text')
      .text((d: Node) => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('pointer-events', 'none')
      .each(function(d: Node) {
        const text = d.label
        const words = text.split(' ')
        if (words.length > 1) {
          d3Selection.select(this).selectAll('tspan')
            .data(words)
            .join('tspan')
            .attr('x', 0)
            .attr('dy', (w: string, i: number) => i === 0 ? '-0.3em' : '1.1em')
            .attr('font-size', '10px')
            .text((w: string) => w)
        }
      })

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: Link) => (d.source as Node).x!)
        .attr('y1', (d: Link) => (d.source as Node).y!)
        .attr('x2', (d: Link) => (d.target as Node).x!)
        .attr('y2', (d: Link) => (d.target as Node).y!)

      linkLabel
        .attr('x', (d: Link) => ((d.source as Node).x! + (d.target as Node).x!) / 2)
        .attr('y', (d: Link) => ((d.source as Node).y! + (d.target as Node).y!) / 2)

      nodeGroup.attr('transform', (d: Node) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [graphData, dimensions])

  const handleZoomIn = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3Selection.select(svgRef.current)
      // Use setTimeout to avoid issues with d3 types
      setTimeout(() => {
        (svg as any).call(zoomBehaviorRef.current!.scaleBy, 1.3)
      }, 0)
    }
  }

  const handleZoomOut = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3Selection.select(svgRef.current)
      setTimeout(() => {
        (svg as any).call(zoomBehaviorRef.current!.scaleBy, 0.7)
      }, 0)
    }
  }

  const handleReset = () => {
    if (svgRef.current && zoomBehaviorRef.current) {
      const svg = d3Selection.select(svgRef.current)
      setTimeout(() => {
        (svg as any).call(zoomBehaviorRef.current!.transform, zoomIdentity)
      }, 0)
    }
  }

  const handleFit = () => {
    if (!graphData || !svgRef.current || !zoomBehaviorRef.current) return
    
    const svg = d3Selection.select(svgRef.current)
    const nodes = nodesRef.current
    
    if (nodes.length === 0) return

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    nodes.forEach(n => {
      if (n.x !== undefined && n.y !== undefined) {
        minX = Math.min(minX, n.x - 50)
        minY = Math.min(minY, n.y - 50)
        maxX = Math.max(maxX, n.x + 50)
        maxY = Math.max(maxY, n.y + 50)
      }
    })

    const boundsWidth = maxX - minX
    const boundsHeight = maxY - minY
    const boundsCenterX = (minX + maxX) / 2
    const boundsCenterY = (minY + maxY) / 2

    const fullWidth = dimensions.width
    const fullHeight = dimensions.height

    const scale = Math.min(
      0.9 / Math.max(boundsWidth / fullWidth, boundsHeight / fullHeight),
      2
    )

    const translate = [
      fullWidth / 2 - scale * boundsCenterX,
      fullHeight / 2 - scale * boundsCenterY
    ]

    setTimeout(() => {
      (svg as any).call(
        zoomBehaviorRef.current!.transform,
        zoomIdentity.translate(translate[0], translate[1]).scale(scale)
      )
    }, 0)
  }

  return (
    <Card className="h-full bg-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            Knowledge Graph Visualization
          </div>
          {graphData && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleFit}
                className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
                title="Fit to View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded hover:bg-secondary/50 transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent 
        ref={containerRef}
        className="flex-1 flex items-center justify-center bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg overflow-hidden relative"
      >
        {isGenerating ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Building your knowledge graph...</p>
          </div>
        ) : graphData ? (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Your knowledge graph will appear here
            </p>
            <p className="text-xs text-muted-foreground">
              Enter notes and click Generate to visualize relationships
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

