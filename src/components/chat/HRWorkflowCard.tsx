import React from 'react';
import { Calendar, DollarSign, Users, Plane, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { HRWorkflowCard } from '@/types/chat-extended';
import { usePermissionContext } from '@/contexts/PermissionContext';

interface HRWorkflowCardProps {
  card: HRWorkflowCard;
  messageId: string;
}

const HRWorkflowCardComponent = ({ card, messageId }: HRWorkflowCardProps) => {
  const { hasPermission } = usePermissionContext();

  const getIcon = () => {
    switch (card.type) {
      case 'absence_request':
        return <Calendar className="h-5 w-5" />;
      case 'expense_report':
        return <DollarSign className="h-5 w-5" />;
      case 'shift_swap':
        return <Users className="h-5 w-5" />;
      case 'travel_request':
        return <Plane className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = () => {
    switch (card.status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (card.status) {
      case 'approved':
        return <Check className="h-4 w-4" />;
      case 'rejected':
        return <X className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatValue = (key: string, value: any) => {
    if (key.includes('date')) {
      return new Date(value).toLocaleDateString('de-DE');
    }
    if (key.includes('amount') || key.includes('cost')) {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    }
    return value;
  };

  const renderDataFields = () => {
    const excludeFields = ['id', 'user_id', 'created_at', 'updated_at'];
    
    return Object.entries(card.data)
      .filter(([key]) => !excludeFields.includes(key))
      .slice(0, 4) // Limit to most important fields
      .map(([key, value]) => (
        <div key={key} className="flex justify-between text-sm">
          <span className="text-muted-foreground capitalize">
            {key.replace(/_/g, ' ')}:
          </span>
          <span className="font-medium">
            {formatValue(key, value)}
          </span>
        </div>
      ));
  };

  const handleAction = async (action: string) => {
    try {
      // Handle workflow action
      console.log(`Action ${action} for ${card.type} ${messageId}`);
      // TODO: Implement actual workflow action
    } catch (error) {
      console.error('Error handling workflow action:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-base">{card.title}</CardTitle>
          </div>
          <Badge className={`${getStatusColor()} border flex items-center gap-1`}>
            {getStatusIcon()}
            {card.status === 'pending' ? 'Wartend' : 
             card.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Data Fields */}
        <div className="space-y-2">
          {renderDataFields()}
        </div>

        {card.status === 'pending' && card.actions.length > 0 && (
          <>
            <Separator />
            
            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap">
              {card.actions.map((action, index) => {
                const hasActionPermission = !action.permission_required || 
                  hasPermission('workflow', action.permission_required);
                
                if (!hasActionPermission) return null;
                
                return (
                  <Button
                    key={index}
                    variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                    size="sm"
                    onClick={() => handleAction(action.action)}
                    className="flex-1"
                  >
                    {action.label}
                  </Button>
                );
              })}
            </div>
          </>
        )}

        {/* Quick Actions */}
        <Separator />
        <div className="flex gap-2 text-xs">
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Zu Ticket machen
          </Button>
          <Button variant="ghost" size="sm" className="h-6 text-xs">
            Als Aufgabe
          </Button>
          {card.type === 'absence_request' && (
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              Im Kalender
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HRWorkflowCardComponent;