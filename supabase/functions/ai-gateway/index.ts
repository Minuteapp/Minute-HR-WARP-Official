// AI Gateway - Zentrale KI-Verwaltung für alle Module
// Deployed via GitHub Actions on 2026-01-05
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OpenRouter API Konfiguration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Standardisierte Antwortstruktur
interface AIResponse {
  summary: string;
  explanation: string;
  suggested_actions?: Array<{
    action: string;
    description: string;
    link?: string;
  }>;
  links_to_ui?: Array<{
    label: string;
    path: string;
  }>;
  data_sources: Array<{
    module: string;
    description: string;
    time_period?: string;
  }>;
  confidence: 'high' | 'medium' | 'low';
  limitations?: string[];
}

interface AIRequest {
  module: string;
  action_type: string;
  prompt: string;
  context?: Record<string, any>;
  data_sources?: Array<{
    module: string;
    description: string;
    time_period?: string;
  }>;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Auth Header extrahieren
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Nicht autorisiert' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // User verifizieren
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Ungültiges Token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Request Body parsen
    const requestBody: AIRequest = await req.json();
    const { module, action_type, prompt, context, data_sources } = requestBody;

    console.log(`AI Gateway Request - User: ${user.id}, Module: ${module}, Action: ${action_type}`);

    // Company ID des Users ermitteln
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (empError || !employee) {
      console.error('Employee not found:', empError);
      return new Response(
        JSON.stringify({ error: 'Mitarbeiter nicht gefunden' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const companyId = employee.company_id;

    // KI-Gateway-Konfiguration laden
    let { data: config, error: configError } = await supabase
      .from('ai_gateway_config')
      .select('*')
      .eq('company_id', companyId)
      .single();

    // Falls keine Konfiguration existiert, Standardwerte verwenden
    if (configError || !config) {
      console.log('No AI config found, using defaults');
      config = {
        ai_mode: 'disabled',
        default_model: 'openai/gpt-4o-mini',
        fallback_model: 'openai/gpt-3.5-turbo',
        monthly_budget_cents: 10000,
        current_month_usage_cents: 0,
        max_tokens_per_request: 4000,
        budget_warning_threshold: 80,
        enabled_modules: [],
        require_user_confirmation: true,
        allow_data_storage: false
      };
    }

    // 1. PRÜFUNG: KI-Modus
    if (config.ai_mode === 'disabled') {
      return new Response(
        JSON.stringify({ 
          error: 'KI ist für diesen Mandanten deaktiviert',
          code: 'AI_DISABLED'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. PRÜFUNG: Modul-Berechtigung
    if (config.enabled_modules && config.enabled_modules.length > 0) {
      if (!config.enabled_modules.includes(module)) {
        return new Response(
          JSON.stringify({ 
            error: `KI ist für das Modul "${module}" nicht aktiviert`,
            code: 'MODULE_NOT_ENABLED'
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 3. PRÜFUNG: Budget
    const budgetUsagePercent = (config.current_month_usage_cents / config.monthly_budget_cents) * 100;
    if (budgetUsagePercent >= 100) {
      return new Response(
        JSON.stringify({ 
          error: 'Monatliches KI-Budget erschöpft',
          code: 'BUDGET_EXCEEDED',
          budget_info: {
            used: config.current_month_usage_cents,
            limit: config.monthly_budget_cents
          }
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Budget-Warnung
    let budgetWarning = null;
    if (budgetUsagePercent >= config.budget_warning_threshold) {
      budgetWarning = {
        message: `KI-Budget zu ${Math.round(budgetUsagePercent)}% verbraucht`,
        used: config.current_month_usage_cents,
        limit: config.monthly_budget_cents
      };
    }

    // Audit Log erstellen (pending)
    const { data: auditEntry, error: auditError } = await supabase
      .from('ai_gateway_audit_log')
      .insert({
        company_id: companyId,
        user_id: user.id,
        module: module,
        action_type: action_type,
        prompt_summary: prompt.substring(0, 200), // Nur gekürzt speichern
        data_sources: data_sources || [],
        status: 'pending'
      })
      .select()
      .single();

    if (auditError) {
      console.error('Audit log error:', auditError);
    }

    // OpenRouter API Key - zuerst tenant-spezifisch, dann global
    let apiKey = config.openrouter_api_key;
    if (!apiKey) {
      apiKey = Deno.env.get('OPENROUTER_API_KEY');
    }

    if (!apiKey) {
      console.error('No OpenRouter API key configured');
      return new Response(
        JSON.stringify({ 
          error: 'Kein OpenRouter API-Key konfiguriert',
          code: 'NO_API_KEY'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // System-Prompt für strukturierte, erklärbare Antworten
    const systemPrompt = `Du bist der KI-Assistent der HR-Software "Minute HR". 

WICHTIGE REGELN:
1. Du erklärst und unterstützt - du entscheidest NICHT
2. Du darfst KEINE Daten ändern oder Prozesse ausführen
3. Jede Empfehlung muss begründet werden
4. Nenne immer deine Datenquellen und eventuelle Einschränkungen

KI-MODUS: ${config.ai_mode === 'readonly' ? 'Nur Erklärungen (keine Vorschläge für Aktionen)' : 'Vorschläge erlaubt (keine automatische Ausführung)'}

Antworte IMMER im folgenden JSON-Format:
{
  "summary": "Kurze Zusammenfassung (max 2 Sätze)",
  "explanation": "Ausführliche Erklärung mit Begründung",
  "suggested_actions": [
    {
      "action": "Name der Aktion",
      "description": "Was diese Aktion bewirkt",
      "link": "/pfad/in/der/app (optional)"
    }
  ],
  "links_to_ui": [
    {
      "label": "Link-Beschreibung",
      "path": "/pfad/zur/seite"
    }
  ],
  "data_sources": [
    {
      "module": "Modulname",
      "description": "Welche Daten wurden verwendet",
      "time_period": "Zeitraum der Daten (falls relevant)"
    }
  ],
  "confidence": "high|medium|low",
  "limitations": ["Eventuelle Einschränkungen oder Unsicherheiten"]
}

${config.ai_mode === 'readonly' ? 'WICHTIG: Gib KEINE suggested_actions aus, da der Modus auf "nur erklärend" steht.' : ''}`;

    // Kontext für den Prompt aufbereiten
    let fullPrompt = prompt;
    if (context) {
      fullPrompt += `\n\nKontext:\n${JSON.stringify(context, null, 2)}`;
    }
    if (data_sources) {
      fullPrompt += `\n\nVerwendete Datenquellen:\n${JSON.stringify(data_sources, null, 2)}`;
    }

    // OpenRouter API aufrufen
    let modelToUse = config.default_model || 'openai/gpt-4o-mini';
    let response;
    let useFallback = false;

    try {
      console.log(`Calling OpenRouter with model: ${modelToUse}`);
      response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://minute-hr.app',
          'X-Title': 'Minute HR'
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullPrompt }
          ],
          max_tokens: config.max_tokens_per_request || 4000,
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        console.log(`Primary model failed, trying fallback: ${config.fallback_model}`);
        useFallback = true;
        modelToUse = config.fallback_model || 'openai/gpt-3.5-turbo';
        
        response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://minute-hr.app',
            'X-Title': 'Minute HR'
          },
          body: JSON.stringify({
            model: modelToUse,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: fullPrompt }
            ],
            max_tokens: config.max_tokens_per_request || 4000,
            temperature: 0.7
          })
        });
      }
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unbekannter Fehler';
      console.error('OpenRouter fetch error:', errorMessage);
      
      // Audit Log aktualisieren
      if (auditEntry) {
        await supabase
          .from('ai_gateway_audit_log')
          .update({
            status: 'error',
            error_message: errorMessage,
            response_at: new Date().toISOString()
          })
          .eq('id', auditEntry.id);
      }

      return new Response(
        JSON.stringify({ error: 'Fehler bei der KI-Anfrage', details: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter error:', errorText);
      
      // Audit Log aktualisieren
      if (auditEntry) {
        await supabase
          .from('ai_gateway_audit_log')
          .update({
            status: 'error',
            error_message: errorText,
            response_at: new Date().toISOString()
          })
          .eq('id', auditEntry.id);
      }

      return new Response(
        JSON.stringify({ error: 'OpenRouter API-Fehler', details: errorText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenRouter response received');

    // Token-Verbrauch und Kosten berechnen
    const tokensInput = data.usage?.prompt_tokens || 0;
    const tokensOutput = data.usage?.completion_tokens || 0;
    // Ungefähre Kosten (0.5 Cent pro 1K Tokens als Schätzung)
    const costCents = Math.ceil((tokensInput + tokensOutput) / 1000 * 0.5);

    // KI-Antwort parsen
    let aiResponse: AIResponse;
    try {
      const content = data.choices[0]?.message?.content || '';
      aiResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback: Rohe Antwort strukturieren
      aiResponse = {
        summary: 'KI-Antwort erhalten',
        explanation: data.choices[0]?.message?.content || 'Keine Antwort',
        data_sources: data_sources || [],
        confidence: 'low',
        limitations: ['Die Antwort konnte nicht strukturiert werden']
      };
    }

    // Audit Log aktualisieren
    if (auditEntry) {
      await supabase
        .from('ai_gateway_audit_log')
        .update({
          status: 'success',
          model_used: modelToUse,
          tokens_input: tokensInput,
          tokens_output: tokensOutput,
          cost_cents: costCents,
          response_summary: aiResponse.summary,
          response_at: new Date().toISOString()
        })
        .eq('id', auditEntry.id);
    }

    // Budget aktualisieren
    await supabase
      .from('ai_gateway_config')
      .update({
        current_month_usage_cents: config.current_month_usage_cents + costCents
      })
      .eq('company_id', companyId);

    // Monatliche Nutzung aktualisieren
    const yearMonth = new Date().toISOString().substring(0, 7);
    const { data: existingUsage } = await supabase
      .from('ai_usage_monthly')
      .select('*')
      .eq('company_id', companyId)
      .eq('year_month', yearMonth)
      .single();

    if (existingUsage) {
      const requestsByModule = existingUsage.requests_by_module || {};
      requestsByModule[module] = (requestsByModule[module] || 0) + 1;
      
      const requestsByUser = existingUsage.requests_by_user || {};
      requestsByUser[user.id] = (requestsByUser[user.id] || 0) + 1;

      await supabase
        .from('ai_usage_monthly')
        .update({
          total_requests: existingUsage.total_requests + 1,
          total_tokens_input: existingUsage.total_tokens_input + tokensInput,
          total_tokens_output: existingUsage.total_tokens_output + tokensOutput,
          total_cost_cents: existingUsage.total_cost_cents + costCents,
          requests_by_module: requestsByModule,
          requests_by_user: requestsByUser
        })
        .eq('id', existingUsage.id);
    } else {
      await supabase
        .from('ai_usage_monthly')
        .insert({
          company_id: companyId,
          year_month: yearMonth,
          total_requests: 1,
          total_tokens_input: tokensInput,
          total_tokens_output: tokensOutput,
          total_cost_cents: costCents,
          requests_by_module: { [module]: 1 },
          requests_by_user: { [user.id]: 1 }
        });
    }

    // Erfolgreiche Antwort
    return new Response(
      JSON.stringify({
        success: true,
        response: aiResponse,
        meta: {
          model_used: modelToUse,
          used_fallback: useFallback,
          tokens: {
            input: tokensInput,
            output: tokensOutput
          },
          ai_mode: config.ai_mode,
          require_confirmation: config.require_user_confirmation,
          budget_warning: budgetWarning
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    console.error('AI Gateway error:', errorMessage);
    return new Response(
      JSON.stringify({ error: 'Interner Fehler im KI-Gateway', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
