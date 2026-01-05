
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Globe, AlertTriangle, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface UserSession {
  id: string;
  session_token: string;
  ip_address: string;
  user_agent: string;
  is_active: boolean;
  last_activity: string;
  expires_at: string;
  created_at: string;
  revoked_at?: string;
}

const SessionManagement = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserSessions();
    }
  }, [user]);

  const loadUserSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      console.error('Error loading sessions:', error);
      toast({
        variant: "destructive",
        title: "Fehler beim Laden der Sitzungen",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          revoked_at: new Date().toISOString(),
          revoked_reason: 'User revoked'
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Sitzung beendet",
        description: "Die Sitzung wurde erfolgreich beendet."
      });

      await loadUserSessions();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Beenden der Sitzung",
        description: error.message
      });
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent?.toLowerCase().includes('mobile')) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Jetzt";
    if (diffMins < 60) return `vor ${diffMins} Min`;
    if (diffHours < 24) return `vor ${diffHours} Std`;
    return `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Aktive Sitzungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-gray-600">Laden...</p>
            ) : sessions.length === 0 ? (
              <p className="text-gray-600">Keine aktiven Sitzungen gefunden.</p>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.user_agent)}
                      <div>
                        <p className="font-medium">
                          {session.user_agent?.split(' ')[0] || 'Unbekanntes Gerät'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{session.ip_address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={session.is_active ? "default" : "secondary"}
                        className={session.is_active ? "bg-green-500" : "bg-gray-500"}
                      >
                        {session.is_active ? "Aktiv" : "Beendet"}
                      </Badge>
                      
                      {session.is_active && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => revokeSession(session.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Beenden
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Letzte Aktivität: {formatLastActivity(session.last_activity)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3" />
                      <span>Erstellt: {new Date(session.created_at).toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  
                  {new Date(session.expires_at) < new Date() && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Diese Sitzung ist abgelaufen</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManagement;
