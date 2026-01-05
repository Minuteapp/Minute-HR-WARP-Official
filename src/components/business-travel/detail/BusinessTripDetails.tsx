
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, User, DollarSign, FileText, Plane, Sparkles } from "lucide-react";
import { BusinessTrip } from "@/types/business-travel";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import BusinessTripStatusBadge from "./BusinessTripStatusBadge";
import BusinessTripTransportIcon from "./BusinessTripTransportIcon";
import { FlightDetailsPanel } from "../flight-tracker/FlightDetailsPanel";
import { AiSuggestionsPanel } from "../ai-suggestions/AiSuggestionsPanel";
import ExpenseList from "../ExpenseList";
import ReportView from "../ReportView";

interface BusinessTripDetailsProps {
  trip: BusinessTrip;
  onEdit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  flightManagement: any;
  aiSuggestions: any;
  expenses: any[];
  report: any;
  isLoadingExpenses: boolean;
  isLoadingReport: boolean;
}

export const BusinessTripDetails = ({ 
  trip, 
  onEdit, 
  onApprove, 
  onReject, 
  onComplete,
  flightManagement,
  aiSuggestions,
  expenses,
  report,
  isLoadingExpenses,
  isLoadingReport
}: BusinessTripDetailsProps) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd. MMMM yyyy", { locale: de });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Nicht angegeben';
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Basis-Informationen */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {trip.destination}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{trip.purpose}</p>
            </div>
            <div className="flex items-center gap-2">
              <BusinessTripStatusBadge trip={trip} />
              {onEdit && (
                <Button variant="outline" onClick={onEdit}>
                  Bearbeiten
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{trip.employee_name}</p>
                <p className="text-xs text-muted-foreground">{trip.department}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                </p>
                <p className="text-xs text-muted-foreground">Reisedauer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <BusinessTripTransportIcon trip={trip} />
              <div>
                <p className="text-sm font-medium capitalize">{trip.transport}</p>
                <p className="text-xs text-muted-foreground">Transport</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {formatCurrency(trip.estimated_cost)}
                </p>
                <p className="text-xs text-muted-foreground">Geschätzte Kosten</p>
              </div>
            </div>
          </div>
          
          {trip.notes && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm">{trip.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tab-Navigation für verschiedene Bereiche */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="flights" className="flex items-center gap-1">
            <Plane className="h-4 w-4" />
            Flüge
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            AI-Vorschläge
          </TabsTrigger>
          <TabsTrigger value="expenses">Ausgaben</TabsTrigger>
          <TabsTrigger value="report">Bericht</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Allgemeine Informationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Zweck der Reise</label>
                  <p className="text-sm">{trip.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Zweck-Kategorie</label>
                  <p className="text-sm capitalize">{trip.purpose_type}</p>
                </div>
                {trip.supervisor && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vorgesetzter</label>
                    <p className="text-sm">{trip.supervisor}</p>
                  </div>
                )}
                {trip.destination_address && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Zieladresse</label>
                    <p className="text-sm">{trip.destination_address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kosten & Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Geschätzte Kosten</label>
                  <p className="text-sm">{formatCurrency(trip.estimated_cost)}</p>
                </div>
                {trip.actual_cost && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tatsächliche Kosten</label>
                    <p className="text-sm">{formatCurrency(trip.actual_cost)}</p>
                  </div>
                )}
                {trip.advance_payment && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vorauszahlung</label>
                    <p className="text-sm">{formatCurrency(trip.advance_payment)}</p>
                  </div>
                )}
                {trip.cost_center && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Kostenstelle</label>
                    <p className="text-sm">{trip.cost_center}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kostenübernahme</label>
                  <Badge variant={trip.cost_coverage ? "default" : "secondary"}>
                    {trip.cost_coverage ? "Ja" : "Nein"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flights">
          <FlightDetailsPanel
            flights={flightManagement.flights}
            isLoading={flightManagement.isLoadingFlights}
            onAddFlight={() => {/* Dialog öffnen */}}
            onEditFlight={() => {/* Dialog öffnen */}}
          />
        </TabsContent>

        <TabsContent value="suggestions">
          <AiSuggestionsPanel
            suggestions={aiSuggestions.suggestions}
            isLoading={aiSuggestions.isLoadingSuggestions}
            isGenerating={aiSuggestions.isGenerating}
            onAccept={aiSuggestions.acceptSuggestion}
            onReject={aiSuggestions.rejectSuggestion}
            onGenerate={aiSuggestions.generateSuggestions}
            destination={trip.destination}
            purpose={trip.purpose}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseList 
            expenses={expenses} 
            isLoading={isLoadingExpenses}
            tripId={trip.id}
            canAddExpense={true}
          />
        </TabsContent>

        <TabsContent value="report">
          <ReportView 
            report={report} 
            isLoading={isLoadingReport}
            tripId={trip.id}
            canEdit={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
