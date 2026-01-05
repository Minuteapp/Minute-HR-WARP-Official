import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DocumentItem {
  id: string;
  filename: string;
  author: string;
  date: Date;
  size: string;
  category: string;
  projectName: string;
  downloadUrl: string;
}

interface DocumentRowProps {
  document: DocumentItem;
}

const DocumentRow = ({ document }: DocumentRowProps) => {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <FileText className="h-5 w-5 text-gray-500" />
        </div>
        
        <div>
          <h4 className="font-semibold">{document.filename}</h4>
          <p className="text-sm text-muted-foreground">
            {document.author} • {format(document.date, 'dd.MM.yyyy', { locale: de })} • {document.size}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="px-2 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded text-gray-700">
          {document.category}
        </span>
        <span className="px-2 py-0.5 text-xs bg-gray-100 border border-gray-200 rounded text-gray-700">
          {document.projectName}
        </span>
        <a 
          href={document.downloadUrl} 
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>
    </div>
  );
};

export default DocumentRow;
