import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TalentPoolCandidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  location?: string;
  skills?: string[];
  tags?: string[];
  notes?: string;
  gdpr_consent: boolean;
  gdpr_retention_until?: string;
  created_at: string;
}

interface TalentPoolCardProps {
  candidate: TalentPoolCandidate;
  onContact: (id: string) => void;
  onRemove: (id: string) => void;
}

const TalentPoolCard = ({ candidate, onContact, onRemove }: TalentPoolCardProps) => {
  const isExpired = candidate.gdpr_retention_until && new Date(candidate.gdpr_retention_until) < new Date();
  
  return (
    <Card className={isExpired ? 'border-red-200 bg-red-50/50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">
              {candidate.first_name} {candidate.last_name}
            </h3>
            <Badge className={candidate.gdpr_consent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {candidate.gdpr_consent ? 'Aktiv' : 'Keine Einwilligung'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {candidate.email}
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {candidate.phone}
            </div>
          )}
          {candidate.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {candidate.location}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Hinzugefügt: {format(new Date(candidate.created_at), 'dd.MM.yyyy', { locale: de })}
          </div>
          {candidate.gdpr_retention_until && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Aufbewahrung bis: {format(new Date(candidate.gdpr_retention_until), 'dd.MM.yyyy', { locale: de })}
            </div>
          )}
        </div>

        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Skills: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {candidate.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {candidate.tags && candidate.tags.length > 0 && (
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Tags: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {candidate.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {candidate.notes && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {candidate.notes}
          </p>
        )}

        <div className="flex gap-2">
          <Button size="sm" onClick={() => onContact(candidate.id)}>
            Kontaktieren
          </Button>
          <Button size="sm" variant="outline" onClick={() => onRemove(candidate.id)}>
            Entfernen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TalentPoolCard;
