
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { GreenInitiative } from "@/types/green-initiatives";

const InitiativeDetails = () => {
  const { id } = useParams();

  const { data: initiative, isLoading } = useQuery({
    queryKey: ['green-initiative', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('green_initiatives')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as GreenInitiative;
    },
    enabled: !!id
  });

  if (isLoading) {
    return <div className="w-full p-6">Lädt...</div>;
  }

  if (!initiative) {
    return <div className="w-full p-6">Initiative nicht gefunden</div>;
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/environment/initiatives">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{initiative.title}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Ziel</h3>
          </div>
          <p className="text-gray-600">{initiative.target_impact || 'Kein Ziel definiert'}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Zeitraum</h3>
          </div>
          <div className="text-gray-600">
            <p>Start: {new Date(initiative.start_date).toLocaleDateString()}</p>
            {initiative.end_date && (
              <p>Ende: {new Date(initiative.end_date).toLocaleDateString()}</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold">Team</h3>
          </div>
          <p className="text-gray-600">Team wird implementiert...</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Beschreibung</h3>
        <p className="text-gray-600">{initiative.description || 'Keine Beschreibung vorhanden'}</p>
      </Card>

      {initiative.budget && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Budget</h3>
          <p className="text-gray-600">
            {initiative.budget.toLocaleString()} {initiative.currency || 'EUR'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default InitiativeDetails;
