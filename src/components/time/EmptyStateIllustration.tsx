import { Clock, Calendar, TrendingUp } from 'lucide-react';

const EmptyStateIllustration = () => {
  return (
    <div className="relative w-48 h-48 mx-auto mb-6">
      {/* Hintergrund Kreis */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 opacity-50 animate-pulse"></div>
      
      {/* Haupt-Uhr Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Clock className="h-32 w-32 text-purple-400 opacity-80" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-purple-600"></div>
          </div>
        </div>
      </div>
      
      {/* Kalender Icon - unten rechts */}
      <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md">
        <Calendar className="h-12 w-12 text-blue-500" strokeWidth={1.5} />
      </div>
      
      {/* Trend Icon - oben links */}
      <div className="absolute top-2 left-2 bg-white rounded-full p-2 shadow-md">
        <TrendingUp className="h-10 w-10 text-green-500" strokeWidth={1.5} />
      </div>
    </div>
  );
};

export default EmptyStateIllustration;
