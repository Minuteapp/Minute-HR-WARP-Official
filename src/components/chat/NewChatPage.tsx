
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/hooks/useChat';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Users, Hash, Lock } from 'lucide-react';

const NewChatPage = () => {
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelType, setChannelType] = useState('group');
  const [isPublic, setIsPublic] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { createChannel } = useChat();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Kanalnamen ein",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      await createChannel(
        channelName,
        channelType,
        !isPublic
      );
      toast({
        title: "Erfolg",
        description: `Kanal "${channelName}" wurde erstellt`
      });
      
      // Zur Chat-Übersicht navigieren
      navigate('/chat');
    } catch (error) {
      console.error('Fehler beim Erstellen des Kanals:', error);
      toast({
        title: "Fehler",
        description: "Der Kanal konnte nicht erstellt werden",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  const renderChannelTypeIcon = () => {
    switch (channelType) {
      case 'direct':
        return <Users className="h-8 w-8 mb-2" />;
      case 'group':
        return isPublic 
          ? <Hash className="h-8 w-8 mb-2" /> 
          : <Lock className="h-8 w-8 mb-2" />;
      case 'module':
        return <MessageSquare className="h-8 w-8 mb-2" />;
      default:
        return <Hash className="h-8 w-8 mb-2" />;
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Neuen Chat erstellen</CardTitle>
          <CardDescription>
            Erstellen Sie einen neuen Kanal für die Kommunikation mit Ihrem Team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Name des Kanals</Label>
              <Input
                id="channel-name"
                placeholder="z.B. Marketing Team"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel-description">Beschreibung (optional)</Label>
              <Input
                id="channel-description"
                placeholder="Worum geht es in diesem Kanal?"
                value={channelDescription}
                onChange={(e) => setChannelDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-4">
              <Label>Kanaltyp</Label>
              <RadioGroup 
                value={channelType} 
                onValueChange={setChannelType}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div className={`p-4 border rounded-lg ${channelType === 'direct' ? 'border-primary' : 'border-border'}`}>
                  <RadioGroupItem value="direct" id="type-direct" className="sr-only" />
                  <Label htmlFor="type-direct" className="flex flex-col items-center cursor-pointer">
                    <Users className="h-8 w-8 mb-2" />
                    <span className="font-medium">Direkte Nachricht</span>
                    <span className="text-xs text-muted-foreground mt-1">Private Konversation zwischen Benutzern</span>
                  </Label>
                </div>
                
                <div className={`p-4 border rounded-lg ${channelType === 'group' ? 'border-primary' : 'border-border'}`}>
                  <RadioGroupItem value="group" id="type-group" className="sr-only" />
                  <Label htmlFor="type-group" className="flex flex-col items-center cursor-pointer">
                    <Hash className="h-8 w-8 mb-2" />
                    <span className="font-medium">Gruppenkanal</span>
                    <span className="text-xs text-muted-foreground mt-1">Diskussionsgruppe für Teams</span>
                  </Label>
                </div>
                
                <div className={`p-4 border rounded-lg ${channelType === 'module' ? 'border-primary' : 'border-border'}`}>
                  <RadioGroupItem value="module" id="type-module" className="sr-only" />
                  <Label htmlFor="type-module" className="flex flex-col items-center cursor-pointer">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <span className="font-medium">Modulkanal</span>
                    <span className="text-xs text-muted-foreground mt-1">Konversation zu einem bestimmten Modul</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {channelType === 'group' && (
              <div className="space-y-4">
                <Label>Sichtbarkeit</Label>
                <RadioGroup 
                  value={isPublic ? 'public' : 'private'} 
                  onValueChange={(val) => setIsPublic(val === 'public')}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className={`p-4 border rounded-lg ${isPublic ? 'border-primary' : 'border-border'}`}>
                    <RadioGroupItem value="public" id="visibility-public" className="sr-only" />
                    <Label htmlFor="visibility-public" className="flex flex-col items-center cursor-pointer">
                      <Hash className="h-8 w-8 mb-2" />
                      <span className="font-medium">Öffentlich</span>
                      <span className="text-xs text-muted-foreground mt-1">Jeder kann beitreten und Nachrichten lesen</span>
                    </Label>
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${!isPublic ? 'border-primary' : 'border-border'}`}>
                    <RadioGroupItem value="private" id="visibility-private" className="sr-only" />
                    <Label htmlFor="visibility-private" className="flex flex-col items-center cursor-pointer">
                      <Lock className="h-8 w-8 mb-2" />
                      <span className="font-medium">Privat</span>
                      <span className="text-xs text-muted-foreground mt-1">Nur eingeladene Mitglieder können beitreten</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
          
          {/* Vorschau */}
          <div className="pt-4 border-t">
            <Label className="block mb-3">Vorschau</Label>
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              {renderChannelTypeIcon()}
              <div>
                <h3 className="font-medium">{channelName || 'Kanalname'}</h3>
                {channelDescription && (
                  <p className="text-sm text-muted-foreground">{channelDescription}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/chat/all')}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleCreateChannel} 
            disabled={!channelName.trim() || isCreating}
          >
            {isCreating ? 'Erstelle Kanal...' : 'Kanal erstellen'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NewChatPage;
