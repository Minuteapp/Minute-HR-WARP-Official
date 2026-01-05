
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Book, Video, Mail, MessageSquare, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const ShiftPlanningHelp = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => navigate('/shift-planning')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">Schichtplanung - Hilfe & Support</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5 text-primary" />
              Dokumentation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-2">
              Ausführliche Informationen zur Verwendung aller Funktionen der Schichtplanung.
            </CardDescription>
            <Button variant="secondary" size="sm" className="w-full">
              Dokumentation öffnen
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              Video-Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-2">
              Lernvideos für die verschiedenen Funktionen der Schichtplanung.
            </CardDescription>
            <Button variant="secondary" size="sm" className="w-full">
              Videos ansehen
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Support kontaktieren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-2">
              Haben Sie ein Problem oder eine Frage? Kontaktieren Sie uns.
            </CardDescription>
            <Button variant="secondary" size="sm" className="w-full">
              Support-Ticket erstellen
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-2">
              Tauschen Sie sich mit anderen Nutzern über Best Practices aus.
            </CardDescription>
            <Button variant="secondary" size="sm" className="w-full">
              Community besuchen
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Häufig gestellte Fragen</h2>
        <Accordion type="single" collapsible className="bg-white rounded-lg border">
          <AccordionItem value="item-1">
            <AccordionTrigger className="px-4">Wie erstelle ich einen neuen Schichtplan?</AccordionTrigger>
            <AccordionContent className="px-4">
              Navigieren Sie zum Reiter "Kalender" und klicken Sie auf "Neuen Plan erstellen". Wählen Sie den Zeitraum und die Mitarbeiter aus, und ziehen Sie die gewünschten Schichten per Drag & Drop in den Kalender.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="px-4">Wie kann ich Schichten tauschen lassen?</AccordionTrigger>
            <AccordionContent className="px-4">
              Im Reiter "Zuweisung" können Sie die Funktion "Schichttausch" aktivieren. Mitarbeiter können dann Tauschwünsche einreichen, die von Ihnen genehmigt werden müssen.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="px-4">Was bedeuten die Farben in der Heatmap?</AccordionTrigger>
            <AccordionContent className="px-4">
              Die Farben zeigen den Besetzungsgrad: Rot = unterbesetzt, Orange = kritisch, Grün = optimal, Blau = überbesetzt, Grau = leer.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="px-4">Wie kann ich die KI-Funktionen nutzen?</AccordionTrigger>
            <AccordionContent className="px-4">
              Im Reiter "KI-Assistent" können Sie die automatische Schichtplanung aktivieren. Die KI berücksichtigt dabei Faktoren wie Qualifikation, Verfügbarkeit und Auslastung der Mitarbeiter.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="px-4">Wie exportiere ich Schichtpläne?</AccordionTrigger>
            <AccordionContent className="px-4">
              Im Reiter "Berichte" können Sie verschiedene Exportformate wählen (PDF, Excel, CSV) und den Zeitraum sowie die zu exportierenden Daten festlegen.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ShiftPlanningHelp;
