export interface SurveyTemplate {
  id: string;
  name: string;
  questionCount: number;
  description: string;
  icon: string;
  type: string;
}

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: 'mood_pulse',
    name: 'Mood Pulse',
    questionCount: 1,
    description: 'Wöchentliche 1-Frage zur aktuellen Stimmung',
    icon: '📊',
    type: 'mood_pulse',
  },
  {
    id: 'quarterly_engagement',
    name: 'Quarterly Engagement',
    questionCount: 12,
    description: 'Quartalsweise umfassende Engagement-Umfrage',
    icon: '📈',
    type: 'quarterly_engagement',
  },
  {
    id: 'leadership_check',
    name: 'Leadership Check',
    questionCount: 8,
    description: 'Feedback zur Führungskultur',
    icon: '👔',
    type: 'leadership_check',
  },
  {
    id: 'wellbeing_pulse',
    name: 'Wellbeing Pulse',
    questionCount: 10,
    description: 'Umfrage zu mentaler Gesundheit und Work-Life-Balance',
    icon: '💚',
    type: 'wellbeing',
  },
  {
    id: 'onboarding_feedback',
    name: 'Onboarding Feedback',
    questionCount: 6,
    description: 'Feedback neuer Mitarbeiter nach 30/60/90 Tagen',
    icon: '🚀',
    type: 'onboarding',
  },
  {
    id: 'exit_survey',
    name: 'Exit Survey',
    questionCount: 8,
    description: 'Feedback bei Austritt',
    icon: '👋',
    type: 'exit',
  },
];
