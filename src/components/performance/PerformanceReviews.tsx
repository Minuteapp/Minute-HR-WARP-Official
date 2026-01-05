import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Filter, Search, Star } from "lucide-react";
import { useState } from "react";

interface Review {
  id: string;
  employeeName: string;
  reviewType: string;
  date: string;
  rating: number;
  status: "Ausstehend" | "In Bearbeitung" | "Abgeschlossen";
}

const PerformanceReviews = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const reviews: Review[] = [
    {
      id: "1",
      employeeName: "Max Mustermann",
      reviewType: "Quartalsbeurteilung",
      date: "2024-03-15",
      rating: 4.5,
      status: "Ausstehend"
    },
    {
      id: "2",
      employeeName: "Anna Schmidt",
      reviewType: "Jahresbeurteilung",
      date: "2024-03-20",
      rating: 4.2,
      status: "In Bearbeitung"
    }
  ];

  const getStatusColor = (status: Review["status"]) => {
    switch (status) {
      case "Ausstehend":
        return "bg-yellow-100 text-yellow-800";
      case "In Bearbeitung":
        return "bg-blue-100 text-blue-800";
      case "Abgeschlossen":
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-lg border-primary/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold">Mitarbeiterbewertungen</h3>
            <p className="text-sm text-gray-500">Übersicht aller Bewertungen und Beurteilungen</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neue Bewertung
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Suche nach Mitarbeiter oder Bewertungstyp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-medium">{review.employeeName}</h4>
                    <p className="text-sm text-gray-600">{review.reviewType}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{review.rating}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                      {review.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(review.date).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              Keine Bewertungen gefunden
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PerformanceReviews;