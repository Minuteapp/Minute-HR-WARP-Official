
import React, { ReactNode } from 'react';
import PageLayout from './PageLayout';

interface StandardPageLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

const StandardPageLayout = ({ 
  title, 
  subtitle, 
  actions, 
  children, 
  className = '' 
}: StandardPageLayoutProps) => {
  return (
    <PageLayout className={className}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
        {children}
      </div>
    </PageLayout>
  );
};

export default StandardPageLayout;
