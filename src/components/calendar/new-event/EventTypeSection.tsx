
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileText, HelpCircle } from "lucide-react";

interface EventTypeSectionProps {
  type: string;
  onTypeChange: (type: string) => void;
}

export default function EventTypeSection({ type, onTypeChange }: EventTypeSectionProps) {
  const isDocumentSupportedType = [
    'interview', 
    'training', 
    'project', 
    'external', 
    'onboarding', 
    'contract'
  ].includes(type);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label htmlFor="type" className="text-sm font-medium">Terminart</label>
        
        {isDocumentSupportedType && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs text-blue-600">
                  <FileText className="h-3.5 w-3.5 mr-0.5" />
                  <span>Dokumente möglich</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Für diesen Termintyp können Dokumente angehängt werden (Bewerbungsunterlagen, Schulungsmaterialien etc.).</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Wählen Sie eine Terminart" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="meeting">Internes Meeting</SelectItem>
          <SelectItem value="external">Meeting mit Externen</SelectItem>
          <SelectItem value="call">Telefonat / Call</SelectItem>
          <SelectItem value="interview">Bewerbungsgespräch</SelectItem>
          <SelectItem value="training">Schulung / Weiterbildung</SelectItem>
          <SelectItem value="project">Projektbesprechung</SelectItem>
          <SelectItem value="onboarding">Onboarding</SelectItem>
          <SelectItem value="contract">Vertragsunterzeichnung</SelectItem>
          <SelectItem value="customer">Kundentermin</SelectItem>
          <SelectItem value="personal">Persönlicher Termin</SelectItem>
          <SelectItem value="other">Sonstiges</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
