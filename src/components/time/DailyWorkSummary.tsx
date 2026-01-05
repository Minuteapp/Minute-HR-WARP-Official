import { Clock, Coffee, CheckCircle, AlertCircle, ListChecks } from 'lucide-react';

interface DailyWorkSummaryProps {
  workHours: number;
  breakMinutes: number;
  hasRequiredBreak: boolean;
}

const DailyWorkSummary = ({ workHours, breakMinutes, hasRequiredBreak }: DailyWorkSummaryProps) => {
  // Pausenregelung: 30 Min nach 6h, 45 Min nach 9h
  const requiredBreak = workHours >= 9 ? 45 : workHours >= 6 ? 30 : 0;
  const breakStatus = requiredBreak === 0 ? 'none' : breakMinutes >= requiredBreak ? 'ok' : 'warning';
  
  return (
    <div className="w-full max-w-md space-y-4 mb-6">
      {/* Hintergrund Illustration */}
      <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-sm">
        {/* Dekorative Elemente */}
        <div className="absolute top-2 right-2 opacity-20">
          <Clock className="h-16 w-16 text-purple-400" />
        </div>
        
        {/* Haupt-Statistiken Grid */}
        <div className="relative grid grid-cols-3 gap-4 mb-4">
          {/* Arbeitszeit */}
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" strokeWidth={1.5} />
            <div className="text-2xl font-bold text-blue-900">
              {workHours.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600 mt-1">Stunden</div>
          </div>
          
          {/* Pausenzeit */}
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <Coffee className="h-6 w-6 text-orange-500 mx-auto mb-2" strokeWidth={1.5} />
            <div className="text-2xl font-bold text-orange-900">
              {breakMinutes}
            </div>
            <div className="text-xs text-gray-600 mt-1">Min Pause</div>
          </div>
          
          {/* Einträge */}
          <div className="bg-white rounded-xl p-3 shadow-sm text-center">
            <ListChecks className="h-6 w-6 text-purple-500 mx-auto mb-2" strokeWidth={1.5} />
            <div className="text-2xl font-bold text-purple-900">
              {workHours > 0 ? '1+' : '0'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Einträge</div>
          </div>
        </div>
        
        {/* Pausenregelung Status */}
        {requiredBreak > 0 && (
          <div className={`
            bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm
            ${breakStatus === 'ok' ? 'border-l-4 border-green-500' : 'border-l-4 border-yellow-500'}
          `}>
            {breakStatus === 'ok' ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-green-700">Pausenregelung erfüllt</div>
                  <div className="text-xs text-gray-600">
                    {breakMinutes} von {requiredBreak} Min erforderlich
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-yellow-700">Pause erforderlich</div>
                  <div className="text-xs text-gray-600">
                    {requiredBreak} Min bei {workHours.toFixed(1)}h Arbeitszeit
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Informationstext */}
      <p className="text-sm text-gray-500 text-center">
        Starten Sie eine neue Zeiterfassung oder sehen Sie unten die Details
      </p>
    </div>
  );
};

export default DailyWorkSummary;
