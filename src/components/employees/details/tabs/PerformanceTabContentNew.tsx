import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnterprisePermissions } from '@/hooks/useEnterprisePermissions';
import { BarChart3, Plus, TrendingUp, TrendingDown, Minus, Star, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PerformanceTabContentNewProps {
  employeeId: string;
}

export const PerformanceTabContentNew: React.FC<PerformanceTabContentNewProps> = ({ employeeId }) => {
  const { canCreate } = useEnterprisePermissions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    period: '',
    rating: '',
    reviewer: '',
    strengths: '',
    improvements: '',
    goals: ''
  });

  const handleCreate = () => {
    setReviews([...reviews, { id: Date.now(), ...formData, createdAt: new Date().toISOString() }]);
    setDialogOpen(false);
    setFormData({ period: '', rating: '', reviewer: '', strengths: '', improvements: '', goals: '' });
  };

  const ratings = [
    { value: '5', label: 'Hervorragend (5)' },
    { value: '4', label: 'Übertrifft Erwartungen (4)' },
    { value: '3', label: 'Erfüllt Erwartungen (3)' },
    { value: '2', label: 'Verbesserungsbedarf (2)' },
    { value: '1', label: 'Unzureichend (1)' }
  ];

  const getRatingIcon = (rating: string) => {
    const num = parseInt(rating);
    if (num >= 4) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (num >= 3) return <Minus className="h-5 w-5 text-yellow-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const getRatingColor = (rating: string) => {
    const num = parseInt(rating);
    if (num >= 4) return 'bg-green-100 text-green-800';
    if (num >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + parseInt(r.rating || '0'), 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance
        </h2>
        {canCreate('employee_performance') && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Bewertung hinzufügen
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{reviews.length}</p>
              <p className="text-xs text-muted-foreground">Bewertungen</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
              </div>
              <p className="text-xs text-muted-foreground">Ø Bewertung</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {reviews.filter(r => parseInt(r.rating) >= 4).length}
              </p>
              <p className="text-xs text-muted-foreground">Überdurchschnittlich</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {reviews.length > 0 ? reviews[reviews.length - 1]?.rating : '-'}
              </p>
              <p className="text-xs text-muted-foreground">Letzte Bewertung</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance-Bewertungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getRatingIcon(review.rating)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.period}</span>
                          <Badge className={getRatingColor(review.rating)}>
                            {ratings.find(r => r.value === review.rating)?.label || `Bewertung ${review.rating}`}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Bewerter: {review.reviewer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(review.createdAt).toLocaleDateString('de-DE')}
                    </div>
                  </div>
                  
                  {review.strengths && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-green-700">Stärken:</span>
                      <p className="text-sm text-muted-foreground">{review.strengths}</p>
                    </div>
                  )}
                  
                  {review.improvements && (
                    <div className="mb-2">
                      <span className="text-xs font-medium text-yellow-700">Verbesserungspotenzial:</span>
                      <p className="text-sm text-muted-foreground">{review.improvements}</p>
                    </div>
                  )}
                  
                  {review.goals && (
                    <div>
                      <span className="text-xs font-medium text-blue-700">Ziele:</span>
                      <p className="text-sm text-muted-foreground">{review.goals}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Performance-Bewertungen vorhanden</p>
              {canCreate('employee_performance') && (
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Erste Bewertung hinzufügen
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Performance-Bewertung hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bewertungszeitraum</Label>
                <Input 
                  value={formData.period}
                  onChange={(e) => setFormData({...formData, period: e.target.value})}
                  placeholder="z.B. Q4 2024"
                />
              </div>
              <div>
                <Label>Bewerter</Label>
                <Input 
                  value={formData.reviewer}
                  onChange={(e) => setFormData({...formData, reviewer: e.target.value})}
                  placeholder="Name des Bewerters"
                />
              </div>
            </div>
            <div>
              <Label>Gesamtbewertung</Label>
              <Select value={formData.rating} onValueChange={(v) => setFormData({...formData, rating: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Bewertung wählen" />
                </SelectTrigger>
                <SelectContent>
                  {ratings.map(rating => (
                    <SelectItem key={rating.value} value={rating.value}>{rating.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Stärken</Label>
              <Textarea 
                value={formData.strengths}
                onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                placeholder="Was macht der Mitarbeiter besonders gut?"
              />
            </div>
            <div>
              <Label>Verbesserungspotenzial</Label>
              <Textarea 
                value={formData.improvements}
                onChange={(e) => setFormData({...formData, improvements: e.target.value})}
                placeholder="Wo gibt es Entwicklungsmöglichkeiten?"
              />
            </div>
            <div>
              <Label>Ziele für die nächste Periode</Label>
              <Textarea 
                value={formData.goals}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                placeholder="Vereinbarte Ziele..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleCreate}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
