import { useState } from 'react';
import CorporateCardsStatsCards, { CardStats } from '../corporate-cards/CorporateCardsStatsCards';
import CorporateCardsActionButtons from '../corporate-cards/CorporateCardsActionButtons';
import CorporateCardsList from '../corporate-cards/CorporateCardsList';
import { CorporateCardData } from '../corporate-cards/CorporateCard';
import CardIntegrationBox from '../corporate-cards/CardIntegrationBox';
import LimitConfigurationSection, { LimitConfiguration } from '../corporate-cards/LimitConfigurationSection';

const CorporateCardsTab = () => {
  const [cards, setCards] = useState<CorporateCardData[]>([]);
  const [limitConfig, setLimitConfig] = useState<LimitConfiguration>({
    monthlyLimit: 5000,
    categoryLimit: 'all',
    countryLimit: 'all',
  });

  // Calculate stats from cards
  const stats: CardStats = {
    totalCards: cards.length,
    activeCards: cards.filter(c => c.status === 'active').length,
    monthlyLimit: cards.reduce((sum, c) => sum + c.monthlyLimit, 0),
    totalSpent: cards.reduce((sum, c) => sum + c.currentSpend, 0),
    usagePercent: cards.length > 0 
      ? Math.round((cards.reduce((sum, c) => sum + c.currentSpend, 0) / 
          cards.reduce((sum, c) => sum + c.monthlyLimit, 0)) * 100) 
      : 0,
  };

  const handleNewCard = () => {
    console.log('New card clicked');
  };

  const handleVirtualCard = () => {
    console.log('Virtual card clicked');
  };

  const handleBlockCard = (cardId: string) => {
    setCards(cards.map(c => 
      c.id === cardId ? { ...c, status: 'blocked' as const } : c
    ));
  };

  const handleUnblockCard = (cardId: string) => {
    setCards(cards.map(c => 
      c.id === cardId ? { ...c, status: 'active' as const } : c
    ));
  };

  const handleViewDetails = (cardId: string) => {
    console.log('View details:', cardId);
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <CorporateCardsStatsCards stats={stats} />
        </div>
      </div>

      {/* Action Buttons */}
      <CorporateCardsActionButtons 
        onNewCard={handleNewCard}
        onVirtualCard={handleVirtualCard}
      />

      {/* Cards List */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Firmenkarten</h3>
        <CorporateCardsList 
          cards={cards}
          onBlock={handleBlockCard}
          onUnblock={handleUnblockCard}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Bottom Section: Integration + Limit Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardIntegrationBox />
        <LimitConfigurationSection 
          config={limitConfig}
          onChange={setLimitConfig}
        />
      </div>
    </div>
  );
};

export default CorporateCardsTab;
