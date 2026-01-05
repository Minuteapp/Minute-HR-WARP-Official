
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronUp, ChevronDown, MessageCircle, User } from 'lucide-react';
import { useInnovationData } from '@/hooks/useInnovationData';
import { IdeaDetailDialog } from './IdeaDetailDialog';
import { IdeaCard } from './IdeaCard';

export const IdeasList = () => {
  const { ideas, loading, voteOnIdea } = useInnovationData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredIdeas = ideas.filter((idea: any) => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || idea.channel_id === channelFilter;
    
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      new: 'Neu',
      in_review: 'In Prüfung',
      approved: 'Genehmigt',
      in_progress: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      rejected: 'Abgelehnt'
    };
    return texts[status] || status;
  };

  const handleVote = async (ideaId: string, voteType: 'upvote' | 'downvote') => {
    try {
      const score = voteType === 'upvote' ? 8 : 3; // Simplified voting
      await voteOnIdea(ideaId, score);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleIdeaClick = (idea: any) => {
    setSelectedIdea(idea);
    setShowDetails(true);
  };

  if (loading) {
    return <div className="p-6">Lade Ideen...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ideen durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="new">Neu</SelectItem>
                  <SelectItem value="in_review">In Prüfung</SelectItem>
                  <SelectItem value="approved">Genehmigt</SelectItem>
                  <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="rejected">Abgelehnt</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Tags</SelectItem>
                  <SelectItem value="ki">KI & Automatisierung</SelectItem>
                  <SelectItem value="process">Prozessoptimierung</SelectItem>
                  <SelectItem value="product">Produktentwicklung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredIdeas.map((idea: any) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Keine Ideen gefunden.</p>
          </CardContent>
        </Card>
      )}

      <IdeaDetailDialog
        idea={selectedIdea}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </div>
  );
};
