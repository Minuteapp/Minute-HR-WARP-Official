
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Trophy, Star, ArrowUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { OnboardingProcess, EmployeeBadge } from '@/types/onboarding.types';

interface OnboardingGamificationProps {
  process?: OnboardingProcess;
  badges?: EmployeeBadge[];
  isLoading?: boolean;
}

const OnboardingGamification: React.FC<OnboardingGamificationProps> = ({
  process,
  badges = [],
  isLoading = false
}) => {
  const currentScore = process?.gamification_score || 0;
  const currentLevel = process?.current_level || 1;
  
  // Berechnung für das nächste Level und den Fortschritt
  let nextLevelThreshold = 100;
  let prevLevelThreshold = 0;
  
  if (currentLevel === 1) {
    nextLevelThreshold = 100;
    prevLevelThreshold = 0;
  } else if (currentLevel === 2) {
    nextLevelThreshold = 300;
    prevLevelThreshold = 100;
  } else {
    nextLevelThreshold = 500; // Maximales Level 3
    prevLevelThreshold = 300;
  }
  
  // Berechnung des Fortschritts zum nächsten Level in Prozent
  const levelProgress = Math.min(
    ((currentScore - prevLevelThreshold) / (nextLevelThreshold - prevLevelThreshold)) * 100,
    100
  );
  
  // Level-Definition mit Namen und Beschreibungen
  const levels = [
    { level: 1, name: "Willkommen", description: "Der Einstieg" },
    { level: 2, name: "IT fit", description: "Alle IT-Systeme gemeistert" },
    { level: 3, name: "Ziele gesetzt", description: "Voll integriertes Teammitglied" }
  ];
  
  const currentLevelInfo = levels.find(l => l.level === currentLevel) || levels[0];
  const nextLevelInfo = levels.find(l => l.level === currentLevel + 1);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Fortschritt & Auszeichnungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className={`h-1.5 ${currentLevel === 1 ? 'bg-blue-500' : currentLevel === 2 ? 'bg-purple-500' : 'bg-orange-500'}`} />
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Fortschritt & Auszeichnungen
          </div>
          <Badge className={`${currentLevel === 1 ? 'bg-blue-500' : currentLevel === 2 ? 'bg-purple-500' : 'bg-orange-500'}`}>
            Level {currentLevel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Level-Informationen */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-lg">{currentLevelInfo.name}</h3>
              <div className="text-sm text-muted-foreground">{currentScore} Punkte</div>
            </div>
            <p className="text-sm text-muted-foreground">{currentLevelInfo.description}</p>
            
            {/* Fortschrittsbalken */}
            <Progress value={levelProgress} className="h-2" />
            
            {nextLevelInfo && (
              <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                <span>Level {currentLevel}</span>
                <div className="flex items-center">
                  <span>{nextLevelThreshold - currentScore} Punkte bis </span>
                  <ArrowUp className="h-3 w-3 mx-0.5" />
                  <span>Level {currentLevel + 1}: {nextLevelInfo.name}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Badges/Abzeichen */}
          {badges.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Verdiente Abzeichen</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badges.map(badge => (
                  <Card key={badge.id} className="overflow-hidden">
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 flex items-center justify-center">
                      {badge.badge.icon === 'award' ? (
                        <Award className="h-8 w-8 text-amber-500" />
                      ) : badge.badge.icon === 'star' ? (
                        <Star className="h-8 w-8 text-amber-500" />
                      ) : (
                        <Trophy className="h-8 w-8 text-amber-500" />
                      )}
                    </div>
                    <CardContent className="p-3 text-center">
                      <h4 className="font-medium text-sm">{badge.badge.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{badge.badge.description}</p>
                      <p className="text-xs mt-2 text-muted-foreground">
                        {new Date(badge.earned_at).toLocaleDateString('de-DE')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
              <h3 className="font-semibold mb-1">Noch keine Abzeichen verdient</h3>
              <p className="text-sm text-muted-foreground">
                Schließen Sie Onboarding-Aufgaben ab und erreichen Sie Meilensteine, um Abzeichen zu verdienen.
              </p>
            </div>
          )}
          
          {/* Tipps zum Punktesammeln */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Punkte sammeln</h3>
            <ul className="text-sm space-y-2">
              <li className="flex items-start">
                <Star className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>10 Punkte für jede abgeschlossene Aufgabe in der Onboarding-Checkliste</span>
              </li>
              <li className="flex items-start">
                <Star className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>20 Punkte für jede abgeschlossene IT-Setup-Aufgabe</span>
              </li>
              <li className="flex items-start">
                <Star className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>30 Punkte für das Einreichen eines Feedbacks</span>
              </li>
              <li className="flex items-start">
                <Star className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>50 Punkte für das Erreichen eines Onboarding-Ziels</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingGamification;
