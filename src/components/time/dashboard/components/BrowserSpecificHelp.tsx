
import { Info } from 'lucide-react';

interface BrowserSpecificHelpProps {
  browserType: string;
}

/**
 * Zeigt browser-spezifische Hilfehinweise an
 */
const BrowserSpecificHelp = ({ browserType }: BrowserSpecificHelpProps) => {
  if (browserType !== "safari") {
    return null;
  }

  return (
    <div className="mt-2 p-2 bg-white/70 border border-amber-200 rounded-md text-amber-800">
      <div className="flex items-center gap-1 font-semibold">
        <Info className="h-3 w-3" />
        <span>Safari-Tipp:</span>
      </div>
      <p className="mt-1">Safari hat bekannte Probleme mit dem Standortzugriff. Bitte versuchen Sie:</p>
      <ol className="list-decimal pl-5 mt-1 text-left">
        <li>Safari vollständig neu starten</li>
        <li>In Safari {'>'}  Einstellungen {'>'}  Websites {'>'}  Standort nachsehen</li>
        <li>Diese Seite in einem privaten Fenster öffnen</li>
        <li>Einen anderen Browser verwenden</li>
      </ol>
    </div>
  );
};

export default BrowserSpecificHelp;
