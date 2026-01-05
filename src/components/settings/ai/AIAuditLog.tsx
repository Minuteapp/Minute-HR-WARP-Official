import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Download, Filter, User, Calendar, Activity } from "lucide-react";
import { useState } from "react";

interface AIAuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

interface AIAuditLogProps {
  logs: AIAuditLogEntry[];
  onExport: () => void;
}

export function AIAuditLog({ logs, onExport }: AIAuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterAction, setFilterAction] = useState('all');

  const modules = Array.from(new Set(logs.map(log => log.module))).filter(Boolean);
  const actions = Array.from(new Set(logs.map(log => log.action))).filter(Boolean);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    
    return matchesSearch && matchesModule && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'ai_module_enabled':
      case 'workflow_created':
        return 'bg-green-100 text-green-800';
      case 'ai_module_disabled':
      case 'workflow_deleted':
        return 'bg-red-100 text-red-800';
      case 'settings_updated':
      case 'threshold_changed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessColor = (success: boolean) => {
    return success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            KI-Aktivitätsprotokoll
          </CardTitle>
          <Button onClick={onExport} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Benutzer, Aktion oder Details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Modul filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Module</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Aktion filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Aktionen</SelectItem>
              {actions.map((action) => (
                <SelectItem key={action} value={action}>{action}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Protokolleinträge gefunden</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <Badge className={getSuccessColor(log.success)}>
                        {log.success ? 'Erfolgreich' : 'Fehlgeschlagen'}
                      </Badge>
                      {log.module && (
                        <Badge variant="outline">{log.module}</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.userName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.timestamp).toLocaleString('de-DE')}
                      </div>
                    </div>
                    
                    <p className="text-sm">{log.details}</p>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>IP: {log.ipAddress}</span>
                  <span>ID: {log.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredLogs.length > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>{filteredLogs.length} von {logs.length} Einträgen</span>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Live-Überwachung aktiv</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}