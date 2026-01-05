import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTripDetails } from "@/hooks/useTripDetails";
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Calendar, 
  Clock, 
  MapPin, 
  Euro, 
  Leaf,
  Plane,
  Hotel,
  Users,
  CheckSquare,
  Plus,
  Phone,
  Mail,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";

interface TripDetailViewProps {
  tripId: string;
  onBack: () => void;
}

const TripDetailView = ({ tripId, onBack }: TripDetailViewProps) => {
  const { 
    trip, 
    hotels, 
    meetingLocations, 
    agendaItems, 
    projects, 
    tasks, 
    flightDetails,
    isLoading,
    addProject,
    addTask,
    toggleTask
  } = useTripDetails(tripId);

  const [newProject, setNewProject] = useState("");
  const [newTask, setNewTask] = useState("");
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
  };

  const formatTime = (timeStr: string) => {
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

  if (isLoading || !trip) {
    return <div className="flex items-center justify-center p-8">Lade Reisedetails...</div>;
  }

  const hotel = hotels[0];
  const meetingLocation = meetingLocations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">
              {trip.country?.toUpperCase() || "DEUTSCHLAND"} - {trip.title || trip.destination}
            </h2>
            <p className="text-muted-foreground">{trip.description || "Geschäftsreise"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        <img 
          src={getCityImage()} 
          alt={trip.city || trip.destination || "Reiseziel"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge className="bg-orange-100 text-orange-800">{trip.status}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-3xl font-bold">{trip.city || trip.destination}</p>
          <p className="text-lg">{trip.title}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Zeitraum</p>
            <p className="font-semibold text-sm">{formatDate(trip.start_date)} - {formatDate(trip.end_date)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Dauer</p>
            <p className="font-semibold text-sm">{getDurationDays()} Tage</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <MapPin className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Land</p>
            <p className="font-semibold text-sm">{trip.country || "Deutschland"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Euro className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-semibold text-sm">{formatCurrency(trip.budget || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Euro className="h-5 w-5 mx-auto text-orange-500 mb-2" />
            <p className="text-xs text-muted-foreground">Ausgaben</p>
            <p className="font-semibold text-sm">{formatCurrency(trip.total_cost || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Leaf className="h-5 w-5 mx-auto text-green-500 mb-2" />
            <p className="text-xs text-muted-foreground">CO₂</p>
            <p className="font-semibold text-sm">{trip.co2_emission || 0} kg</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Flight Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Flugdetails
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flightDetails.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Keine Flugdaten vorhanden</p>
              ) : (
                <div className="space-y-6">
                  {flightDetails.map((flight: any, index: number) => (
                    <div key={flight.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{index === 0 ? "Hinflug" : "Rückflug"}</span>
                          <span className="text-sm text-muted-foreground">
                            {flight.airline} • {flight.flight_number}
                          </span>
                        </div>
                        <Badge variant="outline" className={flight.status === "on_time" ? "text-green-600" : ""}>
                          {flight.status === "on_time" ? "On Time" : flight.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Abflug</p>
                          <p className="font-semibold">{flight.departure_time}</p>
                          <p className="text-sm">{flight.departure_airport}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ankunft</p>
                          <p className="font-semibold">{flight.arrival_time}</p>
                          <p className="text-sm">{flight.arrival_airport}</p>
                        </div>
                      </div>
                      {index < flightDetails.length - 1 && <hr />}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hotel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Hotel
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!hotel ? (
                <p className="text-muted-foreground text-center py-4">Keine Hoteldaten vorhanden</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-green-600">{hotel.hotel_name}</h4>
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
                  {hotel.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{hotel.phone}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Check-in</p>
                      <p className="font-medium">{hotel.check_in ? formatDate(hotel.check_in) : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Check-out</p>
                      <p className="font-medium">{hotel.check_out ? formatDate(hotel.check_out) : "-"}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{hotel.room_type || "Standard"} • {hotel.nights || 1} Nächte</span>
                    {hotel.booking_reference && (
                      <span className="text-muted-foreground">Ref: {hotel.booking_reference}</span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Meeting Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kunde / Meeting-Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!meetingLocation ? (
                <p className="text-muted-foreground text-center py-4">Keine Meeting-Location vorhanden</p>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">{meetingLocation.location_name}</h4>
                  {meetingLocation.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <span>{meetingLocation.address}</span>
                    </div>
                  )}
                  {meetingLocation.contact_person && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Kontakt:</span> {meetingLocation.contact_person}
                    </p>
                  )}
                  {meetingLocation.stand_number && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Stand:</span> {meetingLocation.stand_number}
                    </p>
                  )}
                  <div className="flex gap-4 text-sm">
                    {meetingLocation.contact_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{meetingLocation.contact_email}</span>
                      </div>
                    )}
                    {meetingLocation.contact_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{meetingLocation.contact_phone}</span>
                      </div>
                    )}
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
                    <div key={item.id} className="border-l-2 border-green-500 pl-4">
                      <h4 className="font-medium text-green-600">{item.title}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(item.agenda_date)}</span>
                        {item.agenda_time && <span>{formatTime(item.agenda_time)}</span>}
                      </div>
                      {item.location && (
                        <p className="text-sm text-muted-foreground">{item.location}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Projects and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <p className="text-muted-foreground text-center py-4">Keine Projekte zugeordnet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {projects.map((project) => (
                  <Badge key={project.id} variant="secondary">
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
                  placeholder="Aufgabe..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                />
                <Button onClick={handleAddTask}>Speichern</Button>
              </div>
            )}
            {tasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Keine Aufgaben vorhanden</p>
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
  );
};

export default TripDetailView;
