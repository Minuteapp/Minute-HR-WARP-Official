
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Lightbulb, Trophy } from "lucide-react";

interface Challenge {
  id: number;
  title: string;
  description: string;
  prize: string;
  deadline: string;
  participants: number;
  ideas: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  const daysRemaining = Math.ceil(
    (new Date(challenge.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const participationProgress = Math.min((challenge.participants / 50) * 100, 100);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{challenge.title}</CardTitle>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Trophy className="h-3 w-3 mr-1" />
            {challenge.prize}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm">{challenge.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{daysRemaining} Tage verbleibend</span>
            </div>
            <span className="text-xs text-gray-400">
              Deadline: {new Date(challenge.deadline).toLocaleDateString('de-DE')}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Teilnahme</span>
              <span className="text-sm text-gray-500">{challenge.participants}/50</span>
            </div>
            <Progress value={participationProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>{challenge.participants} Teilnehmer</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-green-600" />
              <span>{challenge.ideas} Ideen</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button className="flex-1" size="sm">
            Teilnehmen
          </Button>
          <Button variant="outline" size="sm">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
