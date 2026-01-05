
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, AlertTriangle } from "lucide-react";

const ImportExport = () => {
  const handleExport = () => {
    // Hier würde normalerweise ein Export stattfinden
    console.log('Exportiere Unternehmensdaten...');
    
    // Simuliere einen Download
    const dummyData = {
      company: {
        name: 'Muster GmbH',
        legalForm: 'GmbH',
        taxId: 'DE123456789',
        // ... weitere Daten
      },
      // ... weitere Daten
    };
    
    const dataStr = JSON.stringify(dummyData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'unternehmensdaten.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daten exportieren</CardTitle>
            <CardDescription>
              Exportieren Sie Ihre Unternehmensdaten als JSON-Datei für Backup-Zwecke oder zur Übertragung.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Der Export enthält alle Unternehmensinformationen, Benutzerprofile und Einstellungen.
                Sensitive Daten werden gesondert geschützt.
              </p>
              
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Unternehmensdaten exportieren
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Daten importieren</CardTitle>
            <CardDescription>
              Importieren Sie Unternehmensdaten aus einer JSON-Datei.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Achtung</AlertTitle>
                <AlertDescription>
                  Beim Import werden vorhandene Daten überschrieben. Erstellen Sie vorher ein Backup.
                </AlertDescription>
              </Alert>
              
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                JSON-Datei importieren
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daten-Migration</CardTitle>
          <CardDescription>
            Migrieren Sie Daten aus anderen Systemen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Wir unterstützen die Migration aus gängigen HR- und Personalverwaltungssystemen.
              Für spezielle Anforderungen kontaktieren Sie bitte unseren Support.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-6 flex-col">
                <img 
                  src="/lovable-uploads/840a513c-5bfd-4036-af4a-70103e900e87.png" 
                  alt="Excel" 
                  className="h-8 w-8 mb-2 opacity-70"
                />
                <span>Excel importieren</span>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 flex-col">
                <img 
                  src="/lovable-uploads/840a513c-5bfd-4036-af4a-70103e900e87.png" 
                  alt="CSV" 
                  className="h-8 w-8 mb-2 opacity-70"
                />
                <span>CSV importieren</span>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 flex-col">
                <img 
                  src="/lovable-uploads/840a513c-5bfd-4036-af4a-70103e900e87.png" 
                  alt="Externe API" 
                  className="h-8 w-8 mb-2 opacity-70"
                />
                <span>API-Verbindung</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportExport;
