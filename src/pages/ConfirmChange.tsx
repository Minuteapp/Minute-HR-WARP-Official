import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConfirmChange() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [changeDetails, setChangeDetails] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Ungültiger Bestätigungslink');
      return;
    }

    confirmChange(token);
  }, [searchParams]);

  const confirmChange = async (token: string) => {
    try {
      // Fetch pending change
      const { data: pendingChange, error: fetchError } = await supabase
        .from('employee_pending_changes')
        .select('*')
        .eq('confirmation_token', token)
        .single();

      if (fetchError || !pendingChange) {
        setStatus('error');
        setMessage('Bestätigungslink nicht gefunden oder abgelaufen');
        return;
      }

      // Check if already confirmed
      if (pendingChange.confirmed) {
        setStatus('error');
        setMessage('Diese Änderung wurde bereits bestätigt');
        return;
      }

      // Check expiration
      if (new Date(pendingChange.expires_at) < new Date()) {
        setStatus('error');
        setMessage('Dieser Bestätigungslink ist abgelaufen');
        return;
      }

      setChangeDetails(pendingChange);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Mark as confirmed
      const { error: updateError } = await supabase
        .from('employee_pending_changes')
        .update({
          confirmed: true,
          confirmed_at: new Date().toISOString(),
          confirmed_by: user?.id || null,
        })
        .eq('id', pendingChange.id);

      if (updateError) throw updateError;

      // Apply the changes using the database function
      const { error: applyError } = await supabase.rpc('apply_pending_change', {
        change_id: pendingChange.id,
      });

      if (applyError) throw applyError;

      // Send confirmation email
      await supabase.functions.invoke('send-change-notification', {
        body: {
          type: 'change_confirmed',
          pendingChangeId: pendingChange.id,
        },
      });

      setStatus('success');
      setMessage('Ihre Änderungen wurden erfolgreich bestätigt und angewendet');

      toast({
        title: 'Erfolgreich bestätigt',
        description: 'Die Änderungen wurden übernommen',
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/employees/profile/' + pendingChange.employee_id);
      }, 3000);

    } catch (error: any) {
      console.error('Error confirming change:', error);
      setStatus('error');
      setMessage('Fehler beim Bestätigen der Änderung: ' + error.message);
    }
  };

  const getChangeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'bank_details': 'Bankverbindung',
      'salary': 'Gehaltsinformationen',
      'tax_info': 'Steuerinformationen',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            {status === 'loading' && (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Bestätigung wird verarbeitet...
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Erfolgreich bestätigt
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-6 w-6 text-destructive" />
                Fehler bei der Bestätigung
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">{message}</p>

            {changeDetails && status === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Bestätigte Änderung:
                </p>
                <p className="text-sm text-green-700">
                  {getChangeTypeLabel(changeDetails.change_type)}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Beantragt von: {changeDetails.requested_by_name}
                </p>
              </div>
            )}

            {status === 'success' && (
              <p className="text-sm text-muted-foreground">
                Sie werden in 3 Sekunden weitergeleitet...
              </p>
            )}

            {status === 'error' && (
              <Button
                onClick={() => navigate('/')}
                className="mt-4"
              >
                Zur Startseite
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
