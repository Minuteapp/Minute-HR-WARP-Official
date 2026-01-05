import React from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, 
  Trophy, 
  Users, 
  TrendingUp, 
  Sparkles,
  Plus,
  Eye,
  Star,
  Target,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface InnovationDashboardProps {
  onNavigate: (page: string) => void;
}

const statsCards: { title: string; value: string; change: string; icon: any; color: string }[] = [];

const leaderboard: { rank: number; name: string; ideas: number; points: number; avatar: string }[] = [];

const recentIdeas: { id: number; title: string; author: string; status: string; score: number; category: string }[] = [];

export const InnovationDashboard: React.FC<InnovationDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Innovation Dashboard
          </h1>
          <p className="text-white/70 text-lg">
            Willkommen zurück! Hier ist deine Innovationsübersicht.
          </p>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => onNavigate('submission')}
            className="bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))] to-[hsl(var(--innovation-dark-blue))] hover:shadow-[0_0_20px_hsl(var(--innovation-neon-turquoise)/0.5)] transition-all duration-300"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Neue Idee einreichen
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="relative overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm text-green-400 font-medium">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {stat.title}
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Innovationsleader</h2>
              </div>
              
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                      user.name === 'Du' 
                        ? 'bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))]/20 to-[hsl(var(--innovation-dark-blue))]/20 border border-[hsl(var(--innovation-neon-turquoise))]/30' 
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        user.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : 'bg-white/10 text-white'
                      }`}>
                        {user.rank <= 3 ? user.rank : user.avatar}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-white/60 text-sm">{user.ideas} Ideen</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[hsl(var(--innovation-neon-turquoise))] font-bold">
                        {user.points}
                      </p>
                      <p className="text-white/60 text-sm">Punkte</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recent Ideas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-[hsl(var(--innovation-neon-turquoise))]" />
                  <h2 className="text-xl font-bold text-white">Neueste Ideen</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('visualization')}
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Alle anzeigen
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    onClick={() => onNavigate('rating')}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{idea.title}</h3>
                        <p className="text-white/60 text-sm">von {idea.author}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">{idea.score}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 rounded-full bg-[hsl(var(--innovation-neon-turquoise))]/20 text-[hsl(var(--innovation-neon-turquoise))] text-xs">
                        {idea.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        idea.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        idea.status === 'under_review' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {idea.status === 'approved' ? 'Genehmigt' :
                         idea.status === 'under_review' ? 'In Prüfung' :
                         'In Entwicklung'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-4">Schnellaktionen</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate('submission')}
                className="h-20 flex-col gap-2 text-white hover:bg-white/10 hover:text-white"
              >
                <Plus className="w-6 h-6" />
                <span className="text-sm">Idee einreichen</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('visualization')}
                className="h-20 flex-col gap-2 text-white hover:bg-white/10 hover:text-white"
              >
                <Eye className="w-6 h-6" />
                <span className="text-sm">Visualisierung</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('rating')}
                className="h-20 flex-col gap-2 text-white hover:bg-white/10 hover:text-white"
              >
                <Star className="w-6 h-6" />
                <span className="text-sm">KI-Bewertung</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate('projects')}
                className="h-20 flex-col gap-2 text-white hover:bg-white/10 hover:text-white"
              >
                <Target className="w-6 h-6" />
                <span className="text-sm">Projekte</span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};