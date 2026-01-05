import { Globe } from 'lucide-react';
import RegionCard, { RegionData } from './RegionCard';
import TopDepartmentCard, { DepartmentCardData } from './TopDepartmentCard';

interface RegionViewProps {
  regions?: RegionData[];
  topDepartments?: DepartmentCardData[];
}

const RegionView = ({ regions = [], topDepartments = [] }: RegionViewProps) => {
  const handleCountryClick = (country: string) => {
    console.log('Country clicked:', country);
  };

  if (regions.length === 0) {
    return (
      <div className="space-y-6">
        {/* Empty Region Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['EMEA', 'Americas', 'APAC'].map((name) => (
            <div key={name} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 text-purple-600 rounded-full p-3">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                  <p className="text-sm text-muted-foreground">0 Länder</p>
                </div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Standorte</span>
                  <span className="text-sm font-medium text-foreground">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Mitarbeiter</span>
                  <span className="text-sm font-medium text-foreground">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Ausgaben</span>
                  <span className="text-sm font-medium text-foreground">€0</span>
                </div>
              </div>
              <div className="border-t border-border my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Top-Länder:</p>
                <p className="text-sm text-muted-foreground italic">Keine Daten vorhanden</p>
              </div>
            </div>
          ))}
        </div>

        {/* Top Departments Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Top-Ausgaben nach Abteilung</h3>
            <p className="text-sm text-muted-foreground">Abteilungen mit höchsten absoluten Ausgaben</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Keine Abteilungsdaten vorhanden</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Region Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {regions.map((region) => (
          <RegionCard
            key={region.id}
            region={region}
            onCountryClick={handleCountryClick}
          />
        ))}
      </div>

      {/* Top Departments Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Top-Ausgaben nach Abteilung</h3>
          <p className="text-sm text-muted-foreground">Abteilungen mit höchsten absoluten Ausgaben</p>
        </div>
        {topDepartments.length > 0 ? (
          <div className="space-y-4">
            {topDepartments.map((dept) => (
              <TopDepartmentCard key={dept.rank} department={dept} />
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Keine Abteilungsdaten vorhanden</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionView;
