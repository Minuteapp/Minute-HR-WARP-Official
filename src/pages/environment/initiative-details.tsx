
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, Check, Clock, Target, Users, Leaf, BarChart, FileText, MessageSquare } from "lucide-react";
import { useEnvironmentStore } from "@/stores/useEnvironmentStore";
import { Initiative } from "@/stores/useEnvironmentStore";

const InitiativeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { initiatives } = useEnvironmentStore();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const foundInitiative = initiatives.find(i => i.id === id);
      if (foundInitiative) {
        setInitiative(foundInitiative);
      }
      setLoading(false);
    }
  }, [id, initiatives]);

  if (loading) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-green-500 border-b-green-500 border-r-transparent border-l-transparent animate-spin"></div>
          <p className="text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Initiative nicht gefunden</h2>
          <p className="text-gray-600 mb-6">Die gesuchte Initiative konnte leider nicht gefunden werden.</p>
          <Button onClick={() => navigate('/environment')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-amber-100 text-amber-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <Check className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-progress': return 'In Bearbeitung';
      case 'completed': return 'Abgeschlossen';
      case 'planned': return 'Geplant';
      case 'archived': return 'Archiviert';
      default: return status;
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nicht definiert';
    return new Date(dateString).toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/environment')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{initiative.title}</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <Badge variant="outline" className={getStatusColor(initiative.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(initiative.status)}
              {getStatusText(initiative.status)}
            </div>
          </Badge>
          
          {initiative.tags?.map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Zeitraum</h3>
            </div>
            <p className="text-gray-700">
              Von: {formatDate(initiative.startDate)}
            </p>
            {initiative.endDate && (
              <p className="text-gray-700">
                Bis: {formatDate(initiative.endDate)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Verantwortlich</h3>
            </div>
            <p className="text-gray-700">
              {initiative.responsible || 'Nicht zugewiesen'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold">Fortschritt</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{initiative.progress}% abgeschlossen</span>
              </div>
              <Progress value={initiative.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="uebersicht" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="uebersicht">
            <Leaf className="mr-2 h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="kennzahlen">
            <BarChart className="mr-2 h-4 w-4" />
            Kennzahlen
          </TabsTrigger>
          <TabsTrigger value="dokumente">
            <FileText className="mr-2 h-4 w-4" />
            Dokumente
          </TabsTrigger>
          <TabsTrigger value="kommentare">
            <MessageSquare className="mr-2 h-4 w-4" />
            Kommentare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="uebersicht">
          <Card>
            <CardHeader>
              <CardTitle>Beschreibung</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {initiative.description || 'Keine Beschreibung vorhanden.'}
              </p>
              
              {initiative.budget && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Budget</h3>
                  <p className="text-gray-700">
                    {initiative.budget.toLocaleString('de-DE')} €
                  </p>
                </div>
              )}
              
              {initiative.goals && initiative.goals.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Ziele</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {initiative.goals.map((goal, index) => (
                      <li key={index} className="text-gray-700">{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="kennzahlen">
          <Card>
            <CardHeader>
              <CardTitle>Leistungskennzahlen</CardTitle>
            </CardHeader>
            <CardContent>
              {initiative.metrics && initiative.metrics.length > 0 ? (
                <div className="space-y-6">
                  {initiative.metrics.map((metric, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{metric.name}</h4>
                        <Badge variant="outline">
                          {metric.value} / {metric.target} {metric.unit}
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(metric.value / metric.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  Keine Kennzahlen für diese Initiative vorhanden.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="dokumente">
          <Card>
            <CardHeader>
              <CardTitle>Dokumente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-4">
                Keine Dokumente für diese Initiative hochgeladen.
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Dokument hochladen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="kommentare">
          <Card>
            <CardHeader>
              <CardTitle>Kommentare</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center py-4">
                Keine Kommentare für diese Initiative.
              </p>
            </CardContent>
            <CardFooter>
              <Button disabled className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Kommentar hinzufügen
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/environment')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>
        <Button disabled>
          Bearbeiten
        </Button>
      </div>
    </div>
  );
};

export default InitiativeDetails;
