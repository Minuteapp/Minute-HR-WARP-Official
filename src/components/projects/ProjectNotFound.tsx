import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen } from "lucide-react";

const ProjectNotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/projects')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center mb-6">
          <FolderOpen className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Projekt nicht gefunden</h2>
        <p className="text-gray-600 mb-6">Das gesuchte Projekt existiert nicht oder wurde gelöscht.</p>
        <Button onClick={() => navigate('/projects')}>
          Zurück zur Projektübersicht
        </Button>
      </div>
    </div>
  );
};

export default ProjectNotFound;