import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Minus } from 'lucide-react';
import { formatTime, formatDate } from '@/utils/shift-planning';

interface ShiftListViewProps {
  groupedShifts: Record<string, any[]>;
}

export const ShiftListView = ({ groupedShifts }: ShiftListViewProps) => {
  if (Object.keys(groupedShifts).length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Keine Schichten im gewählten Zeitraum</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedShifts).map(([week, shifts]) => (
        <div key={week} className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">{week}</h3>
          
          <div className="space-y-2">
            {shifts.map((shift) => (
              <Card key={shift.id} className="border-l-4" style={{ borderLeftColor: shift.shift_type?.color || '#6B7280' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="min-w-[100px]">
                        <p className="font-medium text-sm">{formatDate(shift.date)}</p>
                      </div>
                      
                      <div className="min-w-[120px]">
                        <p className="text-sm">
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {shift.location && (
                          <Badge variant="outline" className="text-xs">
                            {shift.location}
                          </Badge>
                        )}
                        
                        {shift.shift_type && (
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: shift.shift_type.color,
                              color: 'white'
                            }}
                          >
                            {shift.shift_type.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {shift.status === 'confirmed' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Minus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
