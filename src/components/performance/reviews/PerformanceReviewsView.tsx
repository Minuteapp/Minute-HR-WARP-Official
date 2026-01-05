import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Star, Clock, CheckCircle, AlertTriangle, User, Calendar, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

interface PerformanceReview {
  id: string;
  employee_name: string;
  reviewer_name: string;
  review_type: 'self' | 'peer' | 'manager' | 'calibration';
  status: 'draft' | 'in_progress' | 'submitted' | 'completed' | 'approved';
  due_date: string;
  overall_rating?: number;
  template_name: string;
  cycle_name: string;
}

export const PerformanceReviewsView = () => {
  const { tenantCompany } = useTenant();
  const currentCompanyId = tenantCompany?.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // ECHTE DATEN: Laden aus Supabase mit company_id Filter
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['performance-reviews-view', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('performance_reviews')
        .select(`
          id,
          status,
          review_period_start,
          review_period_end,
          due_date,
          overall_score,
          employee_id,
          reviewer_id,
          template_id,
          cycle_id,
          employees!performance_reviews_employee_id_fkey(first_name, last_name),
          performance_templates(name),
          performance_cycles(name)
        `)
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching performance reviews:', error);
        return [];
      }

      // Transformiere Daten ins erwartete Format
      return (data || []).map((review: any): PerformanceReview => ({
        id: review.id,
        employee_name: review.employees 
          ? `${review.employees.first_name || ''} ${review.employees.last_name || ''}`.trim() || 'Unbekannt'
          : 'Unbekannt',
        reviewer_name: 'Manager', // Reviewer-Name würde zusätzlichen Join erfordern
        review_type: 'manager' as const,
        status: review.status || 'draft',
        due_date: review.due_date || review.review_period_end,
        overall_rating: review.overall_score,
        template_name: review.performance_templates?.name || 'Standard',
        cycle_name: review.performance_cycles?.name || 'Aktuell'
      }));
    },
    enabled: !!currentCompanyId
  });

  const getStatusColor = (status: PerformanceReview['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
    }
  };

  const getStatusIcon = (status: PerformanceReview['status']) => {
    switch (status) {
      case 'draft': return <Clock className="h-3 w-3" />;
      case 'in_progress': return <Clock className="h-3 w-3" />;
      case 'submitted': return <AlertTriangle className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'approved': return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: PerformanceReview['review_type']) => {
    switch (type) {
      case 'self': return 'bg-green-100 text-green-800';
      case 'peer': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'calibration': return 'bg-orange-100 text-orange-800';
    }
  };

  const getTypeName = (type: PerformanceReview['review_type']) => {
    switch (type) {
      case 'self': return 'Selbstbewertung';
      case 'peer': return 'Peer Review';
      case 'manager': return 'Manager Review';
      case 'calibration': return 'Kalibrierung';
    }
  };

  const getStatusName = (status: PerformanceReview['status']) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'in_progress': return 'In Bearbeitung';
      case 'submitted': return 'Eingereicht';
      case 'completed': return 'Abgeschlossen';
      case 'approved': return 'Genehmigt';
    }
  };

  const isOverdue = (dueDate: string, status: PerformanceReview['status']) => {
    return new Date(dueDate) < new Date() && !['completed', 'approved'].includes(status);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.template_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesType = typeFilter === 'all' || review.review_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance Reviews</h2>
          <p className="text-sm text-gray-500">Bewertungen verwalten und verfolgen</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Neues Review
        </Button>
      </div>

      {/* Filter und Suche */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Reviews durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="in_progress">In Bearbeitung</SelectItem>
            <SelectItem value="submitted">Eingereicht</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="approved">Genehmigt</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Typen</SelectItem>
            <SelectItem value="self">Selbstbewertung</SelectItem>
            <SelectItem value="peer">Peer Review</SelectItem>
            <SelectItem value="manager">Manager Review</SelectItem>
            <SelectItem value="calibration">Kalibrierung</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Reviews Liste */}
      {filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Performance Reviews</h3>
              <p className="text-muted-foreground mb-4">
                Es wurden noch keine Performance Reviews erstellt.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Erstes Review erstellen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.id} className={`hover:shadow-md transition-shadow ${isOverdue(review.due_date, review.status) ? 'border-red-200 bg-red-50/50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{review.employee_name}</span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${getTypeColor(review.review_type)} border-0`}
                      >
                        {getTypeName(review.review_type)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(review.status)} border-0`}
                      >
                        {getStatusIcon(review.status)}
                        <span className="ml-1">{getStatusName(review.status)}</span>
                      </Badge>
                      {isOverdue(review.due_date, review.status) && (
                        <Badge variant="destructive" className="text-xs">
                          Überfällig
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Bewerter:</span>
                        <p className="font-medium">{review.reviewer_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Vorlage:</span>
                        <p className="font-medium">{review.template_name}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Zyklus:</span>
                        <p className="font-medium">{review.cycle_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-3 w-3" />
                        Fällig: {new Date(review.due_date).toLocaleDateString('de-DE')}
                      </div>
                      {review.overall_rating && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Star className="h-3 w-3" />
                          Bewertung: {review.overall_rating}/5
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      Bearbeiten
                    </Button>
                    <Button size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reviews.filter(r => r.status === 'in_progress').length}
            </div>
            <p className="text-sm text-gray-600">In Bearbeitung</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {reviews.filter(r => r.status === 'submitted').length}
            </div>
            <p className="text-sm text-gray-600">Eingereicht</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-sm text-gray-600">Abgeschlossen</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {reviews.filter(r => isOverdue(r.due_date, r.status)).length}
            </div>
            <p className="text-sm text-gray-600">Überfällig</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
