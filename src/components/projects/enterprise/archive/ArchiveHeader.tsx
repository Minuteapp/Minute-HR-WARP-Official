import { Archive } from 'lucide-react';

const ArchiveHeader = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Archive className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold">Projekt-Archiv</h2>
        <p className="text-sm text-muted-foreground">
          Abgeschlossene und archivierte Projekte mit Lessons Learned
        </p>
      </div>
    </div>
  );
};

export default ArchiveHeader;
