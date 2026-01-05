
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: "Text ist erforderlich" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API-Schlüssel nicht konfiguriert" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const prompt = `Identifiziere die Sprache des folgenden Textes und gib den ISO 639-1 Sprachcode zurück (z.B. 'de' für Deutsch, 'en' für Englisch). Gib nur den Sprachcode zurück, nichts anderes:

      "${text}"`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-2025-08-07",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 10
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API Fehler:", data);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded", details: "Too many requests. Please try again later." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Fehler bei der Spracherkennung", details: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    const languageCode = data.choices[0].message.content.trim().toLowerCase();

    return new Response(
      JSON.stringify({ 
        languageCode, 
        languageName: getLanguageName(languageCode)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fehler bei der Verarbeitung:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: "Interner Serverfehler", details: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Hilfsfunktion zur Konvertierung des Sprachcodes in einen Sprachnamen
function getLanguageName(languageCode: string): string {
  const languages: Record<string, string> = {
    "de": "Deutsch",
    "en": "Englisch",
    "fr": "Französisch",
    "es": "Spanisch",
    "it": "Italienisch",
    "nl": "Niederländisch",
    "pt": "Portugiesisch",
    "ru": "Russisch",
    "zh": "Chinesisch",
    "ja": "Japanisch",
    "ko": "Koreanisch",
    "ar": "Arabisch",
    "hi": "Hindi",
    "tr": "Türkisch",
    "pl": "Polnisch",
    "cs": "Tschechisch",
    "sv": "Schwedisch",
    "da": "Dänisch",
    "fi": "Finnisch",
    "el": "Griechisch",
    "hu": "Ungarisch",
    "ro": "Rumänisch",
    "th": "Thailändisch",
    "vi": "Vietnamesisch",
    "uk": "Ukrainisch",
    "bg": "Bulgarisch",
    "hr": "Kroatisch",
    "sr": "Serbisch",
    "sk": "Slowakisch",
    "sl": "Slowenisch"
  };
  
  return languages[languageCode] || "Unbekannte Sprache";
}
