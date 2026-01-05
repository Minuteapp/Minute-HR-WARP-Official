import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Check, AlertTriangle, Clock } from "lucide-react";

const DocumentProcessing = () => {
  const documents = [
    {
      name: "Schulungsunterlagen_Projektmanagement.pdf",
      status: "analyzed",
      confidence: 95,
      type: "Schulung"
    },
    {
      name: "Onboarding_Checkliste_Template.docx",
      status: "processing",
      confidence: 80,
      type: "Onboarding"
    },
    {
      name: "Bewerbung_Max_Mustermann.pdf",
      status: "pending",
      confidence: 0,
      type: "Recruiting"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg border-primary/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">Dokumentenverarbeitung</h2>
          </div>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Dokument hochladen
          </Button>
        </div>

        <div className="space-y-4">
          {documents.map((doc, index) => (
            <Card key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-gray-600">{doc.type}</p>
                </div>
                <div className="flex items-center gap-4">
                  {doc.status === "analyzed" ? (
                    <span className="flex items-center text-green-600">
                      <Check className="w-4 h-4 mr-1" />
                      Analysiert
                    </span>
                  ) : doc.status === "processing" ? (
                    <span className="flex items-center text-yellow-600">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      In Bearbeitung
                    </span>
                  ) : (
                    <span className="flex items-center text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      Ausstehend
                    </span>
                  )}
                  {doc.confidence > 0 && (
                    <span className="text-sm text-gray-600">
                      Konfidenz: {doc.confidence}%
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DocumentProcessing;