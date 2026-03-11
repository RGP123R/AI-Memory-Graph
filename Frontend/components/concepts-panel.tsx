'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConceptsPanelProps {
  concepts: string[]
}

export function ConceptsPanel({ concepts }: ConceptsPanelProps) {
  const colors = [
    'bg-primary/20 text-primary border-primary/30',
    'bg-accent/20 text-accent border-accent/30',
    'bg-secondary/30 text-secondary-foreground border-secondary/40',
    'bg-primary/15 text-primary border-primary/25',
    'bg-accent/15 text-accent border-accent/25',
  ]

  return (
    <Card className="bg-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">✨</span>
          Extracted Concepts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {concepts.map((concept, index) => (
            <div
              key={index}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all hover:shadow-md ${
                colors[index % colors.length]
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {concept}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
