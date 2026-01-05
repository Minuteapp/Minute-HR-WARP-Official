import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Du bist ein hilfreicher Wissensassistent für die Unternehmens-Wissensdatenbank.
Deine Aufgabe ist es, Fragen basierend auf den bereitgestellten Artikeln zu beantworten.

Wichtige Regeln:
- Antworte IMMER auf Deutsch
- Beziehe dich auf die bereitgestellten Artikel als Quellen
- Wenn keine relevanten Artikel gefunden wurden, sage das ehrlich
- Halte deine Antworten klar, strukturiert und hilfreich
- Verweise auf spezifische Artikel, wenn du Informationen daraus verwendest`;

const GENERATE_CONTENT_PROMPT = `Du bist ein professioneller Content-Autor für eine Unternehmens-Wissensdatenbank.
Deine Aufgabe ist es, hochwertige, gut strukturierte Artikel zu erstellen.

Wichtige Regeln:
- Schreibe IMMER auf Deutsch
- Verwende Markdown-Formatierung
- Strukturiere den Artikel mit Überschriften (##, ###)
- Füge praktische Tipps und Beispiele ein
- Halte den Ton professionell aber verständlich
- Erstelle wenn sinnvoll eine FAQ-Sektion am Ende
- Hebe wichtige Hinweise hervor`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { mode = 'chat', question, conversationHistory = [], title, category, keywords } = body;

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API-Key ist nicht konfiguriert' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode: generateContent - Artikel-Content generieren
    if (mode === 'generateContent') {
      if (!title) {
        return new Response(
          JSON.stringify({ error: 'Titel ist erforderlich für die Content-Generierung' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Generating content for:', title, category, keywords);

      const userPrompt = `Erstelle einen umfassenden Artikel für die Unternehmens-Wissensdatenbank mit folgendem Titel:

**Titel:** ${title}
${category ? `**Kategorie:** ${category}` : ''}
${keywords ? `**Stichpunkte/Keywords:** ${keywords}` : ''}

Erstelle einen vollständigen, gut strukturierten Artikel mit:
1. Einer kurzen Einleitung
2. Hauptinhalt mit mehreren Abschnitten
3. Praktischen Tipps oder Beispielen
4. Ggf. einer FAQ-Sektion
5. Einem kurzen Fazit

Der Artikel sollte informativ, hilfreich und leicht verständlich sein.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: GENERATE_CONTENT_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ error: 'Fehler bei der KI-Generierung' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      console.log('Content generated successfully');

      return new Response(
        JSON.stringify({ content: generatedContent }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode: chat - Standard-Chat-Funktion
    if (!question || typeof question !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Frage ist erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract keywords from the question for search
    const searchKeywords = question
      .toLowerCase()
      .replace(/[?!.,;:]/g, '')
      .split(' ')
      .filter((word: string) => word.length > 2);

    console.log('Searching for keywords:', searchKeywords);

    // Search for relevant articles
    let articlesQuery = supabase
      .from('knowledge_articles')
      .select('id, title, content, summary, category, tags, status')
      .eq('status', 'published')
      .limit(5);

    // Build OR conditions for keyword search
    if (searchKeywords.length > 0) {
      const orConditions = searchKeywords
        .slice(0, 5) // Limit to 5 keywords
        .map((keyword: string) => `title.ilike.%${keyword}%,content.ilike.%${keyword}%,summary.ilike.%${keyword}%`)
        .join(',');
      
      articlesQuery = articlesQuery.or(orConditions);
    }

    const { data: articles, error: dbError } = await articlesQuery;

    if (dbError) {
      console.error('Database error:', dbError);
    }

    console.log(`Found ${articles?.length || 0} relevant articles`);

    // Build context from found articles
    let contextText = '';
    const sources: Array<{ id: string; title: string; category: string }> = [];

    if (articles && articles.length > 0) {
      contextText = 'Hier sind die relevanten Artikel aus der Wissensdatenbank:\n\n';
      
      articles.forEach((article: any, index: number) => {
        contextText += `--- Artikel ${index + 1}: "${article.title}" ---\n`;
        contextText += `Kategorie: ${article.category || 'Allgemein'}\n`;
        if (article.summary) {
          contextText += `Zusammenfassung: ${article.summary}\n`;
        }
        contextText += `Inhalt: ${article.content?.substring(0, 1500) || 'Kein Inhalt verfügbar'}\n\n`;
        
        sources.push({
          id: article.id,
          title: article.title,
          category: article.category || 'Allgemein'
        });
      });
    } else {
      contextText = 'Es wurden keine passenden Artikel in der Wissensdatenbank gefunden. Bitte informiere den Benutzer darüber und biete an, einen neuen Artikel zu erstellen.';
    }

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: contextText },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: question }
    ];

    console.log('Calling OpenAI API...');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Fehler bei der KI-Anfrage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('OpenAI response received successfully');

    return new Response(
      JSON.stringify({ 
        answer: aiResponse,
        sources: sources
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in knowledge-hub-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unbekannter Fehler' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
