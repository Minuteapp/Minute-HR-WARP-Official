
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Edit, RotateCcw, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AnnouncementTypeCard = ({ 
  title, 
  description, 
  type 
}: { 
  title: string; 
  description: string; 
  type: string; 
}) => (
  <Card className="p-6 space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
    <Button 
      className="w-full bg-[#FF6B00] hover:bg-[#E66000] text-white"
      onClick={() => console.log(`Create ${type} announcement`)}
    >
      <Plus className="h-4 w-4 mr-2" />
      Erstellen
    </Button>
  </Card>
);

const VoicemailAnnouncements = () => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voicemail_announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  return (
    <Tabs defaultValue="existing" className="space-y-6">
      <TabsList className="w-full grid grid-cols-2 lg:w-[400px]">
        <TabsTrigger value="existing">Vorhandene Ansagen</TabsTrigger>
        <TabsTrigger value="new">Neue Ansage</TabsTrigger>
      </TabsList>

      <TabsContent value="existing" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <p>Lade Ansagen...</p>
          ) : announcements?.map((announcement) => (
            <Card key={announcement.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                  <p className="text-sm text-gray-500">{announcement.duration}s</p>
                </div>
                <Badge 
                  variant={announcement.status === 'active' ? 'default' : 'secondary'}
                  className={announcement.status === 'active' ? 'bg-[#FF6B00]' : ''}
                >
                  {announcement.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsPlaying(isPlaying === announcement.id ? null : announcement.id)}
                >
                  {isPlaying === announcement.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="new" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnnouncementTypeCard
          title="Standard"
          description="Diese Ansage ist immer aktiv, sofern keine andere Ansage geplant ist."
          type="standard"
        />
        <AnnouncementTypeCard
          title="Beschäftigt"
          description="Aktivieren Sie diese Ansage vorübergehend, wenn Sie beschäftigt sind."
          type="busy"
        />
        <AnnouncementTypeCard
          title="Abwesend"
          description="Ideal für längere Abwesenheiten von mehreren Tagen oder Wochen."
          type="absent"
        />
      </TabsContent>
    </Tabs>
  );
};

export default VoicemailAnnouncements;
