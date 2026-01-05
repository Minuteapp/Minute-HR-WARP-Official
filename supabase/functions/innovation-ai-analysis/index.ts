import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { ideaId, title, description, tags } = await req.json();

    if (!ideaId || !title || !description) {
      throw new Error('Missing required fields: ideaId, title, description');
    }

    console.log('Starting AI analysis for idea:', ideaId);

    // Erstelle Prompt für die KI-Analyse
    const prompt = `
Analysiere die folgende Innovationsidee und bewerte sie objektiv:

Titel: ${title}
Beschreibung: ${description}
Tags: ${tags?.join(', ') || 'Keine'}

Bewerte die Idee anhand folgender Kriterien (jeweils von 1-10):
1. Innovationsgrad (Wie neuartig ist die Idee?)
2. Machbarkeit (Wie realistisch ist die Umsetzung?)
3. Erwarteter Impact (Wie groß ist der potenzielle Nutzen?)
4. Risiko (Wie hoch sind die Risiken? 10 = sehr hohes Risiko, 1 = sehr niedriges Risiko)

Zusätzlich:
- Erstelle eine kurze Empfehlung (max. 500 Zeichen)
- Liste 3-5 Stärken/Vorteile der Idee auf
- Liste 3-5 Herausforderungen/Risiken auf
- Liste 3-5 Chancen/Möglichkeiten auf
- Liste 3-5 Benefits/Nutzen auf

Antworte im folgenden JSON-Format:
{
  "innovation_score": 7,
  "feasibility_score": 8,
  "impact_score": 6,
  "risk_score": 4,
  "confidence_level": 0.85,
  "recommendation": "Kurze Empfehlung zur Umsetzung",
  "pros": ["Vorteil 1", "Vorteil 2", "Vorteil 3"],
  "cons": ["Nachteil 1", "Nachteil 2"],
  "opportunities": ["Chance 1", "Chance 2", "Chance 3"],
  "benefits": ["Nutzen 1", "Nutzen 2", "Nutzen 3"]
}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'Du bist ein KI-Experte für Innovationsanalyse. Du bewertest Ideen objektiv und hilfreich. Antworte immer auf Deutsch und im angeforderten JSON-Format.'
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          details: 'Too many requests. Please try again later.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    // Versuche JSON zu parsen
    let analysisData;
    try {
      // Entferne potentielle Markdown-Formatierung
      const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysisData = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', analysisText);
      throw new Error('Failed to parse AI analysis response');
    }

    // Validiere die erforderlichen Felder
    const requiredFields = ['innovation_score', 'feasibility_score', 'impact_score', 'risk_score'];
    for (const field of requiredFields) {
      if (!(field in analysisData)) {
        throw new Error(`Missing required field in analysis: ${field}`);
      }
    }

    // Stelle sicher, dass Arrays vorhanden sind
    analysisData.pros = analysisData.pros || [];
    analysisData.cons = analysisData.cons || [];
    analysisData.opportunities = analysisData.opportunities || [];
    analysisData.benefits = analysisData.benefits || [];

    // Speichere die Analyse direkt in der innovation_ideas_inbox Tabelle
    const { error: updateError } = await supabase
      .from('innovation_ideas_inbox')
      .update({
        ai_analysis_completed: true,
        ai_innovation_score: analysisData.innovation_score,
        ai_feasibility_score: analysisData.feasibility_score,
        ai_impact_score: analysisData.impact_score,
        ai_risk_score: analysisData.risk_score,
        ai_confidence_level: analysisData.confidence_level || 0.8,
        ai_recommendation: analysisData.recommendation || 'Keine spezifische Empfehlung',
        ai_pros: analysisData.pros,
        ai_cons: analysisData.cons,
        ai_opportunities: analysisData.opportunities,
        ai_benefits: analysisData.benefits,
        ai_analysis_metadata: {
          analyzed_at: new Date().toISOString(),
          model_used: 'gpt-4o-mini',
          prompt_version: '1.0'
        }
      })
      .eq('id', ideaId);

    if (updateError) {
      console.error('Error saving analysis to database:', updateError);
      throw new Error('Failed to save analysis to database');
    }

    console.log('Analysis completed and saved for idea:', ideaId);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Analysis completed and saved',
      analysis: analysisData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in innovation-ai-analysis function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to analyze innovation idea'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});