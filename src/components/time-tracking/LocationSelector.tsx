import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronDown, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/useGeolocation";

interface LocationSelectorProps {
  location: string;
  office_location_id?: string;
  onLocationChange: (location: string, office_location_id?: string) => void;
  selectedOfficeName?: string;
  onOfficeNameChange: (name?: string) => void;
}

const LocationSelector = ({
  location,
  office_location_id,
  onLocationChange,
  selectedOfficeName,
  onOfficeNameChange,
}: LocationSelectorProps) => {
  const { isWithinOfficeRadius, getDistanceToOffice, loading: gpsLoading, error: gpsError } = useGeolocation();

  const { data: officeLocations, error, isLoading } = useQuery({
    queryKey: ['company_office_locations'],
    queryFn: async () => {
      console.log('Fetching company office locations...');
      
      const { data: officeData, error: officeError } = await supabase
        .from('office_locations')
        .select('*')
        .order('name');
      
      if (officeData && officeData.length > 0) {
        console.log('Using office_locations table:', officeData);
        return officeData;
      }
      
      console.log('Fallback: Using company addresses from companies table...');
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, address')
        .eq('is_active', true)
        .order('name');
      
      if (companyError) {
        console.error('Error fetching company addresses:', companyError);
        throw companyError;
      }
      
      const transformedData = (companyData || [])
        .filter(company => company.address && company.address.trim() !== '')
        .map(company => ({
          id: company.id,
          name: `${company.name} - ${company.address}`,
          address: company.address,
          latitude: null,
          longitude: null,
          radius_meters: null
        }));
      
      console.log('Using transformed company addresses:', transformedData);
      return transformedData;
    }
  });

  if (error) {
    console.error('LocationSelector Query Error:', error);
  }

  // Check if any office is within range
  const hasOfficeInRange = officeLocations?.some(loc => isWithinOfficeRadius(loc)) ?? true;

  const formatDistance = (meters: number | null): string => {
    if (meters === null) return '';
    if (meters < 1000) return `${Math.round(meters)}m entfernt`;
    return `${(meters / 1000).toFixed(1)}km entfernt`;
  };

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">Arbeitsort</label>
      <div className="flex gap-2 flex-wrap">
        <TooltipProvider>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant={location === "office" ? "default" : "outline"}
                    disabled={!hasOfficeInRange && !gpsLoading}
                    className={`border-[#3B44F6] flex items-center gap-2 w-full justify-between shadow-card outline-none focus:outline-none focus-visible:outline-none ${
                      location === "office" 
                        ? "bg-[#3B44F6] hover:bg-[#3B44F6]/90 text-white" 
                        : !hasOfficeInRange && !gpsLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#3B44F6]/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedOfficeName || "Büro"}</span>
                      {!hasOfficeInRange && !gpsLoading && (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              {!hasOfficeInRange && !gpsLoading && (
                <TooltipContent>
                  <p>Sie befinden sich nicht im Büro-Bereich</p>
                </TooltipContent>
              )}
            </Tooltip>
            <DropdownMenuContent className="w-[200px] bg-white z-50">
              {officeLocations?.map((loc) => {
                const isInRange = isWithinOfficeRadius(loc);
                const distance = getDistanceToOffice(loc);
                
                return (
                  <Tooltip key={loc.id}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        onClick={() => {
                          if (isInRange) {
                            onLocationChange("office", loc.id);
                            onOfficeNameChange(loc.name);
                          }
                        }}
                        disabled={!isInRange}
                        className={`cursor-pointer outline-none focus:outline-none focus-visible:outline-none ${
                          isInRange 
                            ? "hover:bg-[#3B44F6]/10" 
                            : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex flex-col w-full">
                          <span>{loc.name}</span>
                          {!isInRange && distance !== null && (
                            <span className="text-xs text-orange-500">
                              {formatDistance(distance)}
                            </span>
                          )}
                        </div>
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    {!isInRange && (
                      <TooltipContent side="right">
                        <p>Sie befinden sich nicht in der Nähe dieses Büros</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
        <Button
          type="button"
          variant={location === "home" ? "default" : "outline"}
          onClick={() => {
            onLocationChange("home", undefined);
            onOfficeNameChange(undefined);
          }}
          className={`border-[#3B44F6] flex-1 shadow-card outline-none focus:outline-none focus-visible:outline-none ${
            location === "home" 
              ? "bg-[#3B44F6] hover:bg-[#3B44F6]/90 text-white" 
              : "hover:bg-[#3B44F6]/10"
          }`}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Home Office
        </Button>
        <Button
          type="button"
          variant={location === "mobile" ? "default" : "outline"}
          onClick={() => {
            onLocationChange("mobile", undefined);
            onOfficeNameChange(undefined);
          }}
          className={`border-[#3B44F6] flex-1 shadow-card outline-none focus:outline-none focus-visible:outline-none ${
            location === "mobile" 
              ? "bg-[#3B44F6] hover:bg-[#3B44F6]/90 text-white" 
              : "hover:bg-[#3B44F6]/10"
          }`}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Unterwegs
        </Button>
      </div>
    </div>
  );
};

export default LocationSelector;
