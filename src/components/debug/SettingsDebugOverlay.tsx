// Settings-Driven Architecture (SDA) - Superadmin Debug-Overlay
// Zeigt effective_settings, provenance und version_hash für das aktuelle Modul

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bug, 
  X, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Copy,
  Check,
  Settings,
  Database,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface SettingsDebugData {
  module: string;
  tenant_id: string;
  settings: Record<string, any>;
  provenance: Record<string, { source: string; value: any }>;
  version_hash: string;
  resolved_at: string;
}

interface AuditLogEntry {
  id: string;
  module: string;
  key: string;
  action: string;
  old_value: any;
  new_value: any;
  scope_level: string;
  created_at: string;
}

// Ermittle Modul aus URL
const getModuleFromPath = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  
  // Mapping von URL-Segmenten zu Modul-Namen
  const moduleMap: Record<string, string> = {
    'zeiterfassung': 'timetracking',
    'time-tracking': 'timetracking',
    'abwesenheit': 'absence',
    'absence': 'absence',
    'aufgaben': 'tasks',
    'tasks': 'tasks',
    'schichten': 'shifts',
    'shifts': 'shifts',
    'dashboard': 'dashboard',
    'einstellungen': 'settings',
    'settings': 'settings',
    'mitarbeiter': 'employees',
    'employees': 'employees',
    'recruiting': 'recruiting',
    'projekte': 'projects',
    'projects': 'projects',
    'reisen': 'business_travel',
    'travel': 'business_travel',
    'spesen': 'expenses',
    'expenses': 'expenses'
  };
  
  for (const segment of segments) {
    const lowerSegment = segment.toLowerCase();
    if (moduleMap[lowerSegment]) {
      return moduleMap[lowerSegment];
    }
  }
  
  return segments[0] || 'dashboard';
};

export const SettingsDebugOverlay: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [debugData, setDebugData] = useState<SettingsDebugData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  
  const currentModule = getModuleFromPath(location.pathname);
  
  const isSuperadmin = user?.role === 'superadmin';
  
  const loadDebugData = async () => {
    if (!user?.company_id) return;
    
    setLoading(true);
    try {
      // Lade effective_settings über RPC
      const { data, error } = await supabase.rpc('get_effective_settings', {
        p_module: currentModule,
        p_tenant_id: user.company_id,
        p_user_id: user.id
      });
      
      if (error) {
        console.error('[DebugOverlay] RPC Fehler:', error);
        toast.error('Fehler beim Laden der Debug-Daten');
      } else {
        setDebugData(data as SettingsDebugData);
      }
      
      // Lade letzte 10 Audit-Logs
      const { data: logs, error: logError } = await supabase
        .from('settings_audit_log')
        .select('*')
        .eq('module', currentModule)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (!logError && logs) {
        setAuditLogs(logs as AuditLogEntry[]);
      }
    } catch (err) {
      console.error('[DebugOverlay] Fehler:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && isSuperadmin) {
      loadDebugData();
    }
  }, [isOpen, currentModule, isSuperadmin]);
  
  // Nur für Superadmins anzeigen
  if (!isSuperadmin) {
    return null;
  }
  
  const copyVersionHash = () => {
    if (debugData?.version_hash) {
      navigator.clipboard.writeText(debugData.version_hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
      toast.success('Version-Hash kopiert');
    }
  };
  
  const getSourceColor = (source: string): string => {
    const colors: Record<string, string> = {
      user: 'bg-purple-500',
      team: 'bg-blue-500',
      department: 'bg-cyan-500',
      location: 'bg-green-500',
      company: 'bg-amber-500',
      global: 'bg-gray-500',
      default_8020: 'bg-rose-500'
    };
    return colors[source] || 'bg-gray-400';
  };
  
  const getSourceLabel = (source: string): string => {
    const labels: Record<string, string> = {
      user: 'User',
      team: 'Team',
      department: 'Abt.',
      location: 'Standort',
      company: 'Firma',
      global: 'Global',
      default_8020: '80/20'
    };
    return labels[source] || source;
  };
  
  return (
    <TooltipProvider>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 z-[100]"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsOpen(true)}
                  size="icon"
                  variant="outline"
                  className="h-12 w-12 rounded-full shadow-lg bg-background border-2 border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950"
                >
                  <Bug className="h-5 w-5 text-amber-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Settings Debug-Overlay (Superadmin)</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed right-4 z-[100] bg-background border rounded-lg shadow-2xl ${
              isMinimized ? 'bottom-4 w-80' : 'top-4 bottom-4 w-96'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bug className="h-4 w-4 text-amber-600" />
                <span className="font-semibold text-sm">SDA Debug</span>
                <Badge variant="outline" className="text-xs">
                  {currentModule}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={loadDebugData}
                  disabled={loading}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {/* Content */}
            {!isMinimized && (
              <ScrollArea className="h-[calc(100%-48px)]">
                <div className="p-3 space-y-4">
                  {/* Version Hash */}
                  {debugData?.version_hash && (
                    <div className="flex items-center justify-between p-2 bg-muted rounded text-xs">
                      <div className="flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">Hash:</span>
                        <code className="font-mono">{debugData.version_hash.slice(0, 12)}...</code>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={copyVersionHash}
                      >
                        {copiedHash ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  )}
                  
                  {/* Effective Settings */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Effective Settings</h3>
                      <Badge variant="secondary" className="text-xs">
                        {debugData?.settings ? Object.keys(debugData.settings).length : 0}
                      </Badge>
                    </div>
                    
                    {debugData?.settings && Object.entries(debugData.settings).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(debugData.settings).map(([key, value]) => {
                          const prov = debugData.provenance?.[key];
                          return (
                            <div
                              key={key}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs hover:bg-muted transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <code className="font-mono text-[10px] truncate block">{key}</code>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="font-medium truncate max-w-[80px]">
                                  {typeof value === 'boolean' 
                                    ? (value ? '✓' : '✗')
                                    : String(value).slice(0, 15)
                                  }
                                </span>
                                {prov && (
                                  <Badge 
                                    className={`${getSourceColor(prov.source)} text-white text-[9px] px-1.5`}
                                  >
                                    {getSourceLabel(prov.source)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {loading ? 'Laden...' : 'Keine Settings für dieses Modul definiert'}
                      </p>
                    )}
                  </div>
                  
                  {/* Recent Changes */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Letzte Änderungen</h3>
                    </div>
                    
                    {auditLogs.length > 0 ? (
                      <div className="space-y-1">
                        {auditLogs.slice(0, 5).map((log) => (
                          <div
                            key={log.id}
                            className="p-2 bg-muted/50 rounded text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <code className="font-mono text-[10px]">{log.key}</code>
                              <Badge variant="outline" className="text-[9px]">
                                {log.action}
                              </Badge>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {new Date(log.created_at).toLocaleString('de-DE')}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Keine Änderungen protokolliert
                      </p>
                    )}
                  </div>
                  
                  {/* Resolved At */}
                  {debugData?.resolved_at && (
                    <div className="text-[10px] text-muted-foreground text-center pt-2 border-t">
                      Aufgelöst: {new Date(debugData.resolved_at).toLocaleString('de-DE')}
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
            
            {/* Minimized View */}
            {isMinimized && debugData && (
              <div className="p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {Object.keys(debugData.settings || {}).length} Settings
                  </span>
                  <code className="font-mono text-[10px]">
                    {debugData.version_hash?.slice(0, 8)}
                  </code>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default SettingsDebugOverlay;