
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react";

const LeaderboardTable = () => {
  const leaderboardData: { rank: number; name: string; department: string; points: number; ideasSubmitted: number; implementedIdeas: number; badges: string[]; trend: string }[] = [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors = {
      "Top Innovator": "bg-purple-100 text-purple-800",
      "Problem Solver": "bg-blue-100 text-blue-800",
      "Team Player": "bg-green-100 text-green-800",
      "Creative Mind": "bg-pink-100 text-pink-800",
      "Idea Generator": "bg-orange-100 text-orange-800",
      "Implementation Expert": "bg-indigo-100 text-indigo-800",
      "Quality Focus": "bg-teal-100 text-teal-800",
      "Rising Star": "bg-yellow-100 text-yellow-800"
    };
    return colors[badge] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Innovation Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboardData.map((user) => (
              <div 
                key={user.rank}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      {user.name}
                      {user.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      )}
                    </h4>
                    <p className="text-sm text-gray-600">{user.department}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.badges.map((badge) => (
                        <Badge 
                          key={badge} 
                          variant="secondary" 
                          className={`text-xs ${getBadgeColor(badge)}`}
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {user.points.toLocaleString()} Punkte
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.ideasSubmitted} Ideen • {user.implementedIdeas} umgesetzt
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Punktesystem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Idee eingereicht</span>
              <span className="font-semibold">+50 Punkte</span>
            </div>
            <div className="flex justify-between">
              <span>Idee bewertet</span>
              <span className="font-semibold">+25 Punkte</span>
            </div>
            <div className="flex justify-between">
              <span>Idee implementiert</span>
              <span className="font-semibold">+500 Punkte</span>
            </div>
            <div className="flex justify-between">
              <span>Challenge gewonnen</span>
              <span className="font-semibold">+1000 Punkte</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aktuelle Saison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-gray-600">Q1 2024 Innovation Challenge</p>
              <p className="text-2xl font-bold text-primary">23 Tage</p>
              <p className="text-sm text-gray-600">verbleibend</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Belohnungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>1. Platz</span>
              <span className="font-semibold">€500 + Urkunde</span>
            </div>
            <div className="flex justify-between">
              <span>2. Platz</span>
              <span className="font-semibold">€300 + Urkunde</span>
            </div>
            <div className="flex justify-between">
              <span>3. Platz</span>
              <span className="font-semibold">€200 + Urkunde</span>
            </div>
            <div className="flex justify-between">
              <span>Top 10</span>
              <span className="font-semibold">Zusätzlicher Urlaubstag</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardTable;
