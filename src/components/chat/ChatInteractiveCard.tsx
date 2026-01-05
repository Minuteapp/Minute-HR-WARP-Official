import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChatCommandForm } from './ChatCommandForm'
import { CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ChatInteractiveCardProps {
  card: {
    id: string
    card_type: string
    card_data: any
    status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'cancelled'
    submitted_at?: string
  }
  onSubmit?: (cardId: string, formData: Record<string, any>) => Promise<void>
  readOnly?: boolean
}

export const ChatInteractiveCard = ({ card, onSubmit, readOnly }: ChatInteractiveCardProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const { card_data, status } = card
  const locale = card_data.locale || 'de'
  const label = card_data.label?.[locale] || card_data.label?.['de'] || 'Formular'
  const description = card_data.description?.[locale] || card_data.description?.['de']

  const handleSubmit = async () => {
    if (!onSubmit || readOnly || status !== 'pending') return

    setIsSubmitting(true)
    try {
      await onSubmit(card.id, formData)
    } catch (error) {
      console.error('Failed to submit card:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-background/50">
            <Clock className="w-3 h-3 mr-1" />
            Ausstehend
          </Badge>
        )
      case 'submitted':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Eingereicht
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Genehmigt
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Abgelehnt
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-muted">
            Abgebrochen
          </Badge>
        )
    }
  }

  const isPending = status === 'pending' && !readOnly
  const isProcessed = ['submitted', 'approved', 'rejected'].includes(status)

  return (
    <Card className="max-w-2xl border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{label}</CardTitle>
            {description && (
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            )}
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent>
        {isPending ? (
          <ChatCommandForm
            fieldsSchema={card_data.fields_schema}
            locale={locale}
            onChange={setFormData}
            disabled={isSubmitting}
          />
        ) : isProcessed ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Formular wurde eingereicht am {new Date(card.submitted_at || '').toLocaleString('de-DE')}</p>
            {/* Show submitted data */}
            {card_data.submitted_data && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md space-y-1">
                {Object.entries(card_data.submitted_data).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="font-medium">{key}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </CardContent>

      {isPending && (
        <CardFooter className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* Cancel logic */}}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(formData).length === 0}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Einreichen
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}