
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardCheck, Eye, History, Download, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const AuditRevision = () => {
  const [selectedTable, setSelectedTable] = useState("all");

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', selectedTable],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedTable !== "all") {
        query = query.eq('table_name', selectedTable);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: revisionHistory } = useQuery({
    queryKey: ['revision-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_revision_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Audit & Revision</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="revisions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Revisionshistorie
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Compliance Überwachung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <div className="flex gap-2">
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="px-3 py-1 border rounded-md text-sm"
                >
                  <option value="all">Alle Tabellen</option>
                  <option value="employees">Mitarbeiter</option>
                  <option value="projects">Projekte</option>
                  <option value="time_entries">Zeiterfassung</option>
                  <option value="expenses">Ausgaben</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs?.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <div>
                        <p className="font-medium">{log.table_name}</p>
                        <p className="text-sm text-gray-500">
                          von {log.user_email || 'System'} • {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revisions">
          <Card>
            <CardHeader>
              <CardTitle>HR Revisionshistorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revisionHistory?.map((revision) => (
                  <div
                    key={revision.id}
                    className="p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{revision.entity_type}</h3>
                      <Badge variant={revision.change_type === 'major' ? 'destructive' : 'secondary'}>
                        {revision.change_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{revision.description}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(revision.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Überwachung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">DSGVO Compliance</h3>
                  <Badge className="bg-green-100 text-green-800">Konform</Badge>
                  <p className="text-sm text-gray-500 mt-2">Letzte Prüfung: Heute</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Arbeitsrecht</h3>
                  <Badge className="bg-green-100 text-green-800">Konform</Badge>
                  <p className="text-sm text-gray-500 mt-2">Letzte Prüfung: Gestern</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Steuerrecht</h3>
                  <Badge className="bg-yellow-100 text-yellow-800">Prüfung erforderlich</Badge>
                  <p className="text-sm text-gray-500 mt-2">Letzte Prüfung: vor 7 Tagen</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
