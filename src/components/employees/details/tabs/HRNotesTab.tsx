import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeHRNotes } from "@/integrations/supabase/hooks/useEmployeeHRNotes";
import { HRNotesWarning } from "./hr-notes/HRNotesWarning";
import { HRNotesSearch } from "./hr-notes/HRNotesSearch";
import { HRNotesStats } from "./hr-notes/HRNotesStats";
import { HRNotesList } from "./hr-notes/HRNotesList";
import { HRNoteForm } from "./hr-notes/HRNoteForm";
import { HRNotesFilters } from "./hr-notes/HRNotesFilters";
import { subDays, subYears } from "date-fns";

export const HRNotesTab = ({ employeeId }: { employeeId: string }) => {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [attachmentsOnly, setAttachmentsOnly] = useState(false);
  
  const { data: notes, isLoading } = useEmployeeHRNotes(employeeId);

  const filteredNotes = useMemo(() => {
    if (!notes) return [];
    
    let filtered = notes;

    // Suchquery
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Kategorie-Filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(note => note.category === categoryFilter);
    }

    // Sichtbarkeits-Filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(note => note.visibility === visibilityFilter);
    }

    // Zeitraum-Filter
    if (timeFilter !== 'all') {
      const now = new Date();
      const filterDate = {
        '7days': subDays(now, 7),
        '30days': subDays(now, 30),
        '1year': subYears(now, 1),
      }[timeFilter];
      
      if (filterDate) {
        filtered = filtered.filter(note => 
          new Date(note.created_at) >= filterDate
        );
      }
    }

    // Nur mit Anhängen
    if (attachmentsOnly) {
      filtered = filtered.filter(note => note.has_attachments);
    }

    return filtered;
  }, [notes, searchQuery, categoryFilter, visibilityFilter, timeFilter, attachmentsOnly]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HRNotesWarning />
      <HRNotesSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <HRNotesFilters
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        visibilityFilter={visibilityFilter}
        setVisibilityFilter={setVisibilityFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        attachmentsOnly={attachmentsOnly}
        setAttachmentsOnly={setAttachmentsOnly}
      />
      <HRNotesStats notes={filteredNotes} />
      <HRNotesList 
        notes={filteredNotes}
        onCreateNote={() => setShowForm(true)}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Neue HR-Notiz erstellen</DialogTitle>
          </DialogHeader>
          <HRNoteForm 
            employeeId={employeeId}
            onSuccess={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
