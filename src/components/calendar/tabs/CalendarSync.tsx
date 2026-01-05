import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Check, AlertCircle, Copy } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CalendarSync = () => {
  const queryClient = useQueryClient();

  const { data: syncJobs, isLoading } = useQuery({
    queryKey: ['calendar-sync-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_sync_jobs')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return data;
    },
  });

  const toggleSyncMutation = useMutation({
    mutationFn: async ({ jobId, enabled }: { jobId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('calendar_sync_jobs')
        .update({ sync_status: enabled ? 'active' : 'paused' })
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-sync-jobs'] });
      toast.success('Synchronisation aktualisiert');
    },
  });

  const triggerSyncMutation = useMutation({
    mutationFn: async (provider: string) => {
      // TODO: Implementiere tatsächliche Sync-Logik über Edge Function
      toast.info('Synchronisation gestartet...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
    onSuccess: () => {
      toast.success('Synchronisation abgeschlossen');
      queryClient.invalidateQueries({ queryKey: ['calendar-sync-jobs'] });
    },
  });

  const googleJob = syncJobs?.find(j => j.provider === 'google');
  const microsoftJob = syncJobs?.find(j => j.provider === 'microsoft');
  const appleJob = syncJobs?.find(j => j.provider === 'apple');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Kalender-Synchronisation</h2>
        <p className="text-muted-foreground">
          Verbinden Sie externe Kalender für automatische Zwei-Wege-Synchronisation
        </p>
      </div>

      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border">
                <svg className="h-6 w-6" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium">Google Calendar</div>
                <div className="text-sm text-muted-foreground">
                  {googleJob?.last_sync_at 
                    ? `Letzte Sync: ${new Date(googleJob.last_sync_at).toLocaleString('de-DE')}`
                    : 'Nicht verbunden'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {googleJob ? (
                <>
                  <Badge variant={googleJob.sync_status === 'active' ? 'default' : 'secondary'}>
                    {googleJob.sync_status}
                  </Badge>
                  <Switch
                    checked={googleJob.sync_status === 'active'}
                    onCheckedChange={(checked) => 
                      toggleSyncMutation.mutate({ jobId: googleJob.id, enabled: checked })
                    }
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => triggerSyncMutation.mutate('google')}
                    disabled={triggerSyncMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${triggerSyncMutation.isPending ? 'animate-spin' : ''}`} />
                    Jetzt synchronisieren
                  </Button>
                </>
              ) : (
                <Button>Verbinden</Button>
              )}
            </div>
          </div>
        </CardHeader>
        {googleJob && googleJob.sync_errors && googleJob.sync_errors.length > 0 && (
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sync-Fehler: {JSON.stringify(googleJob.sync_errors)}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Microsoft 365 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#0078D4] flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0L0 6v12l12 6 12-6V6L12 0zm0 2.27L21.1 7 12 11.73 2.9 7 12 2.27zM2 8.82l9 4.5v8.86l-9-4.5V8.82zm20 0v8.86l-9 4.5v-8.86l9-4.5z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium">Microsoft 365 / Outlook</div>
                <div className="text-sm text-muted-foreground">
                  {microsoftJob?.last_sync_at 
                    ? `Letzte Sync: ${new Date(microsoftJob.last_sync_at).toLocaleString('de-DE')}`
                    : 'Nicht verbunden'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {microsoftJob ? (
                <>
                  <Badge variant={microsoftJob.sync_status === 'active' ? 'default' : 'secondary'}>
                    {microsoftJob.sync_status}
                  </Badge>
                  <Switch
                    checked={microsoftJob.sync_status === 'active'}
                    onCheckedChange={(checked) => 
                      toggleSyncMutation.mutate({ jobId: microsoftJob.id, enabled: checked })
                    }
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => triggerSyncMutation.mutate('microsoft')}
                    disabled={triggerSyncMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${triggerSyncMutation.isPending ? 'animate-spin' : ''}`} />
                    Jetzt synchronisieren
                  </Button>
                </>
              ) : (
                <Button>Verbinden</Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Apple Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </div>
              <div>
                <div className="font-medium">Apple Calendar (iCloud)</div>
                <div className="text-sm text-muted-foreground">
                  {appleJob?.last_sync_at 
                    ? `Letzte Sync: ${new Date(appleJob.last_sync_at).toLocaleString('de-DE')}`
                    : 'Nicht verbunden'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {appleJob ? (
                <>
                  <Badge variant={appleJob.sync_status === 'active' ? 'default' : 'secondary'}>
                    {appleJob.sync_status}
                  </Badge>
                  <Switch
                    checked={appleJob.sync_status === 'active'}
                    onCheckedChange={(checked) => 
                      toggleSyncMutation.mutate({ jobId: appleJob.id, enabled: checked })
                    }
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => triggerSyncMutation.mutate('apple')}
                    disabled={triggerSyncMutation.isPending}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${triggerSyncMutation.isPending ? 'animate-spin' : ''}`} />
                    Jetzt synchronisieren
                  </Button>
                </>
              ) : (
                <Button>Verbinden</Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ICS-Feeds */}
      <Card>
        <CardHeader>
          <CardTitle>ICS-Feeds & Abos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">Mein Kalender</div>
              <div className="text-sm text-muted-foreground">Persönlicher ICS-Feed</div>
            </div>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Link kopieren
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">Team Engineering</div>
              <div className="text-sm text-muted-foreground">Team-Kalender ICS-Feed</div>
            </div>
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Link kopieren
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          Lädt Synchronisationseinstellungen...
        </div>
      )}
    </div>
  );
};

export default CalendarSync;