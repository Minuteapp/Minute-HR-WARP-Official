
import ProjectPortfolioDashboard from '@/components/projects/portfolio/ProjectPortfolioDashboard';
import StandardPageLayout from '@/components/layout/StandardPageLayout';
import { BarChart3 } from 'lucide-react';

export default function ProjectPortfolioPage() {
  return (
    <StandardPageLayout
      title="Portfolio-Dashboard"
      subtitle="Strategische Übersicht und Analysen aller Projekte"
    >
      <ProjectPortfolioDashboard />
    </StandardPageLayout>
  );
}
