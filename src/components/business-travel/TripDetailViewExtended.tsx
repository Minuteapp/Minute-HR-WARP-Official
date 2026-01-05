import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTripDetails } from "@/hooks/useTripDetails";
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Calendar, 
  Clock, 
  MapPin, 
  Euro, 
  Plane,
  Hotel,
  Users,
  CheckSquare,
  Plus,
  Phone,
  Mail,
  Star,
  Share2,
  MessageSquare,
  Bell,
  FileText,
  AlertTriangle,
  Globe,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import TripItineraryTab from "./tabs/TripItineraryTab";
import TripBudgetTab from "./tabs/TripBudgetTab";
import TripDocumentsTab from "./tabs/TripDocumentsTab";

interface TripDetailViewExtendedProps {
  tripId: string;
  onBack: () => void;
  employeeInfo?: {
    name: string;
    email: string;
    avatar: string | null;
    department: string;
    position: string;
    employeeId: string;
  };
}

const TripDetailViewExtended = ({ tripId, onBack, employeeInfo }: TripDetailViewExtendedProps) => {
  const { 
    trip, 
    hotels, 
    meetingLocations, 
    agendaItems, 
    projects, 
    tasks, 
    flightDetails,
    costs,
    documents,
    isLoading,
    addProject,
    addTask,
    toggleTask
  } = useTripDetails(tripId);

  const [activeTab, setActiveTab] = useState("overview");
  const [newProject, setNewProject] = useState("");
  const [newTask, setNewTask] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd. MMM yyyy", { locale: de });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
  };

  const getDurationDays = () => {
    if (!trip) return 0;
    if (trip.duration_days) return trip.duration_days;
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getCityImage = () => {
    if (!trip) return "";
    if (trip.destination_image_url) return trip.destination_image_url;
    
    const cityImages: Record<string, string> = {
      "münchen": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200",
      "munich": "https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200",
      "berlin": "https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200",
      "frankfurt": "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200",
      "hamburg": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
      "london": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200",
      "paris": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200",
      "new york": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200",
      "tokyo": "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200",
    };

    const cityKey = (trip.city || trip.destination || "").toLowerCase();
    return cityImages[cityKey] || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200";
  };

  const handleAddProject = () => {
    if (newProject.trim()) {
      addProject(newProject.trim());
      setNewProject("");
      setShowAddProject(false);
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      addTask(newTask.trim());
      setNewTask("");
      setShowAddTask(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      upcoming: { label: "Bevorstehend", className: "bg-blue-100 text-blue-800" },
      approved: { label: "Genehmigt", className: "bg-green-100 text-green-800" },
      pending: { label: "Ausstehend", className: "bg-orange-100 text-orange-800" },
      completed: { label: "Abgeschlossen", className: "bg-gray-100 text-gray-800" },
    };
    const info = statusMap[status.toLowerCase()] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  if (isLoading || !trip) {
    return <div className="flex items-center justify-center p-8">Lade Reisedetails...</div>;
  }

  const hotel = hotels[0];
  const flight = flightDetails[0];
  const tripNumber = (trip as any).trip_number || `TR-${trip.id.substring(0, 6).toUpperCase()}`;
  const priority = (trip as any).priority || "normal";
  const isHighPriority = priority === "high";

  return (
    <div className="space-y-6">
      {/* Hero Image with Header */}
      <div className="relative h-72 rounded-lg overflow-hidden">
        <img 
          src={getCityImage()} 
          alt={trip.city || trip.destination || "Reiseziel"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="secondary" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Location Info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4" />
            <span className="text-2xl font-bold">{trip.city?.toUpperCase() || trip.destination?.toUpperCase()}</span>
          </div>
          <p className="text-sm opacity-90 mb-2">
            {trip.destination}, {trip.city} • {trip.country || "Deutschland"}
          </p>
          <div className="flex items-center gap-2 text-sm opacity-75">
            <Globe className="h-4 w-4" />
            <span>{(trip as any).timezone || "CET (UTC+1)"}</span>
          </div>
          <div className="flex gap-2 mt-3">
            {getStatusBadge("upcoming")}
            {getStatusBadge(trip.status)}
          </div>
        </div>
      </div>

      {/* Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{trip.title || trip.destination}</h1>
          <p className="text-muted-foreground text-sm">
            Reise-ID: {tripNumber} • Erstellt am {formatDate(trip.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Kommentar
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Benachrichtigen
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards with colored border */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Dauer</p>
            <p className="text-xl font-bold">{getDurationDays()} Tage</p>
            <p className="text-xs text-muted-foreground">{getDurationDays() - 1} Übernachtungen</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-xl font-bold">{formatCurrency(trip.budget || 0)}</p>
            <p className="text-xs text-muted-foreground">Geplant</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Flug</p>
            <p className="text-xl font-bold">{flight?.airline || "N/A"}</p>
            <p className="text-xs text-muted-foreground">{flight?.flight_number || "-"}</p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${isHighPriority ? "border-l-red-500" : "border-l-orange-500"}`}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Priorität</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold capitalize">{priority}</p>
              {isHighPriority && <AlertTriangle className="h-4 w-4 text-red-500" />}
            </div>
            <p className="text-xs text-muted-foreground">Dringlichkeit</p>
          </CardContent>
        </Card>
      </div>

      {/* Sub-Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="itinerary">Reiseverlauf</TabsTrigger>
          <TabsTrigger value="budget">Budget & Kosten</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Traveler Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Reisender
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={employeeInfo?.avatar || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">
                        {getInitials(employeeInfo?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-lg font-semibold">{employeeInfo?.name || "Mitarbeiter"}</h4>
                      <p className="text-sm text-muted-foreground">{employeeInfo?.position || "Position"}</p>
                      <p className="text-sm text-muted-foreground">{employeeInfo?.department || "Abteilung"}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{employeeInfo?.email || "email@example.com"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>ID: {employeeInfo?.employeeId || "N/A"}</span>
                        <span>Abteilung: {employeeInfo?.department}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trip Purpose */}
              <Card>
                <CardHeader>
                  <CardTitle>Reisezweck & Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{trip.description || "Geschäftsreise"}</p>
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge("upcoming")}
                    {getStatusBadge(trip.status)}
                    <Badge variant={isHighPriority ? "destructive" : "secondary"} className="capitalize">
                      {priority} Priorität
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Beantragt am</p>
                      <p className="font-medium">{formatDate(trip.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Genehmigt von</p>
                      <p className="font-medium">{(trip as any).approved_by || "Ausstehend"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flight Information Extended */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Fluginformationen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flightDetails.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Keine Flugdaten vorhanden</p>
                  ) : (
                    <div className="space-y-6">
                      {flightDetails.map((fl: any, index: number) => (
                        <div key={fl.id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{index === 0 ? "Hinflug" : "Rückflug"}</h4>
                            <Badge variant={fl.status === "on_time" ? "default" : "secondary"}>
                              {fl.status === "on_time" ? "On Time" : fl.status || "Scheduled"}
                            </Badge>
                          </div>
                          
                          {/* Flight Visual */}
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{fl.departure_airport || "FRA"}</p>
                              <p className="text-lg font-semibold">{fl.departure_time || "08:00"}</p>
                              <p className="text-xs text-muted-foreground">
                                Terminal {fl.departure_terminal || "-"} • Gate {fl.departure_gate || "-"}
                              </p>
                            </div>
                            <div className="flex-1 flex flex-col items-center px-4">
                              <div className="w-full border-t border-dashed relative">
                                <Plane className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background" />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {fl.duration_minutes ? `${Math.floor(fl.duration_minutes / 60)}h ${fl.duration_minutes % 60}min` : "Direkt"}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">{fl.arrival_airport || "JFK"}</p>
                              <p className="text-lg font-semibold">{fl.arrival_time || "12:15"}</p>
                              <p className="text-xs text-muted-foreground">
                                Terminal {fl.arrival_terminal || "-"} • Gate {fl.arrival_gate || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Flight Details Grid */}
                          <div className="grid grid-cols-4 gap-4 text-sm border-t pt-4">
                            <div>
                              <p className="text-muted-foreground">Fluggesellschaft</p>
                              <p className="font-medium">{fl.airline || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Flugnummer</p>
                              <p className="font-medium">{fl.flight_number || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Klasse</p>
                              <p className="font-medium">{fl.flight_class || "Economy"}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Flugzeug</p>
                              <p className="font-medium">{fl.aircraft_type || "N/A"}</p>
                            </div>
                          </div>
                          {index < flightDetails.length - 1 && <hr />}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Hotel Extended */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="h-5 w-5" />
                      Hotelunterkunft
                    </CardTitle>
                    {hotel && (
                      <Badge variant="secondary">{hotel.nights || getDurationDays() - 1} Nächte</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!hotel ? (
                    <p className="text-muted-foreground text-center py-4">Keine Hoteldaten vorhanden</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{hotel.hotel_name}</h4>
                        <div className="flex">
                          {Array.from({ length: hotel.hotel_rating || 0 }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      
                      {hotel.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{hotel.address}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-4">
                        <div>
                          <p className="text-muted-foreground">Check-in</p>
                          <p className="font-medium">{hotel.check_in ? formatDate(hotel.check_in) : "-"}</p>
                          <p className="text-xs text-muted-foreground">{(hotel as any).check_in_time || "15:00"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Check-out</p>
                          <p className="font-medium">{hotel.check_out ? formatDate(hotel.check_out) : "-"}</p>
                          <p className="text-xs text-muted-foreground">{(hotel as any).check_out_time || "11:00"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Zimmertyp</p>
                          <p className="font-medium">{hotel.room_type || "Standard"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Verpflegung</p>
                          <p className="font-medium">{(hotel as any).meal_plan || "Frühstück"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Agenda */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Agenda / Termine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {agendaItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Keine Termine vorhanden</p>
                  ) : (
                    <div className="space-y-4">
                      {agendaItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-3 border-l-2 border-green-500 pl-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-green-600">{item.title}</h4>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span>{formatDate(item.agenda_date)}</span>
                              {item.agenda_time && <span>{formatTime(item.agenda_time)}</span>}
                            </div>
                            {item.location && (
                              <p className="text-sm text-muted-foreground">{item.location}</p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Projects and Tasks */}
              <div className="grid grid-cols-1 gap-6">
                {/* Projects */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Zugeordnete Projekte</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddProject(!showAddProject)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Hinzufügen
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showAddProject && (
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Projektname..."
                          value={newProject}
                          onChange={(e) => setNewProject(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
                        />
                        <Button onClick={handleAddProject}>Speichern</Button>
                      </div>
                    )}
                    {projects.length === 0 ? (
                      <p className="text-muted-foreground text-center py-2">Keine Projekte zugeordnet</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {projects.map((project) => (
                          <Badge key={project.id} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {project.project_name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tasks */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="h-5 w-5" />
                        Aufgaben ({tasks.length})
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowAddTask(!showAddTask)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Hinzufügen
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showAddTask && (
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Aufgabentitel..."
                          value={newTask}
                          onChange={(e) => setNewTask(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                        />
                        <Button onClick={handleAddTask}>Speichern</Button>
                      </div>
                    )}
                    {tasks.length === 0 ? (
                      <p className="text-muted-foreground text-center py-2">Keine Aufgaben vorhanden</p>
                    ) : (
                      <div className="space-y-2">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-3">
                            <Checkbox
                              checked={task.is_completed}
                              onCheckedChange={(checked) => 
                                toggleTask({ taskId: task.id, isCompleted: checked as boolean })
                              }
                            />
                            <span className={task.is_completed ? "line-through text-muted-foreground" : ""}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="itinerary" className="mt-6">
          <TripItineraryTab
            startDate={trip.start_date}
            endDate={trip.end_date}
            flightDetails={flightDetails}
            hotels={hotels}
            agendaItems={agendaItems}
          />
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <TripBudgetTab
            budget={trip.budget || 0}
            costs={costs}
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <TripDocumentsTab
            documents={documents}
            notes={trip.description}
          />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
        <span>Letzte Aktualisierung: {format(new Date(trip.updated_at), "dd.MM.yyyy, HH:mm", { locale: de })} Uhr</span>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button>Änderungen speichern</Button>
        </div>
      </div>
    </div>
  );
};

export default TripDetailViewExtended;
