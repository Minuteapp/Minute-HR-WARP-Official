
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, List, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MilestoneCardProps {
  milestone: any;
}

export const MilestoneCard = ({ milestone }: MilestoneCardProps) => {
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('de-DE', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-600 border border-green-200 hover:bg-green-100">Abgeschlossen</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-600 border border-red-200 hover:bg-red-100">Überfällig</Badge>;
      case 'upcoming':
      default:
        return <Badge className="bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100">Bevorstehend</Badge>;
    }
  };

  const deliverables = milestone.deliverables || [];

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(milestone.due_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(milestone.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Löschen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-3">{milestone.name || milestone.title}</h3>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Verantwortlich:</span>
            <span>{milestone.responsible || '-'}</span>
          </div>

          {deliverables.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <List className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <span className="text-muted-foreground">Deliverables:</span>
                <ul className="mt-1 space-y-1">
                  {deliverables.map((item: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
