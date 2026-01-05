import { Button } from '@/components/ui/button';
import { Plus, Paperclip } from 'lucide-react';

const CommunicationHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Kommunikation & Dokumente</h2>
        <p className="text-muted-foreground">Projekt-Updates und Dokumentation</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Paperclip className="h-4 w-4 mr-2" />
          Dokument hochladen
        </Button>
        <Button className="bg-black text-white hover:bg-gray-800">
          <Plus className="h-4 w-4 mr-2" />
          Update posten
        </Button>
      </div>
    </div>
  );
};

export default CommunicationHeader;
