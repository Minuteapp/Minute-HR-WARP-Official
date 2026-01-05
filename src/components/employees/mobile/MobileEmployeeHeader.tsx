import { ArrowLeft, Settings, Edit, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MobileEmployeeHeaderProps {
  employee: any;
}

export const MobileEmployeeHeader = ({ employee }: MobileEmployeeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-background border-b border-border p-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/employees')}
        className="gap-1.5 mb-3 text-[11px] h-7"
      >
        <ArrowLeft className="w-3 h-3" />
        Zurück zur Liste
      </Button>
      
      <div className="mb-3">
        <h1 className="text-base font-bold text-foreground mb-2">Mitarbeiter-Profil</h1>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 h-6 text-[10px]">
                <User className="w-3 h-3" />
                HR
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem>HR-Notizen</DropdownMenuItem>
              <DropdownMenuItem>Berechtigungen</DropdownMenuItem>
              <DropdownMenuItem>Audit Log</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Settings className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <Button variant="outline" className="w-full gap-1.5 h-8 text-[11px]">
        <Edit className="w-3 h-3" />
        Profil bearbeiten
      </Button>
    </div>
  );
};
