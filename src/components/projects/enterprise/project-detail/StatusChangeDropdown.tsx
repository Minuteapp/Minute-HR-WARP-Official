
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StatusChangeDropdownProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  projectId: string;
}

const statusOptions = [
  { value: 'planning', label: 'Planung', className: 'text-gray-600' },
  { value: 'active', label: 'Aktiv', className: 'text-green-600' },
  { value: 'at-risk', label: 'At Risk', className: 'text-orange-600' },
  { value: 'delayed', label: 'Verspätet', className: 'text-red-600' },
  { value: 'on-hold', label: 'On Hold', className: 'text-gray-600' },
  { value: 'completed', label: 'Abgeschlossen', className: 'text-green-600' },
  { value: 'cancelled', label: 'Abgebrochen', className: 'text-red-600' },
];

export const StatusChangeDropdown = ({ 
  currentStatus, 
  onStatusChange, 
  projectId 
}: StatusChangeDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;

      onStatusChange(newStatus);
      toast.success('Status erfolgreich geändert');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Fehler beim Ändern des Status');
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="bg-gray-900 text-white hover:bg-gray-800">
          <Settings className="h-4 w-4 mr-2" />
          Status ändern
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`${option.className} ${currentStatus === option.value ? 'bg-gray-100' : ''}`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
