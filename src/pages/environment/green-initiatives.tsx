
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PencilLine, FileText, Target, Users, Calendar, ChartBar, ClipboardList, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GreenInitiatives = () => {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/environment">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex flex-1 justify-between items-center">
          <h1 className="text-3xl font-bold">Green Initiativen</h1>
          <Button className="flex items-center gap-2">
            <PencilLine className="h-4 w-4" />
            Neue Initiative erstellen
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Übersicht
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Planung
          </TabsTrigger>
          <TabsTrigger value="reporting" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Berichte
          </TabsTrigger>
          <TabsTrigger value="teams" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teams
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            Fortschritt
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Aufgaben
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Aktive Initiativen</h3>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium">Papierloses Büro</h4>
                  <p className="text-sm text-gray-600">Ziel: 90% Reduzierung bis Q4</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium">Energieeinsparung</h4>
                  <p className="text-sm text-gray-600">Ziel: 25% Reduzierung bis Q3</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Nächste Meilensteine</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">LED Umrüstung</p>
                    <p className="text-sm text-gray-600">Fällig in 2 Wochen</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">In Arbeit</span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Recycling Schulung</p>
                    <p className="text-sm text-gray-600">Fällig in 1 Monat</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Geplant</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Team Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Büro Team</span>
                    <span className="text-sm text-green-600">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Produktion</span>
                    <span className="text-sm text-green-600">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="planning" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Initiativenplanung</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Kurzfristige Ziele</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Energieverbrauch optimieren</li>
                    <li>Recycling-System einführen</li>
                    <li>Mitarbeiter-Schulungen durchführen</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Langfristige Ziele</h4>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>CO2-Neutralität erreichen</li>
                    <li>Vollständig erneuerbare Energien</li>
                    <li>Zero-Waste-Produktion</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Berichtswesen</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Quartalsbericht Q1</h4>
                  <p className="text-sm text-gray-600">Fortschrittsbericht der Nachhaltigkeitsinitiativen</p>
                </div>
                <Button variant="outline">Download</Button>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Jahresbericht 2023</h4>
                  <p className="text-sm text-gray-600">Gesamtübersicht aller Umweltinitiativen</p>
                </div>
                <Button variant="outline">Download</Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Team Übersicht</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Energieteam</h4>
                  <p className="text-sm text-gray-600 mb-2">5 Mitglieder</p>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recyclingteam</h4>
                  <p className="text-sm text-gray-600 mb-2">4 Mitglieder</p>
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Schulungsteam</h4>
                  <p className="text-sm text-gray-600 mb-2">3 Mitglieder</p>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Fortschrittsübersicht</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Papierloses Büro</span>
                    <span className="text-green-600">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Energieeinsparung</span>
                    <span className="text-yellow-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Recycling-Quote</span>
                    <span className="text-blue-600">90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Aufgabenliste</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  <div>
                    <p className="font-medium">LED-Beleuchtung installieren</p>
                    <p className="text-sm text-gray-600">Fällig: 15.03.2024</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">In Arbeit</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  <div>
                    <p className="font-medium">Recycling-Schulung durchführen</p>
                    <p className="text-sm text-gray-600">Fällig: 01.04.2024</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Geplant</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  <div>
                    <p className="font-medium">Energieverbrauch dokumentieren</p>
                    <p className="text-sm text-gray-600">Fällig: Wöchentlich</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Wiederkehrend</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GreenInitiatives;
