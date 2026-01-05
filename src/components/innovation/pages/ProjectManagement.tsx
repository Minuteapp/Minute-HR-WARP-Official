import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Kanban, Plus, Users, Calendar, Clock, AlertCircle, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignees: string[];
  deadline: string;
  progress: number;
}

export const ProjectManagement: React.FC = () => {
  const [projects] = useState<Project[]>([]);

  const columns = [
    { id: 'backlog', title: 'Backlog', icon: AlertCircle, color: 'text-[hsl(var(--innovation-bright-orange))]' },
    { id: 'in-progress', title: 'In Bearbeitung', icon: Play, color: 'text-[hsl(var(--innovation-neon-turquoise))]' },
    { id: 'review', title: 'Review', icon: Clock, color: 'text-[hsl(var(--innovation-electric-purple))]' },
    { id: 'completed', title: 'Abgeschlossen', icon: CheckCircle, color: 'text-[hsl(var(--innovation-neon-green))]' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-[hsl(var(--innovation-neon-green))]';
    if (progress >= 50) return 'bg-[hsl(var(--innovation-neon-turquoise))]';
    return 'bg-[hsl(var(--innovation-bright-orange))]';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Projektmanagement</h1>
            <p className="text-white/70 text-lg">Verwalte deine Innovationsprojekte im Kanban-Board.</p>
          </div>
          <Button className="bg-gradient-to-r from-[hsl(var(--innovation-neon-turquoise))] to-[hsl(var(--innovation-dark-blue))] hover:from-[hsl(var(--innovation-neon-turquoise))]/90 hover:to-[hsl(var(--innovation-dark-blue))]/90">
            <Plus className="w-4 h-4 mr-2" />
            Neues Projekt
          </Button>
        </div>
      </motion.div>
      
      {/* Project Statistics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {columns.map((column, index) => {
          const count = projects.filter(p => p.status === column.id).length;
          return (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <column.icon className={`w-6 h-6 ${column.color}`} />
                    <div>
                      <p className="text-white font-medium">{column.title}</p>
                      <p className="text-2xl font-bold text-white">{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6"
      >
        {columns.map((column, columnIndex) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <column.icon className={`w-5 h-5 ${column.color}`} />
              <h3 className="font-semibold text-white">{column.title}</h3>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {projects.filter(p => p.status === column.id).length}
              </Badge>
            </div>
            
            <div className="space-y-3">
              {projects
                .filter(project => project.status === column.id)
                .map((project, projectIndex) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + columnIndex * 0.1 + projectIndex * 0.05 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-white text-sm line-clamp-2">
                              {project.title}
                            </h4>
                            <Badge className={getPriorityColor(project.priority)} variant="outline">
                              {project.priority}
                            </Badge>
                          </div>
                          
                          <p className="text-white/60 text-xs line-clamp-2">
                            {project.description}
                          </p>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-white/60">Fortschritt</span>
                              <span className="text-white font-medium">{project.progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${getProgressColor(project.progress)}`}
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-white/60">
                              <Calendar className="w-3 h-3" />
                              <span>{project.deadline}</span>
                            </div>
                            <div className="flex items-center gap-1 text-white/60">
                              <Users className="w-3 h-3" />
                              <span>{project.assignees.length}</span>
                            </div>
                          </div>
                          
                          <div className="flex -space-x-1">
                            {project.assignees.slice(0, 3).map((assignee, index) => (
                              <div
                                key={index}
                                className="w-6 h-6 rounded-full bg-[hsl(var(--innovation-neon-turquoise))] border-2 border-white/20 flex items-center justify-center text-xs font-medium text-white"
                                title={assignee}
                              >
                                {assignee.split(' ').map(n => n[0]).join('')}
                              </div>
                            ))}
                            {project.assignees.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white/20 flex items-center justify-center text-xs text-white">
                                +{project.assignees.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};