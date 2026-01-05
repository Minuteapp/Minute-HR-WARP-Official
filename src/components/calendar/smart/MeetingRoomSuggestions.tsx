
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Monitor, Wifi, CheckCircle } from 'lucide-react';
import { MeetingRoom } from '@/services/smartCalendarService';

interface MeetingRoomSuggestionsProps {
  rooms: MeetingRoom[];
}

const MeetingRoomSuggestions: React.FC<MeetingRoomSuggestionsProps> = ({ rooms }) => {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Keine Meeting-Räume verfügbar</p>
        <p className="text-sm">Kontaktieren Sie den Administrator</p>
      </div>
    );
  }

  const getEquipmentIcon = (equipment: string) => {
    const icons: Record<string, any> = {
      'Beamer': Monitor,
      'Monitor': Monitor,
      'Whiteboard': CheckCircle,
      'Video-Konferenz': Monitor,
      'Sound-System': Monitor,
      'Mikrofon': Monitor,
      'Flipchart': CheckCircle,
      'Sticky Notes': CheckCircle
    };
    return icons[equipment] || CheckCircle;
  };

  const getRoomTypeColor = (roomType: string) => {
    const colors: Record<string, string> = {
      'conference': 'bg-blue-100 text-blue-800',
      'meeting': 'bg-green-100 text-green-800',
      'presentation': 'bg-purple-100 text-purple-800',
      'huddle': 'bg-yellow-100 text-yellow-800',
      'workshop': 'bg-orange-100 text-orange-800'
    };
    return colors[roomType] || 'bg-gray-100 text-gray-800';
  };

  const getRoomTypeName = (roomType: string) => {
    const names: Record<string, string> = {
      'conference': 'Konferenzraum',
      'meeting': 'Besprechungsraum',
      'presentation': 'Präsentationsraum',
      'huddle': 'Huddle Room',
      'workshop': 'Workshop-Raum'
    };
    return names[roomType] || roomType;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Verfügbare Meeting-Räume</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <Card key={room.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  {room.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      {room.location}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getRoomTypeColor(room.room_type)}>
                    {getRoomTypeName(room.room_type)}
                  </Badge>
                  {room.is_available && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Verfügbar
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Kapazität */}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Bis zu {room.capacity} Personen</span>
              </div>

              {/* Ausstattung */}
              {room.equipment && room.equipment.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Ausstattung:</p>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment.map((item, index) => {
                      const IconComponent = getEquipmentIcon(item);
                      return (
                        <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                          <IconComponent className="h-3 w-3" />
                          {item}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Features */}
              {room.features && Object.keys(room.features).length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(room.features).map(([feature, value]) => {
                      if (value === true) {
                        return (
                          <Badge key={feature} variant="secondary" className="text-xs flex items-center gap-1">
                            {feature === 'hasWifi' && <Wifi className="h-3 w-3" />}
                            {feature === 'hasAC' && <CheckCircle className="h-3 w-3" />}
                            {feature === 'hasProjector' && <Monitor className="h-3 w-3" />}
                            {feature === 'hasWhiteboard' && <CheckCircle className="h-3 w-3" />}
                            {feature === 'hasWifi' ? 'WLAN' :
                             feature === 'hasAC' ? 'Klimaanlage' :
                             feature === 'hasProjector' ? 'Projektor' :
                             feature === 'hasWhiteboard' ? 'Whiteboard' : feature}
                          </Badge>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}

              {/* Buchungsbutton */}
              <div className="flex justify-end pt-2">
                <Button 
                  size="sm" 
                  disabled={!room.is_available}
                  className="w-full sm:w-auto"
                >
                  {room.is_available ? 'Buchen' : 'Nicht verfügbar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MeetingRoomSuggestions;
