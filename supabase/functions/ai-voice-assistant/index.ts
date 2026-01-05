import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  console.log('🎤 AI Voice Assistant WebSocket connection initiated');

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;

  socket.onopen = () => {
    console.log('🔊 Client WebSocket connected');
    
    // Connect to OpenAI Realtime API
    openAISocket = new WebSocket("wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17");
    
    openAISocket.onopen = () => {
      console.log('🤖 OpenAI Realtime API connected');
      
      // Configure session for HR Assistant
      const sessionConfig = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: `Du bist ALEX, der intelligente HR-Assistent für deutsche Unternehmen. 

DEINE KERNKOMPETENZEN:
- Abwesenheitsanträge verarbeiten ("Trage mich morgen als krank ein")
- Projektstatus abfragen ("Wie läuft Projekt Alpha?")
- Zeiterfassung steuern ("Starte Zeiterfassung für Meeting")
- Terminplanung ("Plane ein Meeting mit dem Marketing-Team")
- HR-Anfragen bearbeiten ("Zeige mir meine Urlaubstage")
- Gehaltsabrechnungen erklären ("Warum ist mein Lohn niedriger?")

SPRACHSTIL:
- Immer auf Deutsch antworten
- Freundlich aber professionell
- Kurze, präzise Antworten
- Bei Unsicherheit nachfragen
- "Sie" oder "Du" je nach Firmenkultur

WICHTIGE REGELN:
- Keine Erfindung von Daten
- Bei kritischen HR-Themen an Fachbereich weiterleiten
- DSGVO-konform agieren
- Immer Bestätigung bei Aktionen einholen`,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000
          },
          tools: [
            {
              type: "function",
              name: "create_absence_request",
              description: "Erstellt einen Abwesenheitsantrag für den Benutzer",
              parameters: {
                type: "object",
                properties: {
                  type: { type: "string", enum: ["vacation", "sick_leave", "personal"] },
                  start_date: { type: "string" },
                  end_date: { type: "string" },
                  reason: { type: "string" }
                },
                required: ["type", "start_date", "end_date"]
              }
            },
            {
              type: "function", 
              name: "start_time_tracking",
              description: "Startet die Zeiterfassung für eine Aktivität",
              parameters: {
                type: "object",
                properties: {
                  activity: { type: "string" },
                  project_id: { type: "string" }
                },
                required: ["activity"]
              }
            },
            {
              type: "function",
              name: "get_project_status",
              description: "Ruft den aktuellen Status eines Projekts ab",
              parameters: {
                type: "object",
                properties: {
                  project_name: { type: "string" }
                },
                required: ["project_name"]
              }
            },
            {
              type: "function",
              name: "schedule_meeting",
              description: "Plant ein Meeting",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  participants: { type: "array", items: { type: "string" } },
                  duration: { type: "number" },
                  date: { type: "string" }
                },
                required: ["title", "participants", "duration"]
              }
            }
          ],
          tool_choice: "auto",
          temperature: 0.8,
          max_response_output_tokens: "inf"
        }
      };
      
      openAISocket?.send(JSON.stringify(sessionConfig));
    };

    openAISocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('🤖 OpenAI Event:', data.type);
      
      // Handle function calls
      if (data.type === 'response.function_call_arguments.done') {
        console.log('🔧 Function call:', data.name, data.arguments);
        
        // Execute function and send result back
        handleFunctionCall(data.name, JSON.parse(data.arguments), data.call_id, openAISocket);
      }
      
      // Forward all events to client
      socket.send(JSON.stringify(data));
    };

    openAISocket.onerror = (error) => {
      console.error('❌ OpenAI WebSocket error:', error);
      socket.send(JSON.stringify({
        type: 'error',
        message: 'AI-Assistant Verbindung unterbrochen'
      }));
    };
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('📨 Client message:', data.type);
    
    // Forward to OpenAI
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log('🔌 Client disconnected');
    openAISocket?.close();
  };

  return response;
});

async function handleFunctionCall(functionName: string, args: any, callId: string, socket: WebSocket | null) {
  console.log(`🎯 Executing function: ${functionName}`, args);
  
  let result = { success: false, message: "Funktion nicht implementiert" };
  
  try {
    switch (functionName) {
      case 'create_absence_request':
        result = await createAbsenceRequest(args);
        break;
      case 'start_time_tracking':
        result = await startTimeTracking(args);
        break;
      case 'get_project_status':
        result = await getProjectStatus(args);
        break;
      case 'schedule_meeting':
        result = await scheduleMeeting(args);
        break;
    }
  } catch (error) {
    console.error(`❌ Function ${functionName} error:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    result = { success: false, message: `Fehler: ${errorMessage}` };
  }

  // Send function result back to OpenAI
  const functionResult = {
    type: 'conversation.item.create',
    item: {
      type: 'function_call_output',
      call_id: callId,
      output: JSON.stringify(result)
    }
  };
  
  socket?.send(JSON.stringify(functionResult));
  socket?.send(JSON.stringify({ type: 'response.create' }));
}

async function createAbsenceRequest(args: any) {
  // Simulate absence request creation
  console.log('📋 Creating absence request:', args);
  return {
    success: true,
    message: `Abwesenheitsantrag erstellt: ${args.type} vom ${args.start_date} bis ${args.end_date}`,
    id: `abs_${Date.now()}`
  };
}

async function startTimeTracking(args: any) {
  console.log('⏰ Starting time tracking:', args);
  return {
    success: true,
    message: `Zeiterfassung gestartet für: ${args.activity}`,
    id: `time_${Date.now()}`
  };
}

async function getProjectStatus(args: any) {
  console.log('📊 Getting project status:', args);
  return {
    success: true,
    message: `Projekt "${args.project_name}" läuft planmäßig - 85% abgeschlossen`,
    status: "on_track",
    progress: 85
  };
}

async function scheduleMeeting(args: any) {
  console.log('📅 Scheduling meeting:', args);
  return {
    success: true,
    message: `Meeting "${args.title}" wurde geplant mit ${args.participants.join(', ')}`,
    id: `meeting_${Date.now()}`
  };
}