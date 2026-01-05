import { supabase } from '@/integrations/supabase/client';

/**
 * Sends invitation emails to attendees for a calendar event
 * @param recipients - List of attendee email addresses
 * @param eventId - ID of the event to include in the invitation
 * @returns Promise that resolves to true if invitations are sent successfully, false otherwise
 */
export const sendInvitationEmails = async (
  recipients: string[],
  eventId: string
): Promise<boolean> => {
  try {
    console.log(`Einladungen für Termin ${eventId} werden gesendet an:`, recipients);

    // Hier würde normalerweise der Code zum Senden der E-Mails stehen
    // In dieser Demo loggen wir nur die Aktion

    // Speichern der Einladungen in der Datenbank
    const invitations = recipients.map(recipient => ({
      event_id: eventId,
      recipient: recipient,
      status: 'sent',
      sent_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('calendar_invitations')
      .insert(invitations);

    if (error) {
      console.error('Fehler beim Speichern der Einladungen:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Fehler beim Senden der Einladungen:', error);
    return false;
  }
};
