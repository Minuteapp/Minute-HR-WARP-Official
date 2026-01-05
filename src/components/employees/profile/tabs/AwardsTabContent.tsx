import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAwardsData } from '@/hooks/employee-tabs/useAwardsData';
import { Trophy, Calendar, Award } from 'lucide-react';

interface AwardsTabContentProps {
  employeeId: string;
}

export const AwardsTabContent: React.FC<AwardsTabContentProps> = ({ employeeId }) => {
  const { awards, byYear, byCategory, statistics, isLoading } = useAwardsData(employeeId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Lade Auszeichnungen...</div>;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mitarbeiter des Monats':
        return '⭐';
      case 'Team Award':
        return '👥';
      case 'Innovation':
        return '💡';
      case 'Excellence':
        return '🏆';
      default:
        return '🎖️';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Mitarbeiter des Monats': 'bg-yellow-100 text-yellow-800',
      'Team Award': 'bg-blue-100 text-blue-800',
      'Innovation': 'bg-purple-100 text-purple-800',
      'Excellence': 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Statistik-Übersicht */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{statistics.total}</p>
            <p className="text-xs text-muted-foreground">Gesamt</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{statistics.thisYear}</p>
            <p className="text-xs text-muted-foreground">Dieses Jahr</p>
          </CardContent>
        </Card>
        {Object.entries(statistics.byCategory).slice(0, 2).map(([category, count]) => (
          <Card key={category}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{getCategoryIcon(category)}</div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{category}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auszeichnungen nach Jahr */}
      {Object.entries(byYear).map(([year, yearAwards]) => (
        <Card key={year}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {year}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {(yearAwards as any[]).map((award) => (
                <div key={award.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">
                      {getCategoryIcon(award.award_category || 'Sonstiges')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold">{award.award_name}</h5>
                        <Badge className={getCategoryColor(award.award_category || 'Sonstiges')}>
                          {award.award_category || 'Sonstiges'}
                        </Badge>
                      </div>
                      
                      {award.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {award.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(award.awarded_date).toLocaleDateString('de-DE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      {award.awarded_by && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Verliehen von: {award.awarded_by}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {awards.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Noch keine Auszeichnungen vorhanden</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
