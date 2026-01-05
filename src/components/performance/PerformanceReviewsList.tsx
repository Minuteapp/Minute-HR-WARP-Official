
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  Star,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { usePerformanceReviews } from '@/hooks/usePerformance';
import type { PerformanceReviewStatus } from '@/types/performance';

export const PerformanceReviewsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { data: reviews = [], isLoading } = usePerformanceReviews({
    status: statusFilter !== 'all' ? statusFilter : undefined
  });

  const filteredReviews = reviews.filter(review =>
    review.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: PerformanceReviewStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending_signature':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: PerformanceReviewStatus) => {
    const variants = {
      'completed': 'default',
      'in_progress': 'secondary', 
      'pending_signature': 'outline',
      'draft': 'outline',
      'archived': 'outline'
    } as const;

    const labels = {
      'completed': 'Abgeschlossen',
      'in_progress': 'In Bearbeitung',
      'pending_signature': 'Warten auf Unterschrift',
      'draft': 'Entwurf',
      'archived': 'Archiviert'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const isOverdue = (review: any) => {
    return review.due_date && 
           review.status !== 'completed' && 
           new Date(review.due_date) < new Date();
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Lade Reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
          <CardDescription>Verwalten Sie alle Performance-Reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Nach Review-ID oder Mitarbeiter suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                <SelectItem value="pending_signature">Warten auf Unterschrift</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="archived">Archiviert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredReviews.map(review => (
              <div 
                key={review.id} 
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                  isOverdue(review) ? 'border-red-200 bg-red-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(review.status)}
                      <h3 className="font-medium">Review #{review.id.slice(0, 8)}</h3>
                      {isOverdue(review) && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Überfällig
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>Mitarbeiter: {review.employee_id.slice(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(review.review_period_start).toLocaleDateString()} - 
                          {new Date(review.review_period_end).toLocaleDateString()}
                        </span>
                      </div>
                      {review.overall_score && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{review.overall_score.toFixed(1)}</span>
                        </div>
                      )}
                      {review.due_date && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Fällig: {new Date(review.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(review.status)}
                    <Button variant="outline" size="sm">
                      Bearbeiten
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Reviews gefunden</h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Versuchen Sie andere Suchkriterien.' 
                    : 'Es sind noch keine Performance-Reviews vorhanden.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
