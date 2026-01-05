import { Zap } from 'lucide-react';

const EnterpriseScalingBox = () => {
  return (
    <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="font-semibold text-green-800 dark:text-green-300">
            Enterprise-Skalierung aktiviert
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400 mt-1">
            Das System ist für über 10.000 Mitarbeiter optimiert mit Server-side Pagination, 
            Client-side Caching (5min TTL), Debounced Search und Lazy Loading.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseScalingBox;
