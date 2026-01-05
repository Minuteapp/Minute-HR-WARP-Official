
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface ExpensesHeaderProps {
  userName?: string;
  userRole?: string;
  onRoleSwitch?: () => void;
}

const ExpensesHeader = ({ userName, userRole, onRoleSwitch }: ExpensesHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Ausgaben</h1>
        <span className="text-muted-foreground">Enterprise Expense Management</span>
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Vorschau
        </Badge>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="default" 
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={onRoleSwitch}
        >
          <Users className="h-4 w-4 mr-2" />
          Rolle wechseln
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{userName || 'Benutzer'}</p>
            <p className="text-xs text-muted-foreground">{userRole || 'Mitarbeiter'}</p>
          </div>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-purple-100 text-purple-600">
              {userName ? userName.split(' ').map(n => n[0]).join('') : 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
};

export default ExpensesHeader;
