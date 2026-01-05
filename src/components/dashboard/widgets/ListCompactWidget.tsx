import React from 'react';
import { DashboardWidget, WidgetData } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  UserPlus, 
  Clock, 
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListCompactWidgetProps {
  widget: DashboardWidget;
  data: WidgetData | null;
}

export const ListCompactWidget: React.FC<ListCompactWidgetProps> = ({ widget, data }) => {
  const getIcon = () => {
    switch (widget.icon) {
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'user-plus':
        return <UserPlus className="h-4 w-4" />;
      case 'clock':
        return <Clock className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleItemClick = (item: any) => {
    // Hier könnte Navigation oder Detail-Ansicht implementiert werden
    console.log('Item clicked:', item);
  };

  const maxItems = widget.config.maxItems || 3;
  const items = data?.items?.slice(0, maxItems) || [];
  const hasMoreItems = (data?.items?.length || 0) > maxItems;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getIcon()}
          <span className="truncate">{widget.title}</span>
          {data?.value !== undefined && (
            <Badge variant="secondary" className="ml-auto">
              {data.value}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-16 text-center">
            <p className="text-xs text-muted-foreground">
              Keine Einträge vorhanden
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title || item.name || 'Unbekannt'}
                  </p>
                  {item.time && (
                    <p className="text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  )}
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  {widget.config.showBadge && item.status && (
                    <Badge 
                      variant={item.status === 'new' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  )}
                  
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            ))}
            
            {hasMoreItems && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-xs"
                onClick={() => console.log('Alle anzeigen')}
              >
                <MoreHorizontal className="h-3 w-3 mr-1" />
                {(data?.items?.length || 0) - maxItems} weitere anzeigen
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};