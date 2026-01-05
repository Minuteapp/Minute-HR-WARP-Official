
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeeEngagement = () => {
  const navigate = useNavigate();
  const { data: suggestions, isLoading: loadingSuggestions } = useQuery({
    queryKey: ['sustainability-suggestions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sustainability_suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: surveys, isLoading: loadingSurveys } = useQuery({
    queryKey: ['sustainability-surveys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sustainability_surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  if (loadingSuggestions || loadingSurveys) {
    return <div className="w-full p-6">Lädt...</div>;
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/environment')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-500" />
            <h1 className="text-3xl font-bold">Mitarbeiterengagement</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Vorschläge</h3>
          <p className="text-3xl font-bold text-blue-600">
            {suggestions?.length || 0}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Aktive Umfragen</h3>
          <p className="text-3xl font-bold text-blue-600">
            {surveys?.filter(s => s.status === 'active').length || 0}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Offene Vorschläge</h3>
          <p className="text-3xl font-bold text-blue-600">
            {suggestions?.filter(s => s.status === 'pending').length || 0}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Neueste Vorschläge</h3>
          <div className="space-y-4">
            {suggestions?.slice(0, 5).map((suggestion) => (
              <div key={suggestion.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <p className="text-sm text-gray-600">{suggestion.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    suggestion.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    suggestion.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {suggestion.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Aktuelle Umfragen</h3>
          <div className="space-y-4">
            {surveys?.filter(s => s.status === 'active').map((survey) => (
              <div key={survey.id} className="border-b pb-4 last:border-0">
                <h4 className="font-semibold">{survey.title}</h4>
                <p className="text-sm text-gray-600">{survey.description}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-500">
                  <p>Start: {new Date(survey.start_date).toLocaleDateString()}</p>
                  {survey.end_date && (
                    <p>Ende: {new Date(survey.end_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeEngagement;
