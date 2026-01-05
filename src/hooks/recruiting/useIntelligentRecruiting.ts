
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { emitEvent } from '@/services/eventEmitterService';

export interface CandidateMatch {
  candidateId: string;
  candidateName: string;
  matchScore: number;
  matchReasons: string[];
  projectId: string;
  projectName: string;
  skillMatches: string[];
  experienceMatch: number;
  availabilityMatch: boolean;
}

export interface InterviewerSuggestion {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  skillMatch: string[];
  relevanceScore: number;
  availability: 'available' | 'limited' | 'unavailable';
  reason: string;
}

export interface SkillGap {
  skill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  requiredLevel: 'beginner' | 'intermediate' | 'advanced';
  priority: 'low' | 'medium' | 'high';
  projectsRequiring: string[];
  timeframe: string;
}

export interface OnboardingPlan {
  id: string;
  candidateId: string;
  projectId: string;
  phases: OnboardingPhase[];
  estimatedDuration: number;
  mentorSuggestions: string[];
  trainingRequirements: string[];
}

export interface OnboardingPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  tasks: string[];
  dependencies: string[];
  success_criteria: string[];
}

export const useIntelligentRecruiting = () => {
  const { toast } = useToast();
  const [candidateMatches, setCandidateMatches] = useState<CandidateMatch[]>([]);
  const [interviewerSuggestions, setInterviewerSuggestions] = useState<InterviewerSuggestion[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [onboardingPlans, setOnboardingPlans] = useState<OnboardingPlan[]>([]);
  const [loading, setLoading] = useState(false);

  // Automatisches Matching von Kandidaten mit Projektanforderungen
  const matchCandidatesToProjects = async () => {
    setLoading(true);
    try {
      // Simulierte intelligente Matching-Logik
      const matches: CandidateMatch[] = [
        {
          candidateId: '1',
          candidateName: 'Max Mustermann',
          matchScore: 0.95,
          matchReasons: [
            'Perfekte Skill-Übereinstimmung mit React/TypeScript',
            'Erfahrung mit ähnlichen E-Commerce Projekten',
            'Verfügbar ab sofort'
          ],
          projectId: 'proj-1',
          projectName: 'E-Commerce Platform Redesign',
          skillMatches: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
          experienceMatch: 0.9,
          availabilityMatch: true
        },
        {
          candidateId: '2',
          candidateName: 'Anna Schmidt',
          matchScore: 0.87,
          matchReasons: [
            'Starke UX/UI Design Kenntnisse',
            'Erfahrung mit agilen Methoden',
            'Portfolio zeigt ähnliche Projekte'
          ],
          projectId: 'proj-2',
          projectName: 'Mobile App Development',
          skillMatches: ['Figma', 'React Native', 'Prototyping'],
          experienceMatch: 0.8,
          availabilityMatch: true
        },
        {
          candidateId: '3',
          candidateName: 'Tom Weber',
          matchScore: 0.82,
          matchReasons: [
            'Leadership-Erfahrung passt zur Team-Lead Position',
            'Agile Coaching Hintergrund',
            'Sehr gute Kommunikationsfähigkeiten'
          ],
          projectId: 'proj-3',
          projectName: 'Digital Transformation Initiative',
          skillMatches: ['Scrum', 'Kanban', 'Team Management'],
          experienceMatch: 0.85,
          availabilityMatch: false
        }
      ];

      setCandidateMatches(matches);
      
      // Event emittieren für Matching
      await emitEvent(
        'candidate.matched',
        'recruiting',
        `matching-${Date.now()}`,
        'recruiting',
        { 
          matches_count: matches.length,
          top_match_score: matches[0]?.matchScore
        }
      );
      
      toast({
        title: "Matching abgeschlossen",
        description: `${matches.length} Kandidaten erfolgreich mit Projekten abgeglichen.`,
      });
    } catch (error) {
      console.error('Fehler beim Kandidaten-Matching:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Kandidaten-Matching konnte nicht durchgeführt werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Interviewer-Vorschläge basierend auf Fachkenntnissen
  const suggestInterviewers = async (candidateId: string, position: string) => {
    setLoading(true);
    try {
      // Intelligente Interviewer-Auswahl
      const suggestions: InterviewerSuggestion[] = [
        {
          employeeId: 'emp-1',
          employeeName: 'Sarah Müller',
          department: 'Engineering',
          position: 'Senior Frontend Developer',
          skillMatch: ['React', 'TypeScript', 'Testing'],
          relevanceScore: 0.92,
          availability: 'available',
          reason: 'Fachliche Expertise in den gleichen Technologien'
        },
        {
          employeeId: 'emp-2',
          employeeName: 'Michael Richter',
          department: 'Engineering',
          position: 'Tech Lead',
          skillMatch: ['Architecture', 'Leadership', 'Code Review'],
          relevanceScore: 0.88,
          availability: 'limited',
          reason: 'Führungserfahrung und technische Tiefe'
        },
        {
          employeeId: 'emp-3',
          employeeName: 'Lisa Chen',
          department: 'Product',
          position: 'Product Manager',
          skillMatch: ['Product Strategy', 'User Experience'],
          relevanceScore: 0.75,
          availability: 'available',
          reason: 'Produkt-Perspektive und User-Fokus'
        }
      ];

      setInterviewerSuggestions(suggestions);
      
      // Event emittieren
      await emitEvent(
        'interview.suggested',
        'recruiting',
        candidateId,
        'recruiting',
        { 
          position,
          suggestions_count: suggestions.length,
          top_interviewer: suggestions[0]?.employeeName
        }
      );
      
      toast({
        title: "Interviewer-Vorschläge erstellt",
        description: `${suggestions.length} passende Interviewer gefunden.`,
      });
    } catch (error) {
      console.error('Fehler bei Interviewer-Vorschlägen:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Interviewer-Vorschläge konnten nicht erstellt werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Skills für zukünftige Projekte identifizieren
  const identifySkillGaps = async () => {
    setLoading(true);
    try {
      const gaps: SkillGap[] = [
        {
          skill: 'Machine Learning',
          currentLevel: 'beginner',
          requiredLevel: 'advanced',
          priority: 'high',
          projectsRequiring: ['AI-Chatbot', 'Recommendation Engine'],
          timeframe: 'Q2 2024'
        },
        {
          skill: 'DevOps/Kubernetes',
          currentLevel: 'intermediate',
          requiredLevel: 'advanced',
          priority: 'medium',
          projectsRequiring: ['Infrastructure Modernization'],
          timeframe: 'Q3 2024'
        },
        {
          skill: 'Data Science',
          currentLevel: 'beginner',
          requiredLevel: 'intermediate',
          priority: 'medium',
          projectsRequiring: ['Analytics Dashboard', 'Business Intelligence'],
          timeframe: 'Q4 2024'
        }
      ];

      setSkillGaps(gaps);
      
      // Event emittieren
      await emitEvent(
        'recruiting.skill_gaps_identified',
        'recruiting',
        `skill-gap-${Date.now()}`,
        'recruiting',
        { 
          gaps_count: gaps.length,
          high_priority_count: gaps.filter(g => g.priority === 'high').length
        }
      );
      
      toast({
        title: "Skill-Gap-Analyse abgeschlossen",
        description: `${gaps.length} kritische Skill-Lücken identifiziert.`,
      });
    } catch (error) {
      console.error('Fehler bei Skill-Gap-Analyse:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Skill-Gap-Analyse konnte nicht durchgeführt werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Onboarding-Pläne basierend auf Projekten erstellen
  const createOnboardingPlan = async (candidateId: string, projectId: string) => {
    setLoading(true);
    try {
      const plan: OnboardingPlan = {
        id: `onboarding-${candidateId}-${Date.now()}`,
        candidateId,
        projectId,
        estimatedDuration: 30, // Tage
        mentorSuggestions: ['Sarah Müller', 'Michael Richter'],
        trainingRequirements: [
          'React Advanced Patterns',
          'Company Architecture Guidelines',
          'Agile Workflows'
        ],
        phases: [
          {
            id: '1',
            name: 'Orientierung & Setup',
            description: 'Grundlegende Einführung in Unternehmen und Tools',
            duration: 5,
            tasks: [
              'IT-Setup und Zugänge einrichten',
              'Unternehmensrichtlinien durchgehen',
              'Team-Vorstellung',
              'Entwicklungsumgebung einrichten'
            ],
            dependencies: [],
            success_criteria: [
              'Alle Tools funktionsfähig',
              'Zugänge aktiviert',
              'Team kennengelernt'
            ]
          },
          {
            id: '2',
            name: 'Projekt-Einarbeitung',
            description: 'Spezifische Einarbeitung in das zugewiesene Projekt',
            duration: 10,
            tasks: [
              'Projektdokumentation studieren',
              'Codebase verstehen',
              'Erste kleine Aufgaben übernehmen',
              'Code-Reviews begleiten'
            ],
            dependencies: ['1'],
            success_criteria: [
              'Projektarchitektur verstanden',
              'Erste Aufgabe erfolgreich abgeschlossen',
              'Aktive Teilnahme an Reviews'
            ]
          },
          {
            id: '3',
            name: 'Eigenständige Arbeit',
            description: 'Übernahme von eigenständigen Projektaufgaben',
            duration: 15,
            tasks: [
              'Feature-Entwicklung übernehmen',
              'Eigenständige Problemlösung',
              'Mentoring von neuen Teammitgliedern',
              'Feedback-Gespräche führen'
            ],
            dependencies: ['2'],
            success_criteria: [
              'Features eigenständig entwickelt',
              'Qualitätsstandards eingehalten',
              'Positives Team-Feedback'
            ]
          }
        ]
      };

      setOnboardingPlans(prev => [...prev, plan]);
      
      // Event emittieren
      await emitEvent(
        'onboarding.plan_created',
        'recruiting',
        plan.id,
        'recruiting',
        { 
          candidateId,
          projectId,
          phases_count: plan.phases.length,
          duration_days: plan.estimatedDuration
        }
      );
      
      toast({
        title: "Onboarding-Plan erstellt",
        description: "Maßgeschneiderter Plan für den Kandidaten wurde generiert.",
      });

      return plan;
    } catch (error) {
      console.error('Fehler bei Onboarding-Plan-Erstellung:', error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Onboarding-Plan konnte nicht erstellt werden.",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    candidateMatches,
    interviewerSuggestions,
    skillGaps,
    onboardingPlans,
    loading,
    matchCandidatesToProjects,
    suggestInterviewers,
    identifySkillGaps,
    createOnboardingPlan
  };
};
