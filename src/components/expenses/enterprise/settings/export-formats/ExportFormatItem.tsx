
import { FileText, Download } from 'lucide-react';

interface ExportFormatItemProps {
  id: string;
  name: string;
  description: string;
  icon: 'file' | 'download';
  onConfigure: (id: string) => void;
}

const ExportFormatItem = ({ id, name, description, icon, onConfigure }: ExportFormatItemProps) => {
  const Icon = icon === 'file' ? FileText : Download;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-lg">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h4 className="font-medium text-foreground">{name}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button 
        onClick={() => onConfigure(id)}
        className="text-purple-600 font-medium hover:text-purple-700"
      >
        Konfigurieren
      </button>
    </div>
  );
};

export default ExportFormatItem;
