
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parameter aus der Anfrage extrahieren
    const { syncDirection } = await req.json();
    
    if (syncDirection === "tasks-to-calendar") {
      // 1. Aufgaben mit Fälligkeitsdatum abrufen
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .not('dueDate', 'is', null);
        
      if (tasksError) throw tasksError;
      
      // 2. Vorhandene Aufgaben-Events im Kalender abrufen
      const { data: existingEvents, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('type', 'task');
        
      if (eventsError) throw eventsError;
      
      // 3. Aufgaben identifizieren, die noch nicht im Kalender sind
      const existingTaskIds = new Set(existingEvents
        .map(event => event.description?.match(/\[Task ID: (.*?)\]/)?.[1])
        .filter(Boolean));
      
      const tasksToAdd = tasks.filter(task => !existingTaskIds.has(task.id) && task.dueDate);
      
      // 4. Neue Kalenderereignisse für diese Aufgaben erstellen
      if (tasksToAdd.length > 0) {
        const newEvents = tasksToAdd.map(task => {
          // Bestimme die Farbe basierend auf der Priorität
          let color = 'blue';
          if (task.priority === 'high') color = 'red';
          else if (task.priority === 'medium') color = 'orange';
          
          // Erstelle das Kalenderereignis
          const event = {
            title: `[Aufgabe] ${task.title}`,
            description: `${task.description || ''}\n\n[Task ID: ${task.id}]`,
            type: 'task',
            color: color,
            end: task.dueDate,
            // Wenn Erinnerungsdatum vorhanden ist, dieses als Startzeitpunkt verwenden
            start: task.reminderDate || 
              // Ansonsten eine Stunde vor dem Fälligkeitsdatum als Startzeitpunkt nehmen
              new Date(new Date(task.dueDate).getTime() - (60 * 60 * 1000)).toISOString()
          };
          
          return event;
        });
        
        // Kalenderereignisse in der Datenbank speichern
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert(newEvents);
          
        if (insertError) throw insertError;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${tasksToAdd.length} Aufgaben wurden zum Kalender hinzugefügt`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (syncDirection === "calendar-to-tasks") {
      // 1. Kalenderereignisse abrufen (keine task-Typen, um Duplikate zu vermeiden)
      const { data: events, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .not('type', 'eq', 'task');
        
      if (eventsError) throw eventsError;
      
      // 2. Vorhandene Aufgaben abrufen
      const { data: existingTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');
        
      if (tasksError) throw tasksError;
      
      // 3. Kalenderereignisse identifizieren, die noch keine Aufgaben sind
      const existingEventTitles = new Set(existingTasks
        .filter(task => task.description?.includes('Kalenderereignis:'))
        .map(task => task.description?.match(/Kalenderereignis: (.*?)(?:\n|$)/)?.[1])
        .filter(Boolean));
      
      const eventsToAdd = events.filter(event => 
        !existingEventTitles.has(event.title) && 
        new Date(event.start) > new Date() // Nur zukünftige Events
      );
      
      // 4. Neue Aufgaben für diese Kalenderereignisse erstellen
      if (eventsToAdd.length > 0) {
        const newTasks = eventsToAdd.map(event => {
          // Bestimme den Status basierend auf dem Datum
          const now = new Date();
          const eventStart = new Date(event.start);
          const isOverdue = eventStart < now;
          
          // Erstelle die Aufgabe
          return {
            title: event.title,
            description: `Kalenderereignis: ${event.title}\n\n${event.description || ''}`,
            status: isOverdue ? 'blocked' : 'todo',
            priority: 'medium',
            dueDate: event.end,
            reminderDate: event.start,
            tags: event.type ? [event.type] : []
          };
        });
        
        // Aufgaben in der Datenbank speichern
        const { error: insertError } = await supabase
          .from('tasks')
          .insert(newTasks);
          
        if (insertError) throw insertError;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${eventsToAdd.length} Kalenderereignisse wurden als Aufgaben hinzugefügt`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    throw new Error("Ungültige syncDirection. Verwende 'tasks-to-calendar' oder 'calendar-to-tasks'");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
