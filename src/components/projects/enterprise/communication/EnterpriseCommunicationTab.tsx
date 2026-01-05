import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import CommunicationHeader from './CommunicationHeader';
import CommunicationStatsCards from './CommunicationStatsCards';
import CommunicationViewTabs from './CommunicationViewTabs';
import UpdatesView from './views/UpdatesView';
import DocumentsView from './views/DocumentsView';

interface CommunicationStats {
  updates: number;
  documents: number;
  thisWeek: number;
  activeProjects: number;
}

interface UpdateItem {
  id: string;
  title: string;
  type: 'status' | 'decision' | 'risk';
  author: string;
  authorInitials: string;
  date: Date;
  description: string;
  projectName: string;
}

interface DocumentItem {
  id: string;
  filename: string;
  author: string;
  date: Date;
  size: string;
  category: string;
  projectName: string;
  downloadUrl: string;
}

const EnterpriseCommunicationTab = () => {
  const [activeView, setActiveView] = useState<'updates' | 'documents'>('updates');
  const [stats, setStats] = useState<CommunicationStats>({
    updates: 0,
    documents: 0,
    thisWeek: 0,
    activeProjects: 0,
  });
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommunicationData = async () => {
      try {
        // Fetch project updates/comments
        const { data: updateData } = await supabase
          .from('project_comments')
          .select(`
            id,
            content,
            created_at,
            user_id,
            project_id,
            projects:project_id (name),
            profiles:user_id (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        // Fetch project documents
        const { data: docData } = await supabase
          .from('project_documents')
          .select(`
            id,
            name,
            file_path,
            file_size,
            created_at,
            uploaded_by,
            project_id,
            projects:project_id (name),
            profiles:uploaded_by (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        // Fetch active projects count
        const { count: projectCount } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active');

        // Map updates
        if (updateData) {
          const mappedUpdates: UpdateItem[] = updateData.map(u => {
            const projectData = u.projects as unknown as { name: string } | null;
            const profileData = u.profiles as unknown as { full_name: string } | null;
            const authorName = profileData?.full_name || 'Unbekannt';
            
            return {
              id: u.id,
              title: 'Projekt-Update',
              type: 'status' as const,
              author: authorName,
              authorInitials: authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
              date: new Date(u.created_at),
              description: u.content || '',
              projectName: projectData?.name || 'Kein Projekt',
            };
          });
          setUpdates(mappedUpdates);
        }

        // Map documents
        if (docData) {
          const mappedDocs: DocumentItem[] = docData.map(d => {
            const projectData = d.projects as unknown as { name: string } | null;
            const profileData = d.profiles as unknown as { full_name: string } | null;
            
            return {
              id: d.id,
              filename: d.name || 'Unbenannt',
              author: profileData?.full_name || 'Unbekannt',
              date: new Date(d.created_at),
              size: d.file_size ? `${Math.round(d.file_size / 1024)} KB` : 'Unbekannt',
              category: 'Dokument',
              projectName: projectData?.name || 'Kein Projekt',
              downloadUrl: d.file_path || '#',
            };
          });
          setDocuments(mappedDocs);
        }

        // Calculate this week count
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekUpdates = (updateData || []).filter(u => new Date(u.created_at) > oneWeekAgo).length;
        const thisWeekDocs = (docData || []).filter(d => new Date(d.created_at) > oneWeekAgo).length;

        setStats({
          updates: updateData?.length || 0,
          documents: docData?.length || 0,
          thisWeek: thisWeekUpdates + thisWeekDocs,
          activeProjects: projectCount || 0,
        });
      } catch (error) {
        console.error('Error fetching communication data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunicationData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CommunicationHeader />
        <div className="text-center py-12 text-muted-foreground">Lädt Kommunikations-Daten...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CommunicationHeader />
      <CommunicationStatsCards stats={stats} />
      <CommunicationViewTabs activeView={activeView} onViewChange={setActiveView} />
      
      {activeView === 'updates' ? (
        <UpdatesView updates={updates} />
      ) : (
        <DocumentsView documents={documents} />
      )}
    </div>
  );
};

export default EnterpriseCommunicationTab;
