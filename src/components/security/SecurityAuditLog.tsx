/**
 * Security Audit Log Component
 * Zeigt Sicherheitsereignisse und verdächtige Aktivitäten an
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, Search, Download, Eye, Lock, User, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SecurityEvent {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  details: any;
  risk_level: string;
  created_at: string;
}

interface LoginAttempt {
  id: string;
  email: string;
  ip_address: string;
  success: boolean;
  attempted_at: string;
  user_agent?: string;
  failure_reason?: string;
}

export const SecurityAuditLog: React.FC = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'logins'>('events');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadSecurityEvents(), loadLoginAttempts()]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Fehler beim Laden der Sicherheitsdaten",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityEvents = async () => {
    const { data, error } = await supabase
      .from('security_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    setSecurityEvents(data || []);
  };

  const loadLoginAttempts = async () => {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('*')
      .order('attempted_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    setLoginAttempts(data || []);
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'login':
      case 'login_success':
        return <User className="h-4 w-4" />;
      case 'login_failed':
        return <Lock className="h-4 w-4" />;
      case 'unauthorized_access':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = !searchTerm || 
      event.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ip_address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRisk = riskFilter === 'all' || event.risk_level === riskFilter;
    
    return matchesSearch && matchesRisk;
  });

  const filteredLoginAttempts = loginAttempts.filter(attempt => {
    return !searchTerm || 
      attempt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.ip_address?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const exportAuditLog = async () => {
    try {
      const data = activeTab === 'events' ? filteredEvents : filteredLoginAttempts;
      const csvContent = [
        activeTab === 'events' 
          ? ['Timestamp', 'Action', 'User ID', 'IP Address', 'Risk Level', 'Success', 'Details']
          : ['Timestamp', 'Email', 'IP Address', 'Success', 'User Agent', 'Failure Reason'],
        ...data.map(item => 
          activeTab === 'events'
            ? [
                new Date(item.created_at).toLocaleString('de-DE'),
                item.action,
                item.user_id,
                item.ip_address || '',
                item.risk_level,
                item.success ? 'Ja' : 'Nein',
                JSON.stringify(item.details)
              ]
            : [
                new Date((item as LoginAttempt).attempted_at).toLocaleString('de-DE'),
                (item as LoginAttempt).email,
                (item as LoginAttempt).ip_address,
                (item as LoginAttempt).success ? 'Ja' : 'Nein',
                (item as LoginAttempt).user_agent || '',
                (item as LoginAttempt).failure_reason || ''
              ]
        )
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-audit-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export erfolgreich",
        description: "Audit-Log wurde exportiert."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Export fehlgeschlagen",
        description: error.message
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Sicherheits-Audit-Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={activeTab === 'events' ? 'default' : 'outline'}
            onClick={() => setActiveTab('events')}
          >
            Sicherheitsereignisse
          </Button>
          <Button
            variant={activeTab === 'logins' ? 'default' : 'outline'}
            onClick={() => setActiveTab('logins')}
          >
            Login-Versuche
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          {activeTab === 'events' && (
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Risikostufen</SelectItem>
                <SelectItem value="critical">Kritisch</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="low">Niedrig</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          <Button onClick={exportAuditLog} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Events List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-gray-600">Laden...</p>
          ) : activeTab === 'events' ? (
            filteredEvents.length === 0 ? (
              <p className="text-gray-600">Keine Sicherheitsereignisse gefunden.</p>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getActionIcon(event.action)}
                      <span className="font-medium">{event.action}</span>
                      <Badge className={getRiskBadgeColor(event.risk_level)}>
                        {event.risk_level}
                      </Badge>
                      <Badge variant={event.success ? 'default' : 'destructive'}>
                        {event.success ? 'Erfolgreich' : 'Fehlgeschlagen'}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(event.created_at).toLocaleString('de-DE')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>User: {event.user_id}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>IP: {event.ip_address || 'Unbekannt'}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Resource:</span> {event.resource_type}
                    {event.resource_id && <span> (ID: {event.resource_id})</span>}
                  </div>
                  
                  {event.details && Object.keys(event.details).length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600">Details anzeigen</summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )
          ) : (
            filteredLoginAttempts.length === 0 ? (
              <p className="text-gray-600">Keine Login-Versuche gefunden.</p>
            ) : (
              filteredLoginAttempts.map((attempt) => (
                <div key={attempt.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {attempt.success ? <User className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      <span className="font-medium">{attempt.email}</span>
                      <Badge variant={attempt.success ? 'default' : 'destructive'}>
                        {attempt.success ? 'Erfolgreich' : 'Fehlgeschlagen'}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(attempt.attempted_at).toLocaleString('de-DE')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>IP: {attempt.ip_address}</span>
                    </div>
                    {attempt.user_agent && (
                      <div className="flex items-center gap-1">
                        <span>Agent: {attempt.user_agent.split(' ')[0]}</span>
                      </div>
                    )}
                  </div>
                  
                  {!attempt.success && attempt.failure_reason && (
                    <div className="text-sm text-red-600">
                      <span className="font-medium">Fehler:</span> {attempt.failure_reason}
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};