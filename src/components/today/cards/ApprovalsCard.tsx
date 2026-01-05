import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MoreHorizontal, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ApprovalsCardProps {
  darkMode: boolean;
  onToggleVisibility: () => void;
}

const ApprovalsCard = ({ darkMode, onToggleVisibility }: ApprovalsCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Lade ausstehende Genehmigungen
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['pending-approvals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('workflow_instances')
        .select('*')
        .eq('current_approver', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Hoch</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500">Mittel</Badge>;
      case 'low':
        return <Badge variant="outline">Niedrig</Badge>;
      default:
        return <Badge variant="outline">Normal</Badge>;
    }
  };
  
  const getWorkflowTypeLabel = (referenceType: string) => {
    const labels: Record<string, string> = {
      absence_request: 'Abwesenheitsantrag',
      expense: 'Spesenabrechnung',
      document: 'Dokument',
      project: 'Projekt',
      purchase: 'Bestellung',
      time_off: 'Urlaubsantrag',
    };
    return labels[referenceType] || referenceType;
  };
  
  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true, 
      locale: de 
    });
  };
  
  const urgentApprovals = approvals.filter(approval => 
    approval.priority === 'high' || 
    (approval.due_date && new Date(approval.due_date) < new Date())
  ).length;
  
  return (
    <Card className={`today-card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <CheckCircle className="h-5 w-5 text-primary" />
          Offene Genehmigungen
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/workflows')}>
              Alle Workflows
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleVisibility}>
              Card ausblenden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {urgentApprovals > 0 && (
          <div className={`p-2 rounded-md mb-3 text-sm flex items-center font-medium ${
            darkMode ? 'bg-red-900 text-red-200' : 'bg-red-50 text-red-700'
          }`}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>{urgentApprovals} dringende {urgentApprovals === 1 ? 'Genehmigung' : 'Genehmigungen'}</span>
          </div>
        )}
        
        <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Lade Genehmigungen...
            </div>
          ) : approvals.length > 0 ? (
            approvals.map((approval) => (
              <div
                key={approval.id}
                className={`p-3 rounded-md cursor-pointer hover:opacity-80 transition-opacity ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
                onClick={() => navigate(`/workflows/${approval.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {getWorkflowTypeLabel(approval.reference_type)}
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      von {approval.workflow_data?.requester_name || 'Unbekannt'}
                    </p>
                  </div>
                  {getPriorityBadge(approval.priority)}
                </div>
                
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="h-3 w-3" />
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                    {getTimeAgo(approval.created_at)}
                  </span>
                </div>
                
                {approval.due_date && (
                  <div className={`mt-2 text-xs ${
                    new Date(approval.due_date) < new Date()
                      ? 'text-red-500 font-medium'
                      : darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Frist: {new Date(approval.due_date).toLocaleDateString('de-DE')}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Keine ausstehenden Genehmigungen
            </div>
          )}
        </div>
      </CardContent>
      {approvals.length > 0 && (
        <CardFooter className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => navigate('/workflows')}
          >
            Alle Genehmigungen anzeigen
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ApprovalsCard;
