import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useEmployeesList } from '@/hooks/useEmployeesList';
import { Loader2 } from 'lucide-react';

interface UserSelectProps {
  value: any;
  onChange: (user: any) => void;
  placeholder?: string;
}

export function UserSelect({ value, onChange, placeholder = "Benutzer auswählen..." }: UserSelectProps) {
  const { employees, isLoading } = useEmployeesList();

  // Mitarbeiter in das erwartete Format konvertieren
  const users = employees.map(emp => ({
    id: emp.id,
    name: emp.name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
    email: emp.email || '',
    avatar: '',
    first_name: emp.first_name,
    last_name: emp.last_name,
    position: emp.position,
    department: emp.department
  }));

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Select 
      value={value?.id} 
      onValueChange={(userId) => {
        const user = users.find(u => u.id === userId);
        onChange(user || null);
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Laden..." : placeholder}>
          {value && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={value.avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(value.name || `${value.first_name || ''} ${value.last_name || ''}`)}
                </AvatarFallback>
              </Avatar>
              <span>{value.name || `${value.first_name || ''} ${value.last_name || ''}`.trim()}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Laden...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Keine Mitarbeiter gefunden
          </div>
        ) : (
          users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name}</div>
                  {(user.position || user.email) && (
                    <div className="text-xs text-muted-foreground">
                      {user.position || user.email}
                    </div>
                  )}
                </div>
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}