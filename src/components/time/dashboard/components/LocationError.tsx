
import { ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import BrowserSpecificHelp from './BrowserSpecificHelp';

interface LocationErrorProps {
  permissionDenied: boolean;
  errorMessage: string;
  browserType: string;
  onHelp: () => void;
}

/**
 * Zeigt Fehlermeldungen und Hilfehinweise für Standortprobleme an
 */
const LocationError = ({ 
  permissionDenied, 
  errorMessage, 
  browserType, 
  onHelp 
}: LocationErrorProps) => {
  if (!permissionDenied && !errorMessage) {
    return null;
  }

  return (
    <div className="text-xs text-amber-600 mt-1 max-w-64 text-center">
      {permissionDenied ? (
        <>
          <p>Ihr Browser blockiert den Standortzugriff.</p>
          <p className="mt-1 font-semibold">
            Tipp: Klicken Sie auf das Aktualisierungssymbol, um die Berechtigung erneut anzufordern oder auf den Link-Button für Hilfe.
          </p>

          {/* Help Button */}
          {onHelp && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={onHelp}
                    aria-label="Hilfe zum Standortzugriff"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hilfe zum Standortzugriff</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          <BrowserSpecificHelp browserType={browserType} />
        </>
      ) : (
        <p>{errorMessage}</p>
      )}
    </div>
  );
};

export default LocationError;
