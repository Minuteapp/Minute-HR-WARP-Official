
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateProjectPage = () => {
  const navigate = useNavigate();

  const handleSubmit = () => {
    navigate('/projects');
  };

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Neues Projekt erstellen</h1>
          <p className="text-gray-600 mt-1">Erstellen Sie ein neues Projekt und definieren Sie alle wichtigen Details</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>
      </div>
      
      <ProjectForm
        onSubmit={handleSubmit}
        mode="create"
      />
    </div>
  );
};

export default CreateProjectPage;
