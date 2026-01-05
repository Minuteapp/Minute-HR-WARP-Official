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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { goal, type } = await req.json();
    console.log('Received request:', { goal, type });

    if (!goal || typeof goal !== 'string') {
      throw new Error('Goal is required and must be a string');
    }

    const systemPrompt = `Du bist ein Experte für HR-Umfragen und Mitarbeiterbefragungen. 
Du erstellst professionelle, aussagekräftige Umfragefragen basierend auf dem Ziel des Nutzers.
Erstelle Fragen, die:
- Klar und verständlich formuliert sind
- Verschiedene Kategorien abdecken
- Eine Mischung aus quantitativen (Likert-Skala) und qualitativen (Freitext) Fragen enthalten
- Praxisrelevant und umsetzbar sind
- In deutscher Sprache verfasst sind`;

    const userPrompt = `Erstelle 5-7 professionelle Umfragefragen zum folgenden Ziel:

"${goal}"

Erstelle die Fragen im folgenden JSON-Format und gib NUR das JSON zurück, keine anderen Texte:
{
  "questions": [
    {
      "id": "1",
      "question": "Die Frage",
      "category": "Kategorie",
      "type": "Likert 1-5 oder Freitext",
      "rationale": "Kurze Begründung warum diese Frage wichtig ist"
    }
  ]
}`;

    console.log('Calling Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Bitte versuchen Sie es später erneut.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Zahlungserforderlich. Bitte fügen Sie Credits zu Ihrem Lovable Workspace hinzu.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let questions;
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log('Successfully generated questions:', questions);

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in pulse-survey-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
