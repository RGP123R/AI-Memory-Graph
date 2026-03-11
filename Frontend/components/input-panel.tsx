'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Sparkles, Loader2 } from 'lucide-react'

interface InputPanelProps {
  notes: string
  onNotesChange: (notes: string) => void
  onGenerate: () => void
  isGenerating: boolean
}

const EXAMPLE_TEXT = `Machine Learning is a subset of Artificial Intelligence. Deep Learning uses Neural Networks.`

export function InputPanel({
  notes,
  onNotesChange,
  onGenerate,
  isGenerating,
}: InputPanelProps) {
  return (
    <Card className="h-full flex flex-col bg-card/50 border-border/50 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <span className="text-lg">📝</span>
          Input Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="flex-1 relative">
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={`Paste your notes here. Example: ${EXAMPLE_TEXT}`}
            className="w-full h-full p-4 rounded-lg border border-border/50 bg-secondary/20 text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 border-dashed hover:bg-secondary/30"
          >
            <Upload className="w-4 h-4" />
            Upload .txt or .pdf
          </Button>

          <Button
            onClick={onGenerate}
            disabled={isGenerating || !notes.trim()}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Knowledge Graph
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
