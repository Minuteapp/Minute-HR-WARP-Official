import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Verify superadmin status
async function verifySuperadmin(authHeader: string | null): Promise<{ userId: string; error?: string }> {
  if (!authHeader) {
    return { userId: '', error: 'No authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !user) {
    return { userId: '', error: 'Invalid token' }
  }

  const { data: isSuperadmin } = await supabaseAdmin.rpc('is_superadmin', { user_id: user.id })
  
  if (!isSuperadmin) {
    return { userId: '', error: 'Not a superadmin' }
  }

  return { userId: user.id }
}

// Types
interface InventoryAction {
  name: string
  module: string
  entity_type: string
  has_event: boolean
  event_names: string[]
  effect_count: number
  triggerable_by_roles: string[]
  verification_status: 'verified' | 'unverified' | 'no_event'
}

interface InventorySetting {
  key: string
  module: string
  label: string
  data_type: string
  enforcement_points: string[]
  has_enforcement: boolean
  is_defect: boolean
}

interface InventoryEvent {
  name: string
  action_name: string
  module: string
  effects: string[]
  producer_count: number
}

interface InventoryEffect {
  name: string
  category: string
  trigger_events: string[]
  is_async: boolean
  is_active: boolean
}

interface InventoryTrigger {
  name: string
  type: 'database' | 'automation' | 'scheduled'
  table_or_schedule: string
  condition: string
  consequence: string
  is_active: boolean
}

interface InventoryDefect {
  id: string
  type: string
  severity: 'P0' | 'P1' | 'P2'
  component_type: string
  component_name: string
  description: string
  suggested_fix?: string
}

interface SystemInventory {
  generated_at: string
  version: string
  scan_duration_ms: number
  summary: {
    total_actions: number
    actions_with_events: number
    actions_without_events: number
    total_settings: number
    settings_enforced: number
    settings_unenforced: number
    total_events: number
    total_effects: number
    total_triggers: number
    total_permissions: number
    defects_p0: number
    defects_p1: number
    defects_p2: number
    unverified_count: number
  }
  actions: InventoryAction[]
  settings: InventorySetting[]
  events: InventoryEvent[]
  effects: InventoryEffect[]
  triggers: InventoryTrigger[]
  permissions: { role: string; permissions: string[] }[]
  defects: InventoryDefect[]
  unverified: { component: string; reason: string }[]
}

// Scanner Functions
async function scanActions(): Promise<{ actions: InventoryAction[], defects: InventoryDefect[] }> {
  const { data: registryActions, error } = await supabaseAdmin
    .from('action_registry')
    .select('*')
    .eq('is_active', true)
    .order('module', { ascending: true })

  if (error || !registryActions) {
    console.error('Error scanning actions:', error)
    return { actions: [], defects: [] }
  }

  // Get impact matrix mappings
  const { data: impactMappings } = await supabaseAdmin
    .from('impact_matrix')
    .select('action_name, effect_type, is_active')
    .eq('is_active', true)

  const impactByAction = new Map<string, string[]>()
  impactMappings?.forEach(m => {
    const effects = impactByAction.get(m.action_name) || []
    effects.push(m.effect_type)
    impactByAction.set(m.action_name, effects)
  })

  // Get action-event mappings
  const { data: eventMappings } = await supabaseAdmin
    .from('action_event_mappings')
    .select('action_name, event_name, verification_status')

  const eventsByAction = new Map<string, { events: string[], status: string }>()
  eventMappings?.forEach(m => {
    const existing = eventsByAction.get(m.action_name) || { events: [], status: 'unverified' }
    if (m.event_name) existing.events.push(m.event_name)
    existing.status = m.verification_status
    eventsByAction.set(m.action_name, existing)
  })

  const actions: InventoryAction[] = []
  const defects: InventoryDefect[] = []

  for (const action of registryActions) {
    const effects = impactByAction.get(action.action_name) || []
    const eventData = eventsByAction.get(action.action_name)
    const hasEvent = effects.length > 0 || (eventData?.events.length || 0) > 0

    const inventoryAction: InventoryAction = {
      name: action.action_name,
      module: action.module,
      entity_type: action.entity_type,
      has_event: hasEvent,
      event_names: eventData?.events || [],
      effect_count: effects.length,
      triggerable_by_roles: action.triggerable_by_roles || [],
      verification_status: eventData?.status as any || (hasEvent ? 'unverified' : 'no_event')
    }

    actions.push(inventoryAction)

    // Create defect for actions without events
    if (!hasEvent) {
      defects.push({
        id: `action_no_event_${action.action_name}`,
        type: 'missing_event',
        severity: 'P1',
        component_type: 'action',
        component_name: action.action_name,
        description: `Action "${action.action_name}" in Modul "${action.module}" hat kein Event oder Effect-Mapping. Es wird keine Aktion im Event-System ausgelöst.`,
        suggested_fix: `Füge emitEvent('${action.entity_type}.${action.action_name.split('.').pop()}', payload) im Handler hinzu oder markiere als "NoOpRecorded" wenn kein Event benötigt wird.`
      })
    }
  }

  return { actions, defects }
}

async function scanSettings(): Promise<{ settings: InventorySetting[], defects: InventoryDefect[] }> {
  const { data: settingsData, error } = await supabaseAdmin
    .from('settings_definitions')
    .select('*')
    .eq('is_active', true)
    .order('module', { ascending: true })

  if (error || !settingsData) {
    console.error('Error scanning settings:', error)
    return { settings: [], defects: [] }
  }

  // Get enforcement points
  const { data: enforcementPoints } = await supabaseAdmin
    .from('settings_enforcement_points')
    .select('setting_key, enforcement_type, is_verified')

  const enforcementByKey = new Map<string, string[]>()
  enforcementPoints?.forEach(ep => {
    const types = enforcementByKey.get(ep.setting_key) || []
    types.push(ep.enforcement_type)
    enforcementByKey.set(ep.setting_key, types)
  })

  const settings: InventorySetting[] = []
  const defects: InventoryDefect[] = []

  for (const setting of settingsData) {
    const enforcement = enforcementByKey.get(setting.setting_key) || []
    // Check if setting has enforcement defined in its own data
    const definedEnforcement = setting.enforcement || []
    const allEnforcement = [...new Set([...enforcement, ...definedEnforcement])]
    const hasEnforcement = allEnforcement.length > 0

    const inventorySetting: InventorySetting = {
      key: setting.setting_key,
      module: setting.module,
      label: setting.label_de || setting.label_en || setting.setting_key,
      data_type: setting.data_type,
      enforcement_points: allEnforcement,
      has_enforcement: hasEnforcement,
      is_defect: !hasEnforcement
    }

    settings.push(inventorySetting)

    // Create P0 defect for settings without enforcement
    if (!hasEnforcement) {
      defects.push({
        id: `setting_no_enforcement_${setting.setting_key}`,
        type: 'missing_enforcement',
        severity: 'P0',
        component_type: 'setting',
        component_name: setting.setting_key,
        description: `Setting "${setting.setting_key}" im Modul "${setting.module}" hat keinen dokumentierten Enforcement-Point. Der Wert wird nirgendwo im System überprüft/angewendet.`,
        suggested_fix: `Dokumentiere wo dieses Setting im Code verwendet wird (UI, API, Effect, Trigger, RLS) in der settings_enforcement_points Tabelle.`
      })
    }
  }

  return { settings, defects }
}

async function scanEvents(): Promise<InventoryEvent[]> {
  const { data: impactData, error } = await supabaseAdmin
    .from('impact_matrix')
    .select('action_name, effect_type')
    .eq('is_active', true)

  if (error || !impactData) {
    console.error('Error scanning events:', error)
    return []
  }

  // Group by action
  const eventMap = new Map<string, { effects: Set<string>, module: string }>()
  
  for (const impact of impactData) {
    const actionParts = impact.action_name.split('.')
    const module = actionParts[0] || 'unknown'
    
    const existing = eventMap.get(impact.action_name) || { effects: new Set(), module }
    existing.effects.add(impact.effect_type)
    eventMap.set(impact.action_name, existing)
  }

  const events: InventoryEvent[] = []
  eventMap.forEach((data, actionName) => {
    events.push({
      name: actionName,
      action_name: actionName,
      module: data.module,
      effects: Array.from(data.effects),
      producer_count: 1 // Will be enhanced with code analysis
    })
  })

  return events
}

async function scanEffects(): Promise<InventoryEffect[]> {
  const { data: effectTypes, error } = await supabaseAdmin
    .from('effect_types')
    .select('*')
    .order('category', { ascending: true })

  if (error || !effectTypes) {
    console.error('Error scanning effects:', error)
    return []
  }

  // Get which events trigger each effect
  const { data: impactData } = await supabaseAdmin
    .from('impact_matrix')
    .select('action_name, effect_type')
    .eq('is_active', true)

  const eventsByEffect = new Map<string, string[]>()
  impactData?.forEach(m => {
    const events = eventsByEffect.get(m.effect_type) || []
    if (!events.includes(m.action_name)) events.push(m.action_name)
    eventsByEffect.set(m.effect_type, events)
  })

  return effectTypes.map(effect => ({
    name: effect.effect_name,
    category: effect.category,
    trigger_events: eventsByEffect.get(effect.effect_name) || [],
    is_async: effect.is_async || false,
    is_active: effect.is_active
  }))
}

async function scanTriggers(): Promise<InventoryTrigger[]> {
  const triggers: InventoryTrigger[] = []

  // Scan database triggers
  const { data: dbTriggers } = await supabaseAdmin.rpc('get_database_triggers')
  
  if (dbTriggers) {
    for (const trigger of dbTriggers) {
      triggers.push({
        name: trigger.trigger_name,
        type: 'database',
        table_or_schedule: trigger.event_object_table,
        condition: `${trigger.action_timing} ${trigger.event_manipulation}`,
        consequence: trigger.action_statement,
        is_active: true
      })
    }
  }

  // Scan automation workflows
  const { data: automations } = await supabaseAdmin
    .from('automation_workflows')
    .select('*')

  if (automations) {
    for (const auto of automations) {
      triggers.push({
        name: auto.name || auto.id,
        type: 'automation',
        table_or_schedule: auto.trigger_type || 'event',
        condition: JSON.stringify(auto.trigger_conditions || {}),
        consequence: JSON.stringify(auto.actions || []),
        is_active: auto.is_active || false
      })
    }
  }

  // Scan ticket automation rules
  const { data: ticketRules } = await supabaseAdmin
    .from('ticket_automation_rules')
    .select('*')

  if (ticketRules) {
    for (const rule of ticketRules) {
      triggers.push({
        name: rule.name || rule.id,
        type: 'automation',
        table_or_schedule: 'tickets',
        condition: JSON.stringify(rule.conditions || {}),
        consequence: JSON.stringify(rule.actions || []),
        is_active: rule.is_active || false
      })
    }
  }

  return triggers
}

async function scanPermissions(): Promise<{ role: string; permissions: string[] }[]> {
  const { data: rolePerms, error } = await supabaseAdmin
    .from('role_permissions')
    .select('role, permission')
    .order('role', { ascending: true })

  if (error || !rolePerms) {
    console.error('Error scanning permissions:', error)
    return []
  }

  const permsByRole = new Map<string, string[]>()
  rolePerms.forEach(rp => {
    const perms = permsByRole.get(rp.role) || []
    perms.push(rp.permission)
    permsByRole.set(rp.role, perms)
  })

  const result: { role: string; permissions: string[] }[] = []
  permsByRole.forEach((permissions, role) => {
    result.push({ role, permissions })
  })

  return result
}

// Main scan function
async function runFullScan(userId: string): Promise<SystemInventory> {
  const startTime = Date.now()

  console.log('Starting full system introspection scan...')

  // Run all scans in parallel
  const [
    actionsResult,
    settingsResult,
    events,
    effects,
    triggers,
    permissions
  ] = await Promise.all([
    scanActions(),
    scanSettings(),
    scanEvents(),
    scanEffects(),
    scanTriggers(),
    scanPermissions()
  ])

  const allDefects = [...actionsResult.defects, ...settingsResult.defects]
  const unverified: { component: string; reason: string }[] = []

  // Identify unverified items
  actionsResult.actions
    .filter(a => a.verification_status === 'unverified')
    .forEach(a => {
      unverified.push({
        component: `action:${a.name}`,
        reason: 'Event-Mapping wurde automatisch erkannt aber nicht manuell verifiziert'
      })
    })

  const scanDuration = Date.now() - startTime

  const inventory: SystemInventory = {
    generated_at: new Date().toISOString(),
    version: '1.0.0',
    scan_duration_ms: scanDuration,
    summary: {
      total_actions: actionsResult.actions.length,
      actions_with_events: actionsResult.actions.filter(a => a.has_event).length,
      actions_without_events: actionsResult.actions.filter(a => !a.has_event).length,
      total_settings: settingsResult.settings.length,
      settings_enforced: settingsResult.settings.filter(s => s.has_enforcement).length,
      settings_unenforced: settingsResult.settings.filter(s => !s.has_enforcement).length,
      total_events: events.length,
      total_effects: effects.length,
      total_triggers: triggers.length,
      total_permissions: permissions.reduce((sum, p) => sum + p.permissions.length, 0),
      defects_p0: allDefects.filter(d => d.severity === 'P0').length,
      defects_p1: allDefects.filter(d => d.severity === 'P1').length,
      defects_p2: allDefects.filter(d => d.severity === 'P2').length,
      unverified_count: unverified.length
    },
    actions: actionsResult.actions,
    settings: settingsResult.settings,
    events,
    effects,
    triggers,
    permissions,
    defects: allDefects,
    unverified
  }

  // Save scan to database
  const { data: savedScan, error: saveError } = await supabaseAdmin
    .from('system_inventory_scans')
    .insert({
      scan_type: 'full',
      scan_duration_ms: scanDuration,
      summary: inventory.summary,
      results: {
        actions: inventory.actions,
        settings: inventory.settings,
        events: inventory.events,
        effects: inventory.effects,
        triggers: inventory.triggers,
        permissions: inventory.permissions,
        unverified: inventory.unverified
      },
      defects_count: allDefects.length,
      created_by: userId,
      metadata: {
        version: inventory.version
      }
    })
    .select()
    .single()

  if (saveError) {
    console.error('Error saving scan:', saveError)
  } else if (savedScan) {
    // Save individual defects
    const defectsToInsert = allDefects.map(d => ({
      scan_id: savedScan.id,
      defect_type: d.type,
      severity: d.severity,
      component_type: d.component_type,
      component_name: d.component_name,
      description: d.description,
      suggested_fix: d.suggested_fix,
      metadata: {}
    }))

    if (defectsToInsert.length > 0) {
      await supabaseAdmin
        .from('inventory_defects')
        .insert(defectsToInsert)
    }
  }

  console.log(`Scan completed in ${scanDuration}ms. Found ${allDefects.length} defects.`)

  return inventory
}

// Generate Markdown report
function generateMarkdown(inventory: SystemInventory): string {
  const lines: string[] = []

  lines.push('# System Inventory Report')
  lines.push('')
  lines.push(`**Generiert am:** ${new Date(inventory.generated_at).toLocaleString('de-DE')}`)
  lines.push(`**Version:** ${inventory.version}`)
  lines.push(`**Scan-Dauer:** ${inventory.scan_duration_ms}ms`)
  lines.push('')

  // Summary
  lines.push('## Zusammenfassung')
  lines.push('')
  lines.push('| Metrik | Wert |')
  lines.push('|--------|------|')
  lines.push(`| Actions gesamt | ${inventory.summary.total_actions} |`)
  lines.push(`| Actions mit Events | ${inventory.summary.actions_with_events} |`)
  lines.push(`| Actions ohne Events | ${inventory.summary.actions_without_events} |`)
  lines.push(`| Settings gesamt | ${inventory.summary.total_settings} |`)
  lines.push(`| Settings mit Enforcement | ${inventory.summary.settings_enforced} |`)
  lines.push(`| Settings ohne Enforcement | ${inventory.summary.settings_unenforced} |`)
  lines.push(`| Events | ${inventory.summary.total_events} |`)
  lines.push(`| Effects | ${inventory.summary.total_effects} |`)
  lines.push(`| Triggers | ${inventory.summary.total_triggers} |`)
  lines.push(`| Berechtigungen | ${inventory.summary.total_permissions} |`)
  lines.push('')

  // Defects
  lines.push('## Defekte')
  lines.push('')
  lines.push(`- **P0 (Kritisch):** ${inventory.summary.defects_p0}`)
  lines.push(`- **P1 (Hoch):** ${inventory.summary.defects_p1}`)
  lines.push(`- **P2 (Mittel):** ${inventory.summary.defects_p2}`)
  lines.push(`- **UNVERIFIED:** ${inventory.summary.unverified_count}`)
  lines.push('')

  if (inventory.defects.length > 0) {
    lines.push('### P0 Defekte (Kritisch)')
    lines.push('')
    const p0Defects = inventory.defects.filter(d => d.severity === 'P0')
    if (p0Defects.length === 0) {
      lines.push('Keine P0 Defekte gefunden.')
    } else {
      for (const defect of p0Defects.slice(0, 20)) {
        lines.push(`- **${defect.component_name}** (${defect.component_type}): ${defect.description}`)
      }
      if (p0Defects.length > 20) {
        lines.push(`- ... und ${p0Defects.length - 20} weitere`)
      }
    }
    lines.push('')

    lines.push('### P1 Defekte (Hoch)')
    lines.push('')
    const p1Defects = inventory.defects.filter(d => d.severity === 'P1')
    if (p1Defects.length === 0) {
      lines.push('Keine P1 Defekte gefunden.')
    } else {
      for (const defect of p1Defects.slice(0, 20)) {
        lines.push(`- **${defect.component_name}** (${defect.component_type}): ${defect.description}`)
      }
      if (p1Defects.length > 20) {
        lines.push(`- ... und ${p1Defects.length - 20} weitere`)
      }
    }
    lines.push('')
  }

  // Actions by Module
  lines.push('## Actions nach Modul')
  lines.push('')
  const actionsByModule = new Map<string, InventoryAction[]>()
  inventory.actions.forEach(a => {
    const list = actionsByModule.get(a.module) || []
    list.push(a)
    actionsByModule.set(a.module, list)
  })
  
  actionsByModule.forEach((actions, module) => {
    const withEvents = actions.filter(a => a.has_event).length
    lines.push(`### ${module} (${withEvents}/${actions.length} mit Events)`)
    lines.push('')
    lines.push('| Action | Entity | Events | Effects | Status |')
    lines.push('|--------|--------|--------|---------|--------|')
    for (const action of actions) {
      const status = action.has_event ? '✅' : '❌'
      lines.push(`| ${action.name} | ${action.entity_type} | ${action.event_names.length} | ${action.effect_count} | ${status} |`)
    }
    lines.push('')
  })

  // Effects
  lines.push('## Effects')
  lines.push('')
  lines.push('| Effect | Kategorie | Trigger-Events | Async | Aktiv |')
  lines.push('|--------|-----------|----------------|-------|-------|')
  for (const effect of inventory.effects) {
    const asyncIcon = effect.is_async ? '⚡' : '🔄'
    const activeIcon = effect.is_active ? '✅' : '❌'
    lines.push(`| ${effect.name} | ${effect.category} | ${effect.trigger_events.length} | ${asyncIcon} | ${activeIcon} |`)
  }
  lines.push('')

  // Triggers
  if (inventory.triggers.length > 0) {
    lines.push('## Triggers & Automations')
    lines.push('')
    lines.push('| Name | Typ | Tabelle/Schedule | Aktiv |')
    lines.push('|------|-----|------------------|-------|')
    for (const trigger of inventory.triggers) {
      const activeIcon = trigger.is_active ? '✅' : '❌'
      lines.push(`| ${trigger.name} | ${trigger.type} | ${trigger.table_or_schedule} | ${activeIcon} |`)
    }
    lines.push('')
  }

  // Permissions
  lines.push('## Berechtigungen')
  lines.push('')
  for (const rolePerms of inventory.permissions) {
    lines.push(`### ${rolePerms.role}`)
    lines.push('')
    lines.push(rolePerms.permissions.map(p => `- ${p}`).join('\n'))
    lines.push('')
  }

  // Unverified
  if (inventory.unverified.length > 0) {
    lines.push('## UNVERIFIED Einträge')
    lines.push('')
    for (const item of inventory.unverified) {
      lines.push(`- **${item.component}**: ${item.reason}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const { userId, error: authError } = await verifySuperadmin(authHeader)

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'json'

    // Run the scan
    const inventory = await runFullScan(userId)

    if (format === 'markdown' || format === 'md') {
      const markdown = generateMarkdown(inventory)
      return new Response(markdown, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/markdown',
          'Content-Disposition': 'attachment; filename="inventory.md"'
        }
      })
    }

    // Default: JSON
    return new Response(
      JSON.stringify(inventory, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="inventory.json"'
        }
      }
    )

  } catch (error: unknown) {
    console.error('Introspection error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
