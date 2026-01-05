import { Card } from "@/components/ui/card";
import { Calendar, ChevronRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format } from "date-fns";

export const AIDocumentSuggestion = () => {
  const { data: expiringCount = 0, isLoading } = useQuery({
    queryKey: ['expiring-documents-count'],
    queryFn: async () => {
      const today = new Date();
      const in60Days = addDays(today, 60);
      
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .gte('expiry_date', format(today, 'yyyy-MM-dd'))
        .lte('expiry_date', format(in60Days, 'yyyy-MM-dd'))
        .is('deleted_at', null);
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Don't show if no expiring documents or still loading
  if (isLoading || expiringCount === 0) {
    return (
      <Card className="p-4 bg-gradient-to-r from-green-500/5 to-green-500/10 border-green-500/20">
        <div className="flex items-start gap-3">
          <div className="bg-green-500/10 p-2 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground/80">
              Alle Dokumente sind aktuell. Keine Verträge laufen in den nächsten 60 Tagen ab.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-amber-500/5 to-amber-500/10 border-amber-500/20">
      <div className="flex items-start gap-3">
        <div className="bg-amber-500/10 p-2 rounded-lg">
          <Calendar className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/80">
            {expiringCount} {expiringCount === 1 ? 'Vertrag läuft' : 'Verträge laufen'} in den nächsten 60 Tagen ab und {expiringCount === 1 ? 'benötigt' : 'benötigen'} eine Verlängerung oder Neuverhandlung
          </p>
          <Link 
            to="/documents/expiring-documents" 
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium mt-2"
          >
            Details anzeigen
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
};
