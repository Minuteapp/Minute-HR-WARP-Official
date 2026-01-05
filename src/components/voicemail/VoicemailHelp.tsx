
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone,
  Mail,
  FileText,
  ChevronRight 
} from "lucide-react";

const VoicemailHelp = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
        <HelpCircle className="h-5 w-5 text-[#FF6B00]" />
        <h2 className="text-lg font-semibold text-gray-900">Hilfe & Support</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-base font-medium mb-4">FAQ</h3>
          <div className="space-y-4">
            {[
              "Wie richte ich eine neue Ansage ein?",
              "Wie kann ich die Audioqualität verbessern?",
              "Wie aktiviere ich Benachrichtigungen?",
              "Wie lösche ich alte Ansagen?"
            ].map((question, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-between"
              >
                <span className="text-left">{question}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-base font-medium mb-4">Kontakt</h3>
          <div className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-3">
              <MessageCircle className="h-4 w-4 text-[#FF6B00]" />
              Live Chat
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <Phone className="h-4 w-4 text-[#FF6B00]" />
              +49 (0) 123 456 789
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <Mail className="h-4 w-4 text-[#FF6B00]" />
              support@hiprocall.com
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3">
              <FileText className="h-4 w-4 text-[#FF6B00]" />
              Dokumentation
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoicemailHelp;
