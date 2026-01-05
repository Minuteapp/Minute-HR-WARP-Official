import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base64 in Chunks verarbeiten (Memory-safe)
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  console.log('🎤 === Chat Voice-to-Text Edge Function gestartet ===');
  
  if (req.method === 'OPTIONS') {
    console.log('🎤 CORS Preflight Request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🎤 Verarbeite Request Body...');
    const { audio, user_locale = 'de', detect_intent = false } = await req.json();
    
    if (!audio) {
      console.error('❌ Keine Audio-Daten empfangen');
      throw new Error('No audio data provided');
    }
    console.log('✅ Audio-Daten empfangen, Länge:', audio.length, 'Zeichen');

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY fehlt in den Secrets!');
      throw new Error('OPENAI_API_KEY not configured');
    }
    console.log('✅ OPENAI_API_KEY vorhanden');

    console.log('🎤 Verarbeite Audio für Whisper API...');

    // Base64 zu Binary konvertieren (memory-safe)
    const binaryAudio = processBase64Chunks(audio);
    console.log(`📦 Audio-Größe: ${binaryAudio.length} bytes`);
    
    // FormData für Whisper API erstellen
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', user_locale);

    // An OpenAI Whisper API senden
    console.log('📡 Sende an OpenAI Whisper API...');
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API Fehler:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Transkription erhalten:', result.text);

    // Optional: Intent-Erkennung
    let intent = null;
    if (detect_intent && result.text) {
      // Hier könnte Intent-Erkennung hinzugefügt werden
    }

    return new Response(
      JSON.stringify({ 
        text: result.text,
        intent: intent
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Fehler in chat-voice-to-text:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
