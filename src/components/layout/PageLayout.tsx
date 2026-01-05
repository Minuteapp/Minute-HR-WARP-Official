
import React, { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  return (
    <div className={`p-6 min-h-screen ${className}`}>
      {children}
    </div>
  );
};

export default PageLayout;
