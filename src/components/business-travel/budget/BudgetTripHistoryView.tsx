
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BusinessTrip } from "@/types/business-travel";
import { useBusinessTravel } from "@/hooks/useBusinessTravel";
import { X, Calendar, User, MapPin, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatCurrency } from "@/utils/currencyUtils";
import { Badge } from "@/components/ui/badge";

interface BudgetTripHistoryViewProps {
  budgetId: string;
  onClose: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Ausstehend</Badge>;
    case "approved":
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Genehmigt</Badge>;
    case "rejected":
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Abgelehnt</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Abgeschlossen</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const BudgetTripHistoryView: React.FC<BudgetTripHistoryViewProps> = ({ budgetId, onClose }) => {
  const { getBudgetPlanById, getBudgetPlanTrips } = useBusinessTravel();
  const [isLoading, setIsLoading] = useState(true);
  const [budget, setBudget] = useState<any>(null);
  const [trips, setTrips] = useState<BusinessTrip[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const budgetData = await getBudgetPlanById(budgetId);
        const tripsData = await getBudgetPlanTrips(budgetId);
        
        setBudget(budgetData);
        setTrips(tripsData);
      } catch (error) {
        console.error('Error loading budget data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [budgetId, getBudgetPlanById, getBudgetPlanTrips]);

  const totalExpenses = trips.reduce((sum, trip) => sum + (trip.actual_cost || trip.estimated_cost || 0), 0);

  return (
    <Dialog open={!!budgetId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isLoading ? 'Laden...' : budget?.name || 'Budgetdetails'}</span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Budget-Übersicht */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Gesamtbudget</p>
                <p className="font-medium text-lg">{formatCurrency(budget?.amount || 0, budget?.currency || 'EUR')}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Ausgegeben (Reisen)</p>
                <p className="font-medium text-lg">{formatCurrency(totalExpenses, budget?.currency || 'EUR')}</p>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground">Verbleibend</p>
                <p className="font-medium text-lg">{formatCurrency((budget?.amount || 0) - totalExpenses, budget?.currency || 'EUR')}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-4">Reisen unter diesem Budget</h3>

              {trips.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">
                  Keine Reisen mit diesem Budget gefunden.
                </p>
              ) : (
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <div key={trip.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{trip.purpose}</h4>
                        <StatusBadge status={trip.status} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {trip.employee_name}
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          {trip.destination}
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            {format(new Date(trip.start_date), "dd.MM.yy", { locale: de })}
                            <ArrowRight className="h-3 w-3 mx-1 inline" />
                            {format(new Date(trip.end_date), "dd.MM.yy", { locale: de })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Kosten: </span>
                        <span className="font-medium">
                          {formatCurrency(trip.actual_cost || trip.estimated_cost || 0, 'EUR')}
                        </span>
                        {trip.actual_cost && trip.estimated_cost && trip.actual_cost !== trip.estimated_cost && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (Budget: {formatCurrency(trip.estimated_cost, 'EUR')})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Schließen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetTripHistoryView;
