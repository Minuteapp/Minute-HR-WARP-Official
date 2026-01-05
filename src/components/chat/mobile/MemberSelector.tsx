import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, MapPin, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Member {
  id: string;
  name: string;
  initials: string;
  department: string;
  location: string;
  role: string;
  isOnline: boolean;
}

interface MemberSelectorProps {
  selectedMembers: string[];
  onMembersChange: (members: string[]) => void;
  multiSelect?: boolean;
}

export default function MemberSelector({
  selectedMembers,
  onMembersChange,
  multiSelect = true,
}: MemberSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Mitglieder aus der Datenbank laden
  const { data: dbMembers, isLoading } = useQuery({
    queryKey: ['chat-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, department, position, location')
        .eq('status', 'active')
        .order('last_name');
      
      if (error) throw error;
      
      return (data || []).map((emp: any) => ({
        id: emp.id,
        name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
        initials: `${(emp.first_name || 'U')[0]}${(emp.last_name || 'N')[0]}`.toUpperCase(),
        department: emp.department || 'Unbekannt',
        location: emp.location || 'Unbekannt',
        role: emp.position || 'Mitarbeiter',
        isOnline: false // Wird später durch Realtime ergänzt
      }));
    }
  });

  const members: Member[] = dbMembers || [];

  // Extrahiere eindeutige Abteilungen und Standorte
  const departments = Array.from(new Set(members.map(m => m.department))).filter(Boolean);
  const locations = Array.from(new Set(members.map(m => m.location))).filter(Boolean);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || member.department === departmentFilter;
    const matchesLocation =
      locationFilter === "all" || member.location === locationFilter;
    return matchesSearch && matchesDepartment && matchesLocation;
  });

  const toggleMember = (memberId: string) => {
    if (multiSelect) {
      if (selectedMembers.includes(memberId)) {
        onMembersChange(selectedMembers.filter((id) => id !== memberId));
      } else {
        onMembersChange([...selectedMembers, memberId]);
      }
    } else {
      onMembersChange([memberId]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Label>{multiSelect ? "Mitglieder hinzufügen (optional)" : "Person auswählen"}</Label>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label>
        {multiSelect ? "Mitglieder hinzufügen (optional)" : "Person auswählen"}
      </Label>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Nach Namen, E-Mail oder Abteilung suchen"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="flex-1">
            <Briefcase className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Abteilungen</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="flex-1">
            <MapPin className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Standorte</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[200px] border rounded-lg">
        <div className="p-2">
          {filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {members.length === 0 
                  ? "Keine Mitarbeiter gefunden" 
                  : "Keine Treffer für Ihre Suche"}
              </p>
            </div>
          ) : (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer"
                onClick={() => toggleMember(member.id)}
              >
                {multiSelect && (
                  <Checkbox
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                  />
                )}
                <div className="relative">
                  <Avatar className="w-10 h-10 bg-primary/10">
                    <AvatarFallback className="text-primary font-medium">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  {member.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{member.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Briefcase className="w-3 h-3" />
                    <span>{member.department}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3" />
                    <span>{member.location}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {member.role}
                </Badge>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
