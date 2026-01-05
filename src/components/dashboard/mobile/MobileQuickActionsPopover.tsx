
import { UserPlus, ListTodo, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MobileQuickActionsPopoverProps {
  onClose?: () => void;
}

const MobileQuickActionsPopover = ({ onClose }: MobileQuickActionsPopoverProps) => {
  const navigate = useNavigate();

  const handleItemClick = (path: string) => {
    if (onClose) onClose();
    navigate(path);
  };

  return (
    <div className="flex flex-col gap-4">
      <button 
        onClick={() => handleItemClick('/employees/new')}
        className="flex items-center justify-start gap-4 p-4 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-colors"
      >
        <div className="bg-primary/20 p-2 rounded-full">
          <UserPlus size={20} className="text-primary" />
        </div>
        <div className="text-left">
          <p className="font-medium">Mitarbeiter hinzufügen</p>
          <p className="text-sm text-gray-500">Neuen Mitarbeiter anlegen</p>
        </div>
      </button>
      
      <button 
        onClick={() => handleItemClick('/tasks/new')}
        className="flex items-center justify-start gap-4 p-4 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-colors"
      >
        <div className="bg-primary/20 p-2 rounded-full">
          <ListTodo size={20} className="text-primary" />
        </div>
        <div className="text-left">
          <p className="font-medium">Aufgabe erstellen</p>
          <p className="text-sm text-gray-500">Neue Aufgabe hinzufügen</p>
        </div>
      </button>
      
      <button 
        onClick={() => handleItemClick('/time')}
        className="flex items-center justify-start gap-4 p-4 bg-primary/10 rounded-lg text-primary hover:bg-primary/20 transition-colors"
      >
        <div className="bg-primary/20 p-2 rounded-full">
          <Clock size={20} className="text-primary" />
        </div>
        <div className="text-left">
          <p className="font-medium">Einstempeln</p>
          <p className="text-sm text-gray-500">Arbeitszeit erfassen</p>
        </div>
      </button>
    </div>
  );
};

export default MobileQuickActionsPopover;
