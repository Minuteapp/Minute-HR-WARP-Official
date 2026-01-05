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
    const { text, targetLanguage } = await req.json();
    
    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: "Text und Zielsprache sind erforderlich" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API-Schlüssel nicht konfiguriert" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const languageNames: Record<string, string> = {
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
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `Du bist ein professioneller Übersetzer. Übersetze den gegebenen Text ins ${targetLangName}. Gib NUR den übersetzten Text zurück, ohne zusätzliche Erklärungen, Anführungszeichen oder Formatierung.`
          },
          { 
            role: "user", 
            content: text 
          }
        ],
      })
    });

    if (!response.ok) {
      console.error("Lovable AI API Fehler:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit überschritten. Bitte versuchen Sie es später erneut." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "API-Guthaben aufgebraucht. Bitte laden Sie Ihr Guthaben auf." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Fehler bei der Übersetzung" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
      );
    }

    const data = await response.json();
    const translatedText = data.choices[0].message.content.trim();

    console.log(`[translate-text] Übersetzt nach ${targetLangName}: "${text.substring(0, 50)}..." -> "${translatedText.substring(0, 50)}..."`);

    return new Response(
      JSON.stringify({ translatedText, targetLanguage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fehler bei der Verarbeitung:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return new Response(
      JSON.stringify({ error: "Interner Serverfehler", details: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
