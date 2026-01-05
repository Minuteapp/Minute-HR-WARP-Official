import React, { ReactNode } from 'react';
import MarketingHeader from './MarketingHeader';
import MarketingFooter from './MarketingFooter';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

interface MarketingLayoutProps {
  children: ReactNode;
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <MarketingHeader />
        <main className="flex-1 pt-16 md:pt-20">
          {children}
        </main>
        <MarketingFooter />
      </div>
    </LanguageProvider>
  );
};

export default MarketingLayout;
