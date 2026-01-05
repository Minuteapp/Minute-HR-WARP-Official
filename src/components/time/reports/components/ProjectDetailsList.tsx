import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectData } from '@/utils/timeReportCalculations';

// Farbpalette für Projekte
const projectColors = [
  { dot: 'bg-indigo-500', bar: 'bg-indigo-500' },
  { dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  { dot: 'bg-amber-500', bar: 'bg-amber-500' },
  { dot: 'bg-rose-500', bar: 'bg-rose-500' },
  { dot: 'bg-cyan-500', bar: 'bg-cyan-500' },
  { dot: 'bg-purple-500', bar: 'bg-purple-500' },
];

interface ProjectDetailsListProps {
  data: ProjectData[];
}

const ProjectDetailsList = ({ data }: ProjectDetailsListProps) => {
  if (data.length === 0) {
    return (
      <Card className="border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Projekt-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-12">
            Keine Projektdaten verfügbar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Projekt-Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((project, index) => {
          const color = projectColors[index % projectColors.length];
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                  <span className="font-medium text-sm text-gray-900">{project.name}</span>
                </div>
                <span className="px-2 py-0.5 bg-black text-white text-xs rounded-full font-medium">
                  {project.percentage}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{project.hours} Stunden</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${color.bar} rounded-full transition-all`}
                  style={{ width: `${project.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default ProjectDetailsList;