import { Button } from "@/components/ui/button";
import { Plus, FileText, FileDown } from "lucide-react";
import { HRNoteCard } from "./HRNoteCard";
import { useHRNotesPDFExport } from "@/hooks/useHRNotesPDFExport";

interface HRNotesListProps {
  notes: any[];
  onCreateNote: () => void;
}

export const HRNotesList = ({ notes, onCreateNote }: HRNotesListProps) => {
  const { exportMultipleNotesToPDF } = useHRNotesPDFExport();
  
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Noch keine HR-Notizen</h3>
        <p className="text-muted-foreground text-center mb-6">
          Es wurden noch keine HR-Notizen für diesen Mitarbeiter erstellt.
        </p>
        <Button onClick={onCreateNote}>
          <Plus className="h-4 w-4 mr-2" />
          Erste Notiz erstellen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notizen ({notes.length})</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportMultipleNotesToPDF(notes)}>
            <FileDown className="h-4 w-4 mr-2" />
            Alle als PDF exportieren
          </Button>
          <Button onClick={onCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Notiz
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        {notes.map((note) => (
          <HRNoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
};
