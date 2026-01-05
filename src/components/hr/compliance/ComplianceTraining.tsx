
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const ComplianceTraining = () => {
  const { data: trainings, isLoading } = useQuery({
    queryKey: ['hr-compliance-trainings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hr_compliance_trainings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

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
        <h2 className="text-2xl font-bold">Compliance Schulungen</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neue Schulung
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainings?.length || 0}</p>
                <p className="text-sm text-gray-500">Schulungen gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainings?.filter(t => t.status === 'completed').length || 0}</p>
                <p className="text-sm text-gray-500">Abgeschlossen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainings?.filter(t => t.status === 'in_progress').length || 0}</p>
                <p className="text-sm text-gray-500">In Bearbeitung</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{trainings?.filter(t => t.status === 'overdue').length || 0}</p>
                <p className="text-sm text-gray-500">Überfällig</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Schulungsübersicht
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainings?.length > 0 ? (
              trainings.map((training) => (
                <div
                  key={training.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{training.title}</h3>
                      <p className="text-sm text-gray-500">{training.description}</p>
                      <p className="text-xs text-gray-400">
                        Typ: {training.training_type} • Fällig: {new Date(training.due_date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        training.status === 'completed'
                          ? 'default'
                          : training.status === 'in_progress'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {training.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Noch keine Compliance-Schulungen definiert</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
