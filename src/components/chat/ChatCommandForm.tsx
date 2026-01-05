import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'

interface Field {
  id: string
  type: string
  label: Record<string, string>
  required?: boolean
  default?: any
  options?: Array<{ value: string; label: Record<string, string> }>
  accept?: string[]
  multiple?: boolean
  showIf?: Record<string, any>
  prefill?: string
}

interface ChatCommandFormProps {
  fieldsSchema: {
    fields: Field[]
  }
  locale: string
  onChange: (data: Record<string, any>) => void
  disabled?: boolean
}

export const ChatCommandForm = ({ fieldsSchema, locale, onChange, disabled }: ChatCommandFormProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({})

  const fields = fieldsSchema?.fields || []

  // Initialize form with defaults
  useEffect(() => {
    const initialData: Record<string, any> = {}
    fields.forEach(field => {
      if (field.default) {
        initialData[field.id] = field.default === 'today' 
          ? new Date().toISOString().split('T')[0]
          : field.default
      }
    })
    setFormData(initialData)
  }, [])

  useEffect(() => {
    onChange(formData)
  }, [formData, onChange])

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const shouldShowField = (field: Field) => {
    if (!field.showIf) return true
    return Object.entries(field.showIf).every(([key, value]) => formData[key] === value)
  }

  const renderField = (field: Field) => {
    if (!shouldShowField(field)) return null

    const label = field.label[locale] || field.label['de']
    const fieldValue = formData[field.id]

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
            />
          </div>
        )

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
              rows={3}
            />
          </div>
        )

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={disabled}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fieldValue ? format(new Date(fieldValue), 'PPP', { locale: de }) : 'Datum wählen'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fieldValue ? new Date(fieldValue) : undefined}
                  onSelect={(date) => handleFieldChange(field.id, date?.toISOString().split('T')[0])}
                  initialFocus
                  locale={de}
                />
              </PopoverContent>
            </Popover>
          </div>
        )

      case 'datetime':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type="datetime-local"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
            />
          </div>
        )

      case 'time':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type="time"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              disabled={disabled}
              required={field.required}
            />
          </div>
        )

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              value={fieldValue || ''}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value))}
              disabled={disabled}
              required={field.required}
            />
          </div>
        )

      case 'money':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <div className="relative">
              <Input
                id={field.id}
                type="number"
                step="0.01"
                value={fieldValue || ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                disabled={disabled}
                required={field.required}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
            </div>
          </div>
        )

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={fieldValue || field.default}
              onValueChange={(value) => handleFieldChange(field.id, value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label[locale] || option.label['de']}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'boolean':
        return (
          <div key={field.id} className="flex items-center space-x-2 py-2">
            <Checkbox
              id={field.id}
              checked={fieldValue || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              disabled={disabled}
            />
            <Label htmlFor={field.id} className="font-normal cursor-pointer">
              {label}
            </Label>
          </div>
        )

      case 'file':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {label} {field.required && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              accept={field.accept?.join(',')}
              onChange={(e) => handleFieldChange(field.id, e.target.files?.[0])}
              disabled={disabled}
              required={field.required}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {fields.map(field => renderField(field))}
    </div>
  )
}