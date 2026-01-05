
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, MessageSquare, FileCheck, Clock, CalendarDays, Bookmark } from "lucide-react";
import { OnboardingProcess } from '@/types/onboarding.types';
import { useNavigate } from 'react-router-dom';

interface PreboardingModeProps {
  process: any; // OnboardingProcess mit zusätzlichen Join-Daten
  mentorInfo?: {
    id: string;
    name: string;
    avatar_url?: string;
    position?: string;
    email?: string;
  };
  documents?: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
  }>;
  upcomingEvents?: Array<{
    id: string;
    title: string;
    date: string;
    time?: string;
    type: string;
  }>;
  firstDayInfo?: {
    time: string;
    location: string;
    contactPerson: string;
    additionalInfo?: string;
    workplaceImage?: string;
  };
}

const PreboardingMode: React.FC<PreboardingModeProps> = ({
  process,
  mentorInfo,
  documents = [],
  upcomingEvents = [],
  firstDayInfo
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('welcome');

  // Beispiel-Begrüßungsnachricht
  const welcomeMessage = `
    Herzlich willkommen im Team, ${process?.employee?.first_name || 'Neues Teammitglied'}!
    
    Wir freuen uns sehr, Sie bald bei uns begrüßen zu dürfen. Bis zu Ihrem ersten Arbeitstag am ${process?.start_date ? new Date(process.start_date).toLocaleDateString('de-DE') : 'festgelegten Datum'} haben Sie hier die Möglichkeit, sich schon etwas mit unserem Unternehmen vertraut zu machen.
    
    In diesem Preboarding-Bereich finden Sie wichtige Informationen, erste Dokumente und Kontakte, die Ihnen den Start erleichtern sollen. Zögern Sie nicht, bei Fragen Ihren Mentor zu kontaktieren.
    
    Wir freuen uns auf eine erfolgreiche Zusammenarbeit!
  `;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 rounded-t-lg">
          <h1 className="text-2xl font-semibold text-center">Willkommen bei {process?.company?.name || 'Unserem Unternehmen'}</h1>
          <p className="text-center text-muted-foreground mt-2">
            Ihr erster Arbeitstag ist am {process?.start_date ? new Date(process.start_date).toLocaleDateString('de-DE') : '(noch nicht festgelegt)'}
          </p>
        </div>
        
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-3/4">
              <Tabs defaultValue="welcome" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="welcome">Willkommen</TabsTrigger>
                  <TabsTrigger value="documents">Dokumente</TabsTrigger>
                  <TabsTrigger value="firstDay">Erster Tag</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="welcome" className="space-y-4">
                  <div className="bg-muted/40 p-4 rounded-lg whitespace-pre-line">
                    {welcomeMessage}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-between h-auto py-4"
                      onClick={() => setActiveTab('documents')}
                    >
                      <div className="flex items-center">
                        <FileCheck className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Wichtige Dokumente</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-between h-auto py-4"
                      onClick={() => setActiveTab('firstDay')}
                    >
                      <div className="flex items-center">
                        <CalendarDays className="h-5 w-5 mr-2 text-green-500" />
                        <span>Informationen zum ersten Tag</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    {upcomingEvents.length > 0 && (
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-between h-auto py-4"
                        onClick={() => navigate('/calendar')}
                      >
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 mr-2 text-orange-500" />
                          <span>Anstehende Termine</span>
                        </div>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center justify-between h-auto py-4"
                      onClick={() => setActiveTab('faq')}
                    >
                      <div className="flex items-center">
                        <Bookmark className="h-5 w-5 mr-2 text-purple-500" />
                        <span>Häufig gestellte Fragen</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="documents" className="space-y-4">
                  <h2 className="text-xl font-semibold">Wichtige Dokumente</h2>
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map(doc => (
                        <Card key={doc.id} className="overflow-hidden">
                          <div className="flex items-center p-4">
                            <div className="p-2 bg-muted rounded mr-4">
                              <FileCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{doc.title}</h4>
                              <p className="text-sm text-muted-foreground">{doc.type}</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                Ansehen
                              </a>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Noch keine Dokumente verfügbar. Diese werden vor Ihrem ersten Arbeitstag bereitgestellt.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="firstDay" className="space-y-4">
                  <h2 className="text-xl font-semibold">Ihr erster Tag bei uns</h2>
                  
                  {firstDayInfo ? (
                    <div className="space-y-4">
                      <Card className="p-4">
                        <h3 className="font-semibold mb-2">Ankunftszeit & Ort</h3>
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{firstDayInfo.time} Uhr</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{firstDayInfo.location}</span>
                        </div>
                      </Card>
                      
                      <Card className="p-4">
                        <h3 className="font-semibold mb-2">Ansprechpartner vor Ort</h3>
                        <p>{firstDayInfo.contactPerson}</p>
                      </Card>
                      
                      {firstDayInfo.additionalInfo && (
                        <Card className="p-4">
                          <h3 className="font-semibold mb-2">Zusätzliche Informationen</h3>
                          <p>{firstDayInfo.additionalInfo}</p>
                        </Card>
                      )}
                      
                      {firstDayInfo.workplaceImage && (
                        <Card className="p-4">
                          <h3 className="font-semibold mb-2">Ihr Arbeitsplatz</h3>
                          <div className="mt-2">
                            <img 
                              src={firstDayInfo.workplaceImage} 
                              alt="Arbeitsplatz" 
                              className="rounded-lg w-full object-cover h-48"
                            />
                          </div>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Details zu Ihrem ersten Tag werden noch festgelegt und hier bald verfügbar sein.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="faq" className="space-y-4">
                  <h2 className="text-xl font-semibold">Häufig gestellte Fragen</h2>
                  
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h3 className="font-semibold">Wie ist der Ablauf am ersten Tag?</h3>
                      <p className="mt-2 text-muted-foreground">
                        An Ihrem ersten Tag werden Sie von Ihrem Ansprechpartner in Empfang genommen. Nach einer kurzen Begrüßung folgt eine Bürorundführung und die Vorstellung im Team. Anschließend erhalten Sie Ihre Arbeitsmaterialien und eine Einführung in unsere Systeme.
                      </p>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-semibold">Was sollte ich mitbringen?</h3>
                      <p className="mt-2 text-muted-foreground">
                        Bitte bringen Sie Ihren Personalausweis, Ihre Steueridentifikationsnummer und Ihre Sozialversicherungsnummer mit. Falls noch nicht geschehen, auch die unterschriebenen Dokumente aus dem Dokumentenbereich.
                      </p>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-semibold">Wie ist der Dresscode?</h3>
                      <p className="mt-2 text-muted-foreground">
                        In unserem Unternehmen pflegen wir einen business-casual Dresscode. Jeans und ein gepflegtes Hemd/Bluse sind völlig in Ordnung. Bei Kundenterminen empfehlen wir business-formelle Kleidung.
                      </p>
                    </Card>
                    
                    <Card className="p-4">
                      <h3 className="font-semibold">Wie sind die Arbeitszeiten?</h3>
                      <p className="mt-2 text-muted-foreground">
                        Wir arbeiten mit einem Gleitzeitmodell. Die Kernarbeitszeit liegt zwischen 10:00 und 15:00 Uhr. Die restliche Zeit können Sie flexibel einteilen, solange Sie Ihre Wochenstunden erreichen.
                      </p>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="md:w-1/4 space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md">Ihr Mentor</CardTitle>
                </CardHeader>
                <CardContent>
                  {mentorInfo ? (
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20">
                        <AvatarImage src={mentorInfo.avatar_url} alt={mentorInfo.name} />
                        <AvatarFallback>{mentorInfo.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h4 className="font-semibold mt-2">{mentorInfo.name}</h4>
                      {mentorInfo.position && (
                        <p className="text-sm text-muted-foreground">{mentorInfo.position}</p>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-3 w-full"
                        onClick={() => navigate('/chat')}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Nachricht senden
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Ihnen wurde noch kein Mentor zugewiesen.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {upcomingEvents.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md">Anstehende Termine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {upcomingEvents.slice(0, 3).map(event => (
                        <div key={event.id} className="flex items-center">
                          <div className="p-2 bg-muted rounded mr-3">
                            <CalendarDays className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(event.date).toLocaleDateString('de-DE')}
                              {event.time && `, ${event.time} Uhr`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreboardingMode;
