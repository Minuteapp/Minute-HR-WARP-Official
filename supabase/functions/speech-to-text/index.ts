import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, mimeType } = await req.json();
    
    if (!audio) {
      throw new Error('Keine Audio-Daten bereitgestellt');
    }

    console.log('🎤 Speech-to-Text: Verarbeite Audio-Daten...');
    console.log('📦 MIME-Type:', mimeType || 'audio/webm');

    // Base64 zu Blob konvertieren
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Dateiendung basierend auf MIME-Type
    let extension = 'webm';
    if (mimeType?.includes('mp4')) extension = 'mp4';
    else if (mimeType?.includes('ogg')) extension = 'ogg';
    else if (mimeType?.includes('wav')) extension = 'wav';

    // FormData für Whisper API erstellen
    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: mimeType || 'audio/webm' });
    formData.append('file', audioBlob, `audio.${extension}`);
    formData.append('model', 'whisper-1');
    formData.append('language', 'de');
    formData.append('response_format', 'json');

    console.log('📤 Sende an OpenAI Whisper API...');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Whisper API Fehler:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit erreicht. Bitte versuchen Sie es später erneut.',
          text: ''
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Whisper API Fehler: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Transkription erfolgreich:', data.text);

    return new Response(JSON.stringify({ 
      text: data.text,
      language: 'de'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Fehler in Speech-to-Text:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Transkription fehlgeschlagen';
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      text: ''
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
