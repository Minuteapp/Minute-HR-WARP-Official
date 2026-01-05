
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

interface TimeValidationDisplayProps {
  validation: ValidationResult;
  currentHours?: number;
  weeklyHours?: number;
  breakMinutes?: number;
}

const TimeValidationDisplay = ({ 
  validation, 
  currentHours = 0, 
  weeklyHours = 0, 
  breakMinutes = 0 
}: TimeValidationDisplayProps) => {
  const getStatusBadge = () => {
    if (validation.errors.length > 0) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Gesetzesverstoß
      </Badge>;
    }
    if (validation.warnings.length > 0) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <AlertTriangle className="h-3 w-3" />
        Warnung
      </Badge>;
    }
    return <Badge variant="default" className="flex items-center gap-1 bg-green-500">
      <CheckCircle className="h-3 w-3" />
      Konform
    </Badge>;
  };

  const getTimeColor = (hours: number, threshold: number) => {
    if (hours > threshold * 1.2) return 'text-red-600';
    if (hours > threshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Arbeitszeit-Status
        </h3>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${getTimeColor(currentHours, 8)}`}>
            {currentHours.toFixed(1)}h
          </div>
          <div className="text-sm text-gray-600">Heute</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${getTimeColor(weeklyHours, 40)}`}>
            {weeklyHours.toFixed(1)}h
          </div>
          <div className="text-sm text-gray-600">Diese Woche</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${breakMinutes >= 30 ? 'text-green-600' : 'text-red-600'}`}>
            {breakMinutes} Min
          </div>
          <div className="text-sm text-gray-600">Pause</div>
        </div>
      </div>

      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Gesetzliche Verstöße</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.warnings.length > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warnungen</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {validation.suggestions.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Empfehlungen</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TimeValidationDisplay;
