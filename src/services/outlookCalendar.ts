
import { Client } from '@microsoft/microsoft-graph-client';
import { CalendarEvent } from '@/types/calendar';

interface OutlookAuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export const initializeOutlookClient = async (config: OutlookAuthConfig) => {
  try {
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      }),
    });

    const { access_token } = await tokenResponse.json();

    return Client.init({
      authProvider: (done) => done(null, access_token),
    });
  } catch (error) {
    console.error('Error initializing Outlook client:', error);
    throw error;
  }
};

export const fetchOutlookEvents = async (client: Client): Promise<CalendarEvent[]> => {
  try {
    const response = await client
      .api('/me/calendar/events')
      .select('subject,start,end,location,attendees,body')
      .orderby('start/dateTime DESC')
      .get();

    return response.value.map((event: any) => ({
      id: event.id,
      title: event.subject,
      start: new Date(event.start.dateTime),
      end: new Date(event.end.dateTime),
      location: event.location?.displayName,
      description: event.body?.content,
      category: 'meeting',
      type: 'outlook',
      project: '',
      color: 'blue',
      participants: event.attendees?.map((attendee: any) => attendee.emailAddress.address) || []
    }));
  } catch (error) {
    console.error('Error fetching Outlook events:', error);
    throw error;
  }
};

export const createOutlookEvent = async (client: Client, event: CalendarEvent) => {
  try {
    const startDate = typeof event.start === 'string' ? new Date(event.start) : event.start;
    const endDate = typeof event.end === 'string' ? new Date(event.end) : event.end;
    
    const outlookEvent = {
      subject: event.title,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Berlin'
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Berlin'
      },
      location: {
        displayName: event.location
      },
      attendees: event.participants?.map(email => ({
        emailAddress: {
          address: email
        },
        type: "required"
      })),
      body: {
        contentType: "text",
        content: event.description || ""
      }
    };

    return await client.api('/me/calendar/events').post(outlookEvent);
  } catch (error) {
    console.error('Error creating Outlook event:', error);
    throw error;
  }
};

export const updateOutlookEvent = async (client: Client, event: CalendarEvent) => {
  try {
    const startDate = typeof event.start === 'string' ? new Date(event.start) : event.start;
    const endDate = typeof event.end === 'string' ? new Date(event.end) : event.end;
    
    const outlookEvent = {
      subject: event.title,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'Europe/Berlin'
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'Europe/Berlin'
      },
      location: {
        displayName: event.location
      },
      attendees: event.participants?.map(email => ({
        emailAddress: {
          address: email
        },
        type: "required"
      })),
      body: {
        contentType: "text",
        content: event.description || ""
      }
    };

    return await client.api(`/me/calendar/events/${event.id}`).update(outlookEvent);
  } catch (error) {
    console.error('Error updating Outlook event:', error);
    throw error;
  }
};

export const deleteOutlookEvent = async (client: Client, eventId: string) => {
  try {
    return await client.api(`/me/calendar/events/${eventId}`).delete();
  } catch (error) {
    console.error('Error deleting Outlook event:', error);
    throw error;
  }
};
