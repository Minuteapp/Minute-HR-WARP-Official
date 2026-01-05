
import { 
  File, FileText, FileSpreadsheet, FileImage, 
  File as FilePdf, Package, FileCode, FileArchive 
} from 'lucide-react';
import { getFileExtension } from '@/utils/documentUtils';

interface FileItemProps {
  name: string;
  size: string;
  date: string;
  onClick?: () => void;
}

export const FileItem = ({ name, size, date, onClick }: FileItemProps) => {
  const extension = getFileExtension(name);
  
  const getFileIcon = () => {
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <FilePdf className="h-10 w-10 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-10 w-10 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-10 w-10 text-purple-500" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="h-10 w-10 text-yellow-500" />;
      case 'js':
      case 'ts':
      case 'html':
      case 'css':
        return <FileCode className="h-10 w-10 text-gray-500" />;
      default:
        return <File className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <div 
      className="flex items-center space-x-4"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {name}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{size}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};
