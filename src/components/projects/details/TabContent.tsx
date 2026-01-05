
import { ProjectMilestone, Project, ProjectDocument, TeamMember } from '@/types/project';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TabNavigation } from './TabNavigation';

export interface TabContentProps {
  project: Project;
  milestones?: ProjectMilestone[];
  documents?: ProjectDocument[];
  teamMembers?: TeamMember[];
}

export const TabContent = ({ project, milestones = [], documents = [], teamMembers = [] }: TabContentProps) => {
  return (
    <Tabs defaultValue="overview">
      <TabNavigation />
      
      <div className="mt-4">
        <TabsContent value="overview" className="bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <h3 className="text-lg font-medium mb-2">Beschreibung</h3>
            <p>{project.description || 'Keine Beschreibung vorhanden.'}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <h3 className="text-lg font-medium mb-2">Aufgaben</h3>
            {/* Aufgabenliste kommt hier */}
          </div>
        </TabsContent>
        
        <TabsContent value="team" className="bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <h3 className="text-lg font-medium mb-2">Team</h3>
            {/* Teamliste kommt hier */}
          </div>
        </TabsContent>
        
        <TabsContent value="files" className="bg-white p-6 rounded-lg border shadow-sm">
          <div>
            <h3 className="text-lg font-medium mb-2">Dateien</h3>
            {/* Dateiliste kommt hier */}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  );
};
