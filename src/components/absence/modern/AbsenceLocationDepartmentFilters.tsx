import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Building2 } from 'lucide-react';

export const AbsenceLocationDepartmentFilters: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select defaultValue="all-locations">
        <SelectTrigger className="w-full sm:w-[200px]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Standort wählen" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-locations">Alle Standorte</SelectItem>
          <SelectItem value="berlin">Berlin</SelectItem>
          <SelectItem value="munich">München</SelectItem>
          <SelectItem value="hamburg">Hamburg</SelectItem>
          <SelectItem value="frankfurt">Frankfurt</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all-departments">
        <SelectTrigger className="w-full sm:w-[200px]">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Abteilung wählen" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-departments">Alle Abteilungen</SelectItem>
          <SelectItem value="development">Entwicklung</SelectItem>
          <SelectItem value="sales">Vertrieb</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="hr">Personal</SelectItem>
          <SelectItem value="finance">Finanzen</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
