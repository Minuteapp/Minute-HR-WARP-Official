
import { File, Calendar, CheckSquare, Link } from "lucide-react";

interface ModuleIconProps {
  type: string;
}

export function ModuleIcon({ type }: ModuleIconProps) {
  switch (type) {
    case 'document':
      return <File className="h-5 w-5 text-blue-600" />;
    case 'task':
      return <CheckSquare className="h-5 w-5 text-green-600" />;
    case 'calendar':
      return <Calendar className="h-5 w-5 text-purple-600" />;
    default:
      return <Link className="h-5 w-5 text-gray-600" />;
  }
}
