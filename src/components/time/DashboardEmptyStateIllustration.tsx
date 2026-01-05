import { Clock, Play, Calendar, TrendingUp } from 'lucide-react';

const DashboardEmptyStateIllustration = () => {
  return (
    <div className="relative w-48 h-48 mx-auto mb-6">
      {/* Animierter Hintergrund Kreis */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 via-purple-200 to-blue-100 opacity-50 animate-pulse"></div>
      
      {/* Haupt-Uhr Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Clock className="h-32 w-32 text-purple-400 opacity-80" strokeWidth={1.5} />
          {/* Uhr-Mittelpunkt */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-purple-600"></div>
          </div>
          {/* Sekundenzeiger Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-0.5 bg-purple-600 origin-bottom animate-[spin_4s_linear_infinite]" 
                 style={{ transformOrigin: 'center calc(50% + 16px)' }}></div>
          </div>
        </div>
      </div>
      
      {/* Play Button Icon - unten rechts */}
      <div className="absolute bottom-2 right-2 bg-white rounded-full p-2.5 shadow-lg hover:scale-110 transition-transform">
        <Play className="h-10 w-10 text-purple-600 fill-purple-600" strokeWidth={1.5} />
      </div>
      
      {/* Kalender Icon - oben links */}
      <div className="absolute top-2 left-2 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform">
        <Calendar className="h-8 w-8 text-blue-500" strokeWidth={1.5} />
      </div>
      
      {/* Trend Icon - oben rechts */}
      <div className="absolute top-4 right-4 bg-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform">
        <TrendingUp className="h-6 w-6 text-green-500" strokeWidth={1.5} />
      </div>
    </div>
  );
};

export default DashboardEmptyStateIllustration;
