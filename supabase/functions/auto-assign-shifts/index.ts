import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// KI-Provider konfigurieren
function getAIConfig(): { url: string; headers: Record<string, string>; model: string } | null {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const openrouterKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (openaiKey) {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      model: 'gpt-4o-mini'
    };
  } else if (openrouterKey) {
    return {
      url: 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('SUPABASE_URL') || 'https://localhost',
      },
      model: 'openai/gpt-4o-mini'
    };
  }
  
  return null; // Keine KI konfiguriert
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate, shiftTypeIds, department, useAI = true } = await req.json();
    
    console.log('Automatische Zuweisung gestartet:', { startDate, endDate, shiftTypeIds, department, useAI });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Schichttypen laden
    const { data: shiftTypes, error: shiftTypesError } = await supabase
      .from('shift_types')
      .select('*')
      .eq('is_active', true)
      .in('id', shiftTypeIds || []);

    if (shiftTypesError) {
      console.error('Fehler beim Laden der Schichttypen:', shiftTypesError);
      throw shiftTypesError;
    }

    // Mitarbeiter laden
    const employeesQuery = supabase
      .from('employees')
      .select('*')
      .eq('status', 'active');
    
    if (department && department !== 'Alle') {
      employeesQuery.eq('department', department);
    }

    const { data: employees, error: employeesError } = await employeesQuery;

    if (employeesError) {
      console.error('Fehler beim Laden der Mitarbeiter:', employeesError);
      throw employeesError;
    }

    // Bestehende Schichten im Zeitraum laden
    const { data: existingShifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (shiftsError) {
      console.error('Fehler beim Laden bestehender Schichten:', shiftsError);
      throw shiftsError;
    }

    console.log(`Gefunden: ${shiftTypes?.length || 0} Schichttypen, ${employees?.length || 0} Mitarbeiter, ${existingShifts?.length || 0} bestehende Schichten`);

    // KI-gestützte Zuweisung wenn verfügbar
    const aiConfig = useAI ? getAIConfig() : null;
    let aiReasoning: any = null;

    // Automatische Zuweisung durchführen
    const assignedShifts: any[] = [];
    const conflicts: any[] = [];
    const explanations: any[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      for (const shiftType of (shiftTypes || [])) {
        const existingForType = (existingShifts || []).filter((s: any) => 
          s.date === dateStr && s.shift_type_id === shiftType.id
        );

        const neededStaff = shiftType.required_staff - existingForType.length;

        if (neededStaff <= 0) continue;

        // Verfügbare Mitarbeiter filtern
        const availableEmployees = (employees || []).filter((emp: any) => {
          const hasShiftThisDay = (existingShifts || []).some((s: any) => 
            s.date === dateStr && s.employee_id === emp.id
          );
          return !hasShiftThisDay;
        });

        // Bewertung mit oder ohne KI
        let scoredEmployees: Array<{ employee: any; score: number; reasoning: string }> = [];

        if (aiConfig && availableEmployees.length > 0) {
          // KI-gestützte Bewertung
          try {
            const aiResponse = await fetch(aiConfig.url, {
              method: 'POST',
              headers: aiConfig.headers,
              body: JSON.stringify({
                model: aiConfig.model,
                messages: [
                  { 
                    role: 'system', 
                    content: `Du bist ein Schichtplanungs-Experte. Bewerte Mitarbeiter für eine Schicht.
Antworte NUR mit einem JSON-Array im Format:
[{"employee_id": "<id>", "score": <0-100>, "reasoning": "<Begründung>"}]`
                  },
                  { 
                    role: 'user', 
                    content: `Bewerte diese Mitarbeiter für die Schicht "${shiftType.name}" am ${dateStr}:
${availableEmployees.slice(0, 10).map((e: any) => `- ${e.name} (${e.position || 'keine Position'}, Abteilung: ${e.department || 'keine'})`).join('\n')}

Schicht-Details: ${shiftType.start_time} - ${shiftType.end_time}, Beschreibung: ${shiftType.description || 'keine'}`
                  }
                ],
                temperature: 0.3,
                max_tokens: 500
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const aiContent = aiData.choices?.[0]?.message?.content;
              
              try {
                const jsonMatch = aiContent?.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                  const aiScores = JSON.parse(jsonMatch[0]);
                  scoredEmployees = availableEmployees.map((emp: any) => {
                    const aiScore = aiScores.find((s: any) => s.employee_id === emp.id);
                    return {
                      employee: emp,
                      score: aiScore?.score || calculateLocalScore(emp, shiftType, dateStr),
                      reasoning: aiScore?.reasoning || 'Lokale Bewertung'
                    };
                  });
                }
              } catch (parseError) {
                console.error('KI-Parsing Fehler:', parseError);
              }
            }
          } catch (aiError) {
            console.error('KI-Anfrage Fehler:', aiError);
          }
        }

        // Fallback: Lokale Bewertung
        if (scoredEmployees.length === 0) {
          scoredEmployees = availableEmployees.map((emp: any) => ({
            employee: emp,
            score: calculateLocalScore(emp, shiftType, dateStr),
            reasoning: generateLocalReasoning(emp, shiftType, dateStr)
          }));
        }

        // Nach Score sortieren
        scoredEmployees.sort((a, b) => b.score - a.score);

        // Beste Mitarbeiter zuweisen
        const toAssign = Math.min(neededStaff, scoredEmployees.length);
        
        for (let i = 0; i < toAssign; i++) {
          const { employee, score, reasoning } = scoredEmployees[i];
          
          const newShift = {
            employee_id: employee.id,
            shift_type_id: shiftType.id,
            date: dateStr,
            start_time: `${dateStr}T${shiftType.start_time}:00Z`,
            end_time: `${dateStr}T${shiftType.end_time}:00Z`,
            status: 'scheduled',
            notes: `Auto-Zuweisung (Score: ${score})`
          };

          assignedShifts.push(newShift);
          existingShifts?.push(newShift);
          
          explanations.push({
            employee_name: employee.name,
            shift_type: shiftType.name,
            date: dateStr,
            score,
            reasoning,
            ai_used: !!aiConfig
          });
        }

        if (toAssign < neededStaff) {
          conflicts.push({
            date: dateStr,
            shiftType: shiftType.name,
            needed: neededStaff,
            assigned: toAssign,
            missing: neededStaff - toAssign
          });
        }
      }
    }

    // Schichten in DB speichern
    if (assignedShifts.length > 0) {
      const { error: insertError } = await supabase
        .from('shifts')
        .insert(assignedShifts);

      if (insertError) {
        console.error('Fehler beim Einfügen:', insertError);
        throw insertError;
      }
    }

    // Audit-Log
    if (employees?.[0]?.company_id) {
      try {
        await supabase.from('ai_gateway_audit_log').insert({
          company_id: employees[0].company_id,
          user_id: 'system',
          module: 'shift_planning',
          action_type: 'auto_assign',
          model_used: aiConfig?.model || 'local',
          status: 'success',
          prompt_summary: `Auto-Zuweisung: ${assignedShifts.length} Schichten`,
          response_summary: JSON.stringify({ assigned: assignedShifts.length, conflicts: conflicts.length })
        });
      } catch (auditError) {
        console.error('Audit-Log Fehler:', auditError);
      }
    }

    const result = {
      success: true,
      assignedShifts: assignedShifts.length,
      conflicts: conflicts.length,
      conflictDetails: conflicts,
      explanations: explanations.slice(0, 20), // Erste 20 Erklärungen
      aiUsed: !!aiConfig,
      message: `${assignedShifts.length} Schichten zugewiesen${conflicts.length > 0 ? `, ${conflicts.length} Konflikte` : ''}`
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    console.error('Fehler in auto-assign-shifts:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Lokale Score-Berechnung
function calculateLocalScore(employee: any, shiftType: any, date: string): number {
  let score = 50; // Basis-Score

  // Abteilungs-Match
  if (employee.department === shiftType.description) {
    score += 20;
  }

  // Positions-Match
  if (employee.position && shiftType.description?.includes(employee.position)) {
    score += 15;
  }

  // Wochenend-Malus
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    score -= 10;
  }

  // Zufallsfaktor für Fairness
  score += Math.random() * 10 - 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// Lokale Begründung generieren
function generateLocalReasoning(employee: any, shiftType: any, date: string): string {
  const reasons: string[] = [];

  if (employee.department === shiftType.description) {
    reasons.push('Passende Abteilung');
  }

  if (employee.position) {
    reasons.push(`Position: ${employee.position}`);
  }

  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    reasons.push('Wochenendschicht');
  }

  return reasons.length > 0 ? reasons.join(', ') : 'Verfügbarer Mitarbeiter';
}
