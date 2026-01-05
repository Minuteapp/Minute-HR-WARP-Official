import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Plus, 
  CheckCircle,
  Clock,
  Award
} from "lucide-react";
import { usePeerRewards, useCreatePeerReward } from '@/hooks/useRewards';

export const PeerRewards = () => {
  const [isNominationFormOpen, setIsNominationFormOpen] = useState(false);
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [reason, setReason] = useState('');
  const [points, setPoints] = useState(1);

  const { data: peerRewards, isLoading } = usePeerRewards();
  const createPeerReward = useCreatePeerReward();

  const handleSubmitNomination = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hier würde normalerweise die User-ID über E-Mail ermittelt
    // Vereinfacht nehmen wir an, dass die E-Mail eine gültige User-ID ist
    createPeerReward.mutate({
      nominator_id: '', // Wird vom Service automatisch gesetzt
      nominee_id: nomineeEmail, // Vereinfacht
      reason,
      points_awarded: points,
      status: 'pending'
    });

    // Reset form
    setNomineeEmail('');
    setReason('');
    setPoints(1);
    setIsNominationFormOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Genehmigt
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Ausstehend
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Kollegen-Belohnungen</h2>
          <p className="text-sm text-muted-foreground">
            Nominieren Sie Kollegen für ihre großartige Arbeit
          </p>
        </div>
        <Button 
          onClick={() => setIsNominationFormOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Kollegen nominieren
        </Button>
      </div>

      {/* Nomination Form */}
      {isNominationFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Kollegen nominieren
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitNomination} className="space-y-4">
              <div>
                <label className="text-sm font-medium">E-Mail des Kollegen</label>
                <Input
                  type="email"
                  value={nomineeEmail}
                  onChange={(e) => setNomineeEmail(e.target.value)}
                  placeholder="kollege@firma.de"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Grund für die Nominierung</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Beschreiben Sie, warum dieser Kollege eine Belohnung verdient..."
                  required
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Punkte (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={createPeerReward.isPending}>
                  Nominierung einreichen
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNominationFormOpen(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Peer Rewards List */}
      <div className="space-y-4">
        {peerRewards?.map((reward) => (
          <Card key={reward.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-full">
                      <Heart className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        Nominierung für Kollegen
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(reward.created_at).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pl-11">
                    <p className="text-sm mb-2">"{reward.reason}"</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {reward.points_awarded} {reward.points_awarded === 1 ? 'Punkt' : 'Punkte'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  {getStatusBadge(reward.status)}
                  {reward.approved_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Genehmigt am {new Date(reward.approved_at).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!peerRewards?.length && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Keine Peer-Belohnungen</h3>
            <p className="text-muted-foreground mb-4">
              Nominieren Sie Kollegen für ihre großartige Arbeit und fördern Sie Teamarbeit.
            </p>
            <Button onClick={() => setIsNominationFormOpen(true)}>
              Erste Nominierung erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};