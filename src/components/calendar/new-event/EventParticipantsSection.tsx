import { useState, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { Mail } from "lucide-react";

interface EventParticipantsSectionProps {
  participants: string[];
  onAddParticipant: (participant: string) => void;
  onRemoveParticipant: (index: number) => void;
}

interface Employee {
  id: string;
  name: string;
  email: string | null;
}

const EventParticipantsSection = ({
  participants,
  onAddParticipant,
  onRemoveParticipant
}: EventParticipantsSectionProps) => {
  const [participantInput, setParticipantInput] = useState<string>("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mitarbeiter aus der Datenbank laden
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('id, name, email');
          
        if (error) {
          console.error('Fehler beim Laden der Mitarbeiter:', error);
          return;
        }
        
        if (data) {
          setEmployees(data);
        }
      } catch (err) {
        console.error('Fehler beim Laden der Mitarbeiter:', err);
      }
    };
    
    fetchEmployees();
  }, []);

  // Mitarbeiter filtern basierend auf der Eingabe
  useEffect(() => {
    if (participantInput.trim() === '') {
      setFilteredEmployees([]);
      return;
    }
    
    const filtered = employees.filter(emp => 
      emp.name.toLowerCase().includes(participantInput.toLowerCase()) || 
      (emp.email && emp.email.toLowerCase().includes(participantInput.toLowerCase()))
    );
    
    setFilteredEmployees(filtered);
  }, [participantInput, employees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParticipantInput(e.target.value);
    setShowSuggestions(true);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && participantInput.trim()) {
      e.preventDefault();
      
      if (filteredEmployees.length > 0) {
        handleSelectEmployee(filteredEmployees[0]);
      } else {
        handleAddParticipant();
      }
    }
  };

  const handleAddParticipant = () => {
    if (!participantInput.trim()) {
      toast.error("Bitte geben Sie einen Teilnehmernamen ein");
      return;
    }
    
    onAddParticipant(participantInput.trim());
    setParticipantInput("");
    setShowSuggestions(false);
  };

  const handleSelectEmployee = (employee: Employee) => {
    onAddParticipant(employee.name);
    setParticipantInput("");
    setShowSuggestions(false);
    
    // Optional: Erfolgstoast anzeigen, wenn ein Teilnehmer mit E-Mail hinzugefügt wurde
    if (employee.email) {
      toast.success(`${employee.name} wurde eingeladen und erhält eine E-Mail.`);
    }
  };

  return (
    <div>
      <Label htmlFor="participants">Teilnehmer</Label>
      <div className="mt-1 relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              id="participants"
              value={participantInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Name oder E-Mail eingeben und Enter drücken"
              className="w-full"
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => setShowSuggestions(false), 200);
              }}
            />
            
            {showSuggestions && filteredEmployees.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onMouseDown={() => handleSelectEmployee(employee)}
                  >
                    <div className="font-medium">{employee.name}</div>
                    {employee.email && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {employee.email}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {participants && participants.length > 0 ? (
        <div className="mt-2">
          <div className="text-sm font-medium mb-1">Teilnehmerliste:</div>
          <ul className="space-y-1">
            {participants.map((participant, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                <span>{participant}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveParticipant(index)}
                  className="h-7 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  Entfernen
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default EventParticipantsSection;
