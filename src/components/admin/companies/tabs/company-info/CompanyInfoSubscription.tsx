
import React from 'react';
import { CompanyDetails } from '../../types';

interface SubscriptionInfoProps {
  company: CompanyDetails;
}

export const CompanyInfoSubscription: React.FC<SubscriptionInfoProps> = ({ company }) => {
  return (
    <div className="border border-primary rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium">Abonnement</h3>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Abonnement-Status</p>
          <p className="capitalize">{company.subscription_status || "Free"}</p>
        </div>
      </div>
    </div>
  );
};
