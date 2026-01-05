import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  let payload: any = {};
  try {
    if (req.method === 'GET') {
      payload = {
        from: url.searchParams.get('from') ?? undefined,
        to: url.searchParams.get('to') ?? undefined,
        role: url.searchParams.get('role') ?? undefined,
        scope: url.searchParams.get('scope') ?? undefined,
        eventType: url.searchParams.getAll('eventType') ?? [],
      };
    } else {
      payload = await req.json().catch(() => ({}));
    }
  } catch (_) {}

  const from: string | undefined = payload.from;
  const to: string | undefined = payload.to;
  const eventType: string[] | string | undefined = payload.eventType;

  const typeList: string[] = Array.isArray(eventType)
    ? eventType
    : typeof eventType === 'string' && eventType.length > 0
      ? eventType.split(',').map((t) => t.trim())
      : [];

  const includeAbsence = typeList.length === 0 || typeList.includes('absence') || typeList.includes('sicknote');
  const includeInternal = typeList.length === 0 || typeList.includes('internal') || typeList.includes('meeting') || typeList.includes('other');
  const includeHoliday = typeList.length === 0 || typeList.includes('holiday');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const events: any[] = [];

  try {
    // Abwesenheitsanträge (absence_requests)
    if (includeAbsence) {
      const arQuery = supabase
        .from('absence_requests')
        .select('id, start_date, end_date, type, status, reason, employee_name, start_time, end_time, half_day');

      if (from) arQuery.lte('start_date', to ?? from);
      if (to) arQuery.gte('end_date', from ?? to);

      const { data: absReq, error: arErr } = await arQuery;
      if (arErr) {
        console.error('absence_requests error', arErr);
      } else if (absReq) {
        for (const r of absReq) {
          const isSick = r?.type === 'sick_leave' || r?.type === 'sicknote';
          events.push({
            id: `absence-${r.id}`,
            title: isSick ? 'Krankheit' : 'Abwesenheit',
            start: r?.start_time ? `${r.start_date}T${r.start_time}` : new Date(r.start_date).toISOString(),
            end: r?.end_time ? `${r.end_date}T${r.end_time}` : new Date(new Date(r.end_date).setHours(23,59,59,999)).toISOString(),
            isAllDay: !r?.start_time,
            type: isSick ? 'sicknote' : 'absence',
            description: r?.reason ?? '',
            participants: [],
            status: r?.status ?? undefined,
          });
        }
      }

      // Absences (vereinfachte Events)
      const absQuery = supabase
        .from('absences')
        .select('id, start_date, end_date, status, notes');

      if (from) absQuery.lte('start_date', to ?? from);
      if (to) absQuery.gte('end_date', from ?? to);

      const { data: abs, error: absErr } = await absQuery;
      if (absErr) {
        console.error('absences error', absErr);
      } else if (abs) {
        for (const a of abs) {
          events.push({
            id: `abs-${a.id}`,
            title: 'Abwesenheit',
            start: a.start_date,
            end: a.end_date,
            isAllDay: true,
            type: 'absence',
            description: a?.notes ?? '',
            participants: [],
            status: a?.status ?? undefined,
          });
        }
      }
    }

    // Interne Kalendereinträge (calendar_events)
    if (includeInternal) {
      const ceQuery = supabase
        .from('calendar_events')
        .select('id, title, start_time, end_time, is_all_day, type, location, description, color');

      if (from) ceQuery.gte('start_time', from);
      if (to) ceQuery.lte('start_time', to);

      const { data: ce, error: ceErr } = await ceQuery;
      if (ceErr) {
        console.error('calendar_events error', ceErr);
      } else if (ce) {
        for (const e of ce) {
          events.push({
            id: e.id,
            title: e.title,
            start: e.start_time,
            end: e.end_time,
            isAllDay: e?.is_all_day ?? false,
            type: e?.type ?? 'other',
            location: e?.location ?? '',
            description: e?.description ?? '',
            color: e?.color ?? undefined,
          });
        }
      }
    }

    // Feiertage
    if (includeHoliday && from && to) {
      const fromDate = from.slice(0, 10);
      const toDate = to.slice(0, 10);
      const hQuery = supabase
        .from('calendar_holidays')
        .select('id, name, date, is_public_holiday')
        .gte('date', fromDate)
        .lte('date', toDate);

      const { data: holidays, error: hErr } = await hQuery;
      if (hErr) {
        console.error('calendar_holidays error', hErr);
      } else if (holidays) {
        for (const h of holidays) {
          events.push({
            id: `holiday-${h.id}`,
            title: h.name,
            start: `${h.date}T00:00:00.000Z`,
            end: `${h.date}T23:59:59.999Z`,
            isAllDay: true,
            type: 'holiday',
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ events }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (e) {
    console.error('calendar-events fatal error', e);
    return new Response(
      JSON.stringify({ error: 'internal_error', message: String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
