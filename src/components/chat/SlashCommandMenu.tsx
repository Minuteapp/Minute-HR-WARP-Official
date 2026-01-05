import { useState, useEffect, useRef } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { FileText, CalendarCheck, DollarSign, CheckSquare, Clock, Calendar, Ticket, FileCheck } from 'lucide-react'

interface SlashCommand {
  command_key: string
  command_triggers: string[]
  label: Record<string, string>
  description?: Record<string, string>
  roles_allowed: string[]
}

interface SlashCommandMenuProps {
  commands: SlashCommand[]
  onSelect: (trigger: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  locale?: string
}

const commandIcons: Record<string, any> = {
  'absence.request': CalendarCheck,
  'sickleave.report': FileText,
  'expense.submit': DollarSign,
  'task.create': CheckSquare,
  'timeentry.create': Clock,
  'meeting.create': Calendar,
  'ticket.create': Ticket,
  'approval.list': FileCheck,
}

export const SlashCommandMenu = ({ 
  commands, 
  onSelect, 
  open, 
  onOpenChange,
  locale = 'de' 
}: SlashCommandMenuProps) => {
  const [search, setSearch] = useState('')

  const filteredCommands = commands.filter(cmd => {
    if (!search) return true
    const trigger = cmd.command_triggers[0]
    const label = cmd.label[locale] || cmd.label['de']
    const searchLower = search.toLowerCase()
    return trigger.toLowerCase().includes(searchLower) || label.toLowerCase().includes(searchLower)
  })

  const handleSelect = (trigger: string) => {
    onSelect(trigger)
    onOpenChange(false)
  }

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder="Befehl suchen..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Kein Befehl gefunden</CommandEmpty>
        <CommandGroup heading="Verfügbare Befehle">
          {filteredCommands.map(cmd => {
            const Icon = commandIcons[cmd.command_key] || FileText
            const trigger = cmd.command_triggers[0]
            const label = cmd.label[locale] || cmd.label['de']
            const description = cmd.description?.[locale] || cmd.description?.['de']

            return (
              <CommandItem
                key={cmd.command_key}
                value={trigger}
                onSelect={() => handleSelect(trigger)}
                className="cursor-pointer"
              >
                <Icon className="mr-2 h-4 w-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{trigger}</span>
                    <span className="text-muted-foreground">- {label}</span>
                  </div>
                  {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  )}
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}