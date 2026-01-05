
import { Button } from "@/components/ui/button";
import { AlertCircle, HelpCircle, RefreshCw } from "lucide-react";

interface LocationErrorDisplayProps {
  errorMessage: string;
  onRetry: () => void;
}

const LocationErrorDisplay = ({ errorMessage, onRetry }: LocationErrorDisplayProps) => {
  // Bestimme, ob es sich um ein Berechtigungsproblem handelt
  const isPermissionError = errorMessage.toLowerCase().includes('verweig') || 
                             errorMessage.toLowerCase().includes('berechtigung') ||
                             errorMessage.toLowerCase().includes('deny') ||
                             errorMessage.toLowerCase().includes('permission');
  
  // Browser-Typ erkennen für spezifische Hilfestellung
  const userAgent = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  const isChrome = /chrome|chromium/i.test(userAgent) && !/edge|edg/i.test(userAgent);
  const isFirefox = /firefox/i.test(userAgent);
  const isEdge = /edge|edg/i.test(userAgent);
  
  // Hilfetexte je nach Browser
  const getBrowserHelp = () => {
    if (isSafari) {
      return (
        <div className="text-xs mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
          <p className="font-semibold">Safari-Tipp:</p>
          <ol className="list-decimal pl-4 mt-1">
            <li>Öffnen Sie Safari &gt; Einstellungen &gt; Websites &gt; Standort</li>
            <li>Erlauben Sie den Standortzugriff für diese Website</li>
            <li>Laden Sie die Seite neu</li>
          </ol>
        </div>
      );
    } else if (isChrome) {
      return (
        <div className="text-xs mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded">
          <p className="font-semibold">Chrome-Tipp:</p>
          <ol className="list-decimal pl-4 mt-1">
            <li>Klicken Sie auf das Schlosssymbol in der Adressleiste</li>
            <li>Wählen Sie "Standort" und stellen Sie auf "Zulassen"</li>
            <li>Laden Sie die Seite neu</li>
          </ol>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute bottom-4 left-0 right-0 mx-auto w-[90%] max-w-md bg-white border border-yellow-200 p-4 rounded-md shadow-lg z-10">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-sm text-amber-800">Problem mit dem Standortzugriff</h4>
          <p className="text-sm text-amber-700 mt-1">{errorMessage}</p>
          
          {isPermissionError && getBrowserHelp()}
          
          <div className="flex gap-2 mt-3">
            <Button 
              variant="default" 
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={onRetry}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Erneut versuchen
            </Button>
            
            {isPermissionError && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-amber-200 text-amber-700"
                onClick={() => {
                  // Öffne Browsereinstellungen oder zeige weitere Hilfe an
                  window.open('https://www.enable-javascript.com/de/standortdienste/', '_blank');
                }}
              >
                <HelpCircle className="h-3.5 w-3.5 mr-1" />
                Hilfe erhalten
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationErrorDisplay;
