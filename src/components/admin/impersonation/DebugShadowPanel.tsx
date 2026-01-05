import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  User, 
  Shield, 
  Flag, 
  Globe, 
  HelpCircle, 
  Activity,
  Check,
  X,
  Eye,
  ChevronDown,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import { useImpersonationContext } from '@/contexts/ImpersonationContext';
import { impersonationService, AuditLogEntry, PermissionTrace } from '@/services/impersonationService';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DebugShadowPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebugShadowPanel({ open, onOpenChange }: DebugShadowPanelProps) {
  const { session } = useImpersonationContext();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [permissionTrace, setPermissionTrace] = useState<PermissionTrace | null>(null);
  const [loadingTrace, setLoadingTrace] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Load audit logs
  useEffect(() => {
    async function loadLogs() {
      if (!session?.session_id || !open) return;
      
      setLoadingLogs(true);
      const logs = await impersonationService.getSessionAuditLogs(session.session_id);
      setAuditLogs(logs);
      setLoadingLogs(false);
    }
    
    loadLogs();
  }, [session?.session_id, open]);

  // Load permission trace
  useEffect(() => {
    async function loadTrace() {
      if (!session?.target_tenant_id || !open) return;
      
      setLoadingTrace(true);
      const trace = await impersonationService.getPermissionTrace(
        session.target_user_id || null,
        session.target_tenant_id
      );
      setPermissionTrace(trace);
      setLoadingTrace(false);
    }
    
    loadTrace();
  }, [session?.target_user_id, session?.target_tenant_id, open]);

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleModule = (moduleKey: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleKey) 
        ? prev.filter(m => m !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  const getPermissionExplanation = (permission: PermissionTrace['permissions'][0]) => {
    return `Erlaubt durch Rolle "${permission.role}" → Modul "${permission.module_name}" → Aktionen: ${permission.allowed_actions.join(', ')}`;
  };

  if (!session) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Shadow Mode - Debug Panel
          </SheetTitle>
          <SheetDescription>
            Erweiterte Informationen zur aktuellen Impersonation-Session
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="identity" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="identity">Identität</TabsTrigger>
            <TabsTrigger value="permissions">Rechte</TabsTrigger>
            <TabsTrigger value="flags">Flags</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>

          {/* Identität Tab */}
          <TabsContent value="identity" className="mt-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4" />
                  Effektive Identität
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User:</span>
                    <span className="font-medium">
                      {permissionTrace?.effective_profile?.full_name || session.target_user_name || session.target_user_email || 'Pre-Tenant'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">E-Mail:</span>
                    <span>{permissionTrace?.effective_profile?.email || session.target_user_email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Abteilung:</span>
                    <span>{permissionTrace?.effective_profile?.department || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position:</span>
                    <span>{permissionTrace?.effective_profile?.position || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Firma:</span>
                    <span>{session.target_tenant_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modus:</span>
                    <Badge variant={session.mode === 'view_only' ? 'secondary' : 'destructive'}>
                      {session.mode === 'view_only' ? 'View-only' : 'Act-as'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rollen:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {permissionTrace?.roles?.map((r, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{r.role}</Badge>
                      )) || <span>-</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Globe className="h-4 w-4" />
                  Standort & Regeln
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Land:</span>
                    <span>{permissionTrace?.location_rules?.country || 'DE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zeitzone:</span>
                    <span>{permissionTrace?.location_rules?.timezone || 'Europe/Berlin'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Feiertage:</span>
                    <span>{permissionTrace?.location_rules?.holiday_region || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sprache:</span>
                    <span>{permissionTrace?.location_rules?.language || 'de'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Währung:</span>
                    <span>{permissionTrace?.location_rules?.currency || 'EUR'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <HelpCircle className="h-4 w-4" />
                  Session Info
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <span className="font-mono text-xs">{session.session_id?.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gestartet:</span>
                    <span>{session.started_at ? format(new Date(session.started_at), 'HH:mm', { locale: de }) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Läuft ab:</span>
                    <span>{session.expires_at ? format(new Date(session.expires_at), 'HH:mm', { locale: de }) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Begründung:</span>
                    <span className="truncate max-w-[150px]" title={session.justification}>{session.justification}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Berechtigungen Tab */}
          <TabsContent value="permissions" className="mt-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  Aktive Berechtigungen
                </div>
                {loadingTrace && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              
              <ScrollArea className="h-[400px]">
                {loadingTrace ? (
                  <div className="text-center py-4 text-muted-foreground">Laden...</div>
                ) : !permissionTrace?.permissions?.length ? (
                  <div className="text-center py-4 text-muted-foreground">Keine Berechtigungen gefunden</div>
                ) : (
                  <div className="space-y-2">
                    {/* Group by module */}
                    {Object.entries(
                      permissionTrace.permissions.reduce((acc, perm) => {
                        if (!acc[perm.module_key]) {
                          acc[perm.module_key] = [];
                        }
                        acc[perm.module_key].push(perm);
                        return acc;
                      }, {} as Record<string, typeof permissionTrace.permissions>)
                    ).map(([moduleKey, perms]) => (
                      <Collapsible 
                        key={moduleKey} 
                        open={expandedModules.includes(moduleKey)}
                        onOpenChange={() => toggleModule(moduleKey)}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            {expandedModules.includes(moduleKey) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="font-medium text-sm">{perms[0].module_name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {perms.reduce((acc, p) => acc + p.allowed_actions.length, 0)} Aktionen
                          </Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 space-y-1">
                          {perms.map((perm, i) => (
                            <div key={i} className="p-2 bg-muted/30 rounded text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="secondary" className="text-xs">{perm.role}</Badge>
                                <Check className="h-3 w-3 text-green-600" />
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {perm.allowed_actions.map((action, j) => (
                                  <Badge key={j} variant="outline" className="text-xs font-mono">
                                    {action}
                                  </Badge>
                                ))}
                              </div>
                              {/* "Warum sehe ich das?" Explanation */}
                              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 flex items-start gap-1">
                                <Info className="h-3 w-3 mt-0.5 shrink-0" />
                                <span>{getPermissionExplanation(perm)}</span>
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Feature Flags Tab */}
          <TabsContent value="flags" className="mt-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Flag className="h-4 w-4" />
                  Feature Flags
                </div>
                {loadingTrace && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
              <ScrollArea className="h-[350px]">
                {loadingTrace ? (
                  <div className="text-center py-4 text-muted-foreground">Laden...</div>
                ) : !permissionTrace?.feature_flags?.length ? (
                  <div className="text-center py-4 text-muted-foreground">Keine Feature Flags konfiguriert</div>
                ) : (
                  <div className="space-y-2">
                    {permissionTrace.feature_flags.map((flag, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded">
                        <div>
                          <span className="text-sm font-medium">{flag.name}</span>
                          {flag.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {flag.source === 'company' ? 'Firma' : 'Standard'}
                          </Badge>
                          <Badge variant={flag.enabled ? 'default' : 'outline'}>
                            {flag.enabled ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Audit Log Tab */}
          <TabsContent value="audit" className="mt-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Activity className="h-4 w-4" />
                  Aktionen in dieser Session
                </div>
                <Badge variant="outline">{auditLogs.length}</Badge>
              </div>
              <ScrollArea className="h-[350px]">
                {loadingLogs ? (
                  <div className="text-center py-4 text-muted-foreground">Laden...</div>
                ) : auditLogs.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">Keine Aktionen protokolliert</div>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-2 border rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{log.action}</span>
                          <Badge className={getRiskLevelColor(log.risk_level)}>{log.risk_level}</Badge>
                        </div>
                        <div className="text-muted-foreground text-xs mt-1">
                          {log.resource_type} {log.resource_id && `• ${log.resource_id.slice(0, 8)}...`}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {format(new Date(log.created_at), 'HH:mm:ss', { locale: de })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
