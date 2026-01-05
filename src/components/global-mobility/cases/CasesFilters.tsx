
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface CasesFiltersProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
}

export const CasesFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter
}: CasesFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Suche nach Mitarbeiter, Land oder Fall-ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Alle Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Status</SelectItem>
          <SelectItem value="draft">Entwurf</SelectItem>
          <SelectItem value="submitted">Eingereicht</SelectItem>
          <SelectItem value="under_review">In Prüfung</SelectItem>
          <SelectItem value="approved">Genehmigt</SelectItem>
          <SelectItem value="in_progress">Aktiv</SelectItem>
          <SelectItem value="completed">Abgeschlossen</SelectItem>
          <SelectItem value="cancelled">Storniert</SelectItem>
        </SelectContent>
      </Select>
      <Select value={typeFilter} onValueChange={setTypeFilter}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Alle Typen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Typen</SelectItem>
          <SelectItem value="relocation">Relocation</SelectItem>
          <SelectItem value="assignment">Entsendung</SelectItem>
          <SelectItem value="transfer">Transfer</SelectItem>
          <SelectItem value="visa_support">Visa-Support</SelectItem>
          <SelectItem value="remote_work">Remote Work</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
