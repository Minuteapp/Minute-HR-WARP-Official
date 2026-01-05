
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { X, Plus, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface BasicInfoSectionProps {
  name: string;
  description: string;
  responsiblePerson: string;
  category?: string;
  tags?: string[];
  onChange: (field: string, value: any) => void;
}

export const BasicInfoSection = ({ 
  name, 
  description, 
  responsiblePerson, 
  category,
  tags = [],
  onChange 
}: BasicInfoSectionProps) => {
  const [newTag, setNewTag] = useState("");
  const [searchResponsible, setSearchResponsible] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Mitarbeiter aus der Datenbank laden
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees-for-responsible'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, position')
        .order('last_name', { ascending: true });
      
      if (error) {
        console.error('Fehler beim Laden der Mitarbeiter:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Gefilterte Mitarbeiter basierend auf der Sucheingabe
  const filteredEmployees = employees?.filter(employee => {
    const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase();
    const email = (employee.email || '').toLowerCase();
    const position = (employee.position || '').toLowerCase();
    const searchTerm = searchResponsible.toLowerCase();
    
    return fullName.includes(searchTerm) || 
           email.includes(searchTerm) || 
           position.includes(searchTerm);
  }) || [];

  // Aktuelle ausgewählte Person finden und anzeigen
  useEffect(() => {
    if (responsiblePerson && employees) {
      const selectedEmployee = employees.find(emp => emp.id === responsiblePerson);
      if (selectedEmployee) {
        setSearchResponsible(`${selectedEmployee.first_name || ''} ${selectedEmployee.last_name || ''}`);
      }
    }
  }, [responsiblePerson, employees]);

  const handleAddTag = () => {
    if (newTag.trim() !== "" && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      onChange('tags', updatedTags);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    onChange('tags', updatedTags);
  };

  const handleSelectEmployee = (employeeId: string, employeeName: string) => {
    onChange('responsiblePerson', employeeId);
    setSearchResponsible(employeeName);
    setShowEmployeeDropdown(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Projektname</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Name des Projekts"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Beschreibung</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Beschreibung des Projekts"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="responsiblePerson">Verantwortliche Person</Label>
        <div className="relative">
          <Input
            id="responsiblePersonSearch"
            value={searchResponsible}
            onChange={(e) => {
              setSearchResponsible(e.target.value);
              setShowEmployeeDropdown(true);
            }}
            onFocus={() => setShowEmployeeDropdown(true)}
            placeholder="Nach verantwortlicher Person suchen..."
            className="pr-10"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
          {showEmployeeDropdown && filteredEmployees.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredEmployees.map((employee) => (
                <div 
                  key={employee.id} 
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectEmployee(
                    employee.id, 
                    `${employee.first_name || ''} ${employee.last_name || ''}`
                  )}
                >
                  <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                  {employee.position && <div className="text-sm text-gray-500">{employee.position}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Projektkategorie</Label>
          <Select 
            value={category} 
            onValueChange={(value) => onChange('category', value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Kategorie auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="it">IT-Projekt</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="construction">Bauprojekt</SelectItem>
              <SelectItem value="research">Forschung & Entwicklung</SelectItem>
              <SelectItem value="internal">Internes Projekt</SelectItem>
              <SelectItem value="other">Sonstiges</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Tag hinzufügen"
            />
            <Button type="button" onClick={handleAddTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
