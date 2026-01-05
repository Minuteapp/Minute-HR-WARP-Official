import React from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface Company {
  id: string;
  name: string;
  slug?: string;
  is_active: boolean;
  logo_url?: string;
  primary_color?: string;
}

interface TenantUrlCardProps {
  company: Company;
}

export const TenantUrlCard: React.FC<TenantUrlCardProps> = ({ company }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const getTenantUrl = () => {
    const slug = company.slug || company.name.toLowerCase().replace(/\s+/g, '-');
    return `https://${slug}.minute.app`;
  };

  const getLoginUrl = () => {
    return `${getTenantUrl()}/login`;
  };

  const copyToClipboard = async (url: string, type: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <Card className="p-4 border-l-4" style={{ borderLeftColor: company.primary_color || '#3B82F6' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {company.logo_url ? (
            <img 
              src={company.logo_url} 
              alt={company.name} 
              className="w-8 h-8 object-contain"
            />
          ) : (
            <div 
              className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: company.primary_color || '#3B82F6' }}
            >
              {company.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg">{company.name}</h3>
            <Badge variant={company.is_active ? 'default' : 'secondary'}>
              {company.is_active ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Hauptdomäne */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Firmen-Portal URL
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white px-2 py-1 rounded border">
              {getTenantUrl()}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(getTenantUrl(), 'portal')}
            >
              {copiedUrl === 'portal' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openInNewTab(getTenantUrl())}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Login URL */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Login-Seite
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white px-2 py-1 rounded border">
              {getLoginUrl()}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={() => copyToClipboard(getLoginUrl(), 'login')}
            >
              {copiedUrl === 'login' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openInNewTab(getLoginUrl())}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Firmenspezifischer Zugang:</strong> Mitarbeiter dieser Firma können sich nur über diese URLs anmelden und sehen ausschließlich ihre Firmendaten.
          </p>
        </div>
      </div>
    </Card>
  );
};