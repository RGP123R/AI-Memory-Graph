'use client'

import { Button } from '@/components/ui/button'
import { Upload, Sparkles, Loader2 } from 'lucide-react'

interface HeaderProps {
  onGenerateGraph: () => void
  isGenerating: boolean
}

export function Header({ onGenerateGraph, isGenerating }: HeaderProps) {
  return (
    <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="flex items-center justify-between mb-4 lg:mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                AI Memory Graph
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Transform your notes into an intelligent knowledge graph
              </p>
            </div>
          </div>

          <div className="flex gap-2 lg:gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hidden sm:flex"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden lg:inline">Upload File</span>
            </Button>
            <Button
              onClick={onGenerateGraph}
              disabled={isGenerating}
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden lg:inline">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden lg:inline">Generate Graph</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
