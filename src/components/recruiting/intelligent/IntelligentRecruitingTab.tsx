
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, UserCheck, TrendingUp, Users } from 'lucide-react';
import CandidateProjectMatching from './CandidateProjectMatching';
import InterviewerSuggestions from './InterviewerSuggestions';
import SkillGapAnalysis from './SkillGapAnalysis';
import OnboardingPlanGenerator from './OnboardingPlanGenerator';

const IntelligentRecruitingTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('matching');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Intelligente Recruiting-Features</h2>
        <p className="text-gray-600">
          KI-gestützte Funktionen für optimales Recruiting und Talentmanagement
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matching" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Kandidaten-Matching
          </TabsTrigger>
          <TabsTrigger value="interviewers" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Interviewer-Vorschläge
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Skill-Gap-Analyse
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Onboarding-Pläne
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matching" className="space-y-4">
          <CandidateProjectMatching />
        </TabsContent>

        <TabsContent value="interviewers" className="space-y-4">
          <InterviewerSuggestions />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <SkillGapAnalysis />
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <OnboardingPlanGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentRecruitingTab;
