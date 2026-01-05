import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowLeft, Timer, Building2, MapPin, X, Play, Briefcase, Home, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import MapWithToken from "./MapWithToken";
import ProjectSelector from "./ProjectSelector";
import LocationSelector from "./LocationSelector";
import type { NewTimeEntry } from "@/services/timeTrackingService";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MobileTimeTrackingFormProps {
  formData: NewTimeEntry;
  setFormData: (data: NewTimeEntry) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
  selectedOfficeName?: string;
  setSelectedOfficeName: (name?: string) => void;
}

const MobileTimeTrackingForm = ({
  formData,
  setFormData,
  handleSubmit,
  onClose,
  selectedOfficeName,
  setSelectedOfficeName
}: MobileTimeTrackingFormProps) => {
  // Lade Bürostandorte
  const { data: officeLocations = [] } = useQuery({
    queryKey: ['office_locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('office_locations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const getLocationDisplayName = () => {
    if (formData.location === 'office' && selectedOfficeName) {
      return selectedOfficeName;
    }
    if (formData.location === 'home') return 'Home Office - Ihr registrierter Heimarbeitsplatz';
    if (formData.location === 'mobile') return 'Unterwegs';
    return 'Nicht ausgewählt';
  };

  const getLocationIcon = () => {
    if (formData.location === 'office') return Building2;
    if (formData.location === 'home') return Home;
    return Navigation;
  };

  const LocationIcon = getLocationIcon();

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Purple Header */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-purple-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex flex-col items-center text-white pt-1">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <Play className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold mb-0.5">Zeiterfassung starten</h2>
          <p className="text-purple-100 text-[11px] text-center">
            Erfassen Sie Ihre Arbeitszeit mit allen relevanten Details
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Projekt/Aktivität Feld */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-gray-600" />
              <label className="text-[11px] font-medium text-gray-900">
                Projekt / Aktivität
              </label>
              <Badge variant="destructive" className="text-[9px] h-4 px-1.5">
                Erforderlich
              </Badge>
            </div>
            <ProjectSelector
              project={formData.project || ''}
              onProjectChange={(value) => setFormData({ ...formData, project: value })}
            />
          </div>

          {/* Arbeitsort Auswahl */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gray-600" />
              <label className="text-[11px] font-medium text-gray-900">
                Arbeitsort
              </label>
            </div>
            
            <div className="space-y-1.5">
              {/* Büro Button */}
              <button
                type="button"
                onClick={() => {
                  if (officeLocations.length > 0) {
                    setFormData({ 
                      ...formData, 
                      location: 'office',
                      office_location_id: officeLocations[0].id
                    });
                    setSelectedOfficeName(officeLocations[0].name);
                  }
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  formData.location === 'office'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className={`h-4 w-4 ${
                    formData.location === 'office' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                  <span className={`text-[12px] font-medium ${
                    formData.location === 'office' ? 'text-purple-900' : 'text-gray-900'
                  }`}>
                    Büro
                  </span>
                </div>
              </button>

              {/* Home Office Button */}
              <button
                type="button"
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    location: 'home',
                    office_location_id: undefined
                  });
                  setSelectedOfficeName(undefined);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  formData.location === 'home'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home className={`h-4 w-4 ${
                    formData.location === 'home' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                  <span className={`text-[12px] font-medium ${
                    formData.location === 'home' ? 'text-purple-900' : 'text-gray-900'
                  }`}>
                    Home Office
                  </span>
                </div>
              </button>

              {/* Unterwegs Button */}
              <button
                type="button"
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    location: 'mobile',
                    office_location_id: undefined
                  });
                  setSelectedOfficeName(undefined);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  formData.location === 'mobile'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Navigation className={`h-4 w-4 ${
                    formData.location === 'mobile' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                  <span className={`text-[12px] font-medium ${
                    formData.location === 'mobile' ? 'text-purple-900' : 'text-gray-900'
                  }`}>
                    Unterwegs
                  </span>
                </div>
              </button>
            </div>

            {/* Aktueller Standort Info */}
            {formData.location && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="flex items-start gap-1.5">
                  <LocationIcon className="h-3.5 w-3.5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-medium text-blue-900 mb-0.5">
                      Aktueller Standort
                    </p>
                    <p className="text-[10px] text-blue-700">
                      {getLocationDisplayName()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notizen Feld */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-gray-900">
              Notizen (optional)
            </label>
            <Textarea
              placeholder="Fügen Sie optionale Notizen zu Ihrer Zeiterfassung hinzu..."
              className="min-h-[80px] resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-[11px]"
              value={formData.note || ''}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            />
            <p className="text-[10px] text-gray-500">
              Diese Notizen sind nur für Sie sichtbar und helfen bei der späteren Nachverfolgung
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-9 text-[11px]"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              className="flex-1 h-9 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-[11px]"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" />
              Zeiterfassung starten
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MobileTimeTrackingForm;
