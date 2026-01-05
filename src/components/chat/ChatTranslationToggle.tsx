import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Languages } from 'lucide-react'

interface ChatTranslationToggleProps {
  enabled: boolean
  onToggle: () => void
  sourceLanguage?: string
  targetLanguage?: string
}

export const ChatTranslationToggle = ({ 
  enabled, 
  onToggle,
  sourceLanguage,
  targetLanguage
}: ChatTranslationToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant={enabled ? 'default' : 'ghost'}
        size="sm"
        onClick={onToggle}
        className="shrink-0"
      >
        <Languages className="h-4 w-4 mr-2" />
        {enabled ? 'Auto-Übersetzung aktiv' : 'Übersetzung'}
      </Button>
      
      {enabled && sourceLanguage && targetLanguage && (
        <Badge variant="outline" className="text-xs">
          {sourceLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}
        </Badge>
      )}
    </div>
  )
}