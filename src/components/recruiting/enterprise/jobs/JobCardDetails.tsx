import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface JobCardDetailsProps {
  department?: string;
  contractType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  employmentType?: string;
  createdAt: string;
}

const JobCardDetails = ({
  department,
  contractType,
  salaryMin,
  salaryMax,
  currency = 'EUR',
  location,
  employmentType,
  createdAt,
}: JobCardDetailsProps) => {
  const formatSalary = () => {
    if (!salaryMin && !salaryMax) return 'Nicht angegeben';
    if (salaryMin && salaryMax) {
      return `${salaryMin.toLocaleString('de-DE')} - ${salaryMax.toLocaleString('de-DE')} ${currency}`;
    }
    if (salaryMin) return `Ab ${salaryMin.toLocaleString('de-DE')} ${currency}`;
    if (salaryMax) return `Bis ${salaryMax.toLocaleString('de-DE')} ${currency}`;
    return 'Nicht angegeben';
  };

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm mt-3">
      <div className="flex gap-2">
        <span className="text-muted-foreground">Abteilung:</span>
        <span className="text-foreground">{department || '-'}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-muted-foreground">Standort:</span>
        <span className="text-foreground">{location || '-'}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-muted-foreground">Vertragsart:</span>
        <span className="text-foreground">{contractType || '-'}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-muted-foreground">Typ:</span>
        <span className="text-foreground">{employmentType || '-'}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-muted-foreground">Gehalt:</span>
        <span className="text-foreground">{formatSalary()}</span>
      </div>
      <div className="flex gap-2">
        <span className="text-muted-foreground">Erstellt:</span>
        <span className="text-foreground">
          {format(new Date(createdAt), 'dd.MM.yyyy', { locale: de })}
        </span>
      </div>
    </div>
  );
};

export default JobCardDetails;
