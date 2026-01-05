import { useCompanyTheme } from '@/hooks/useCompanyTheme';

interface CompanyBrandedHeaderProps {
  companyId?: string;
  fallbackTitle?: string;
  className?: string;
}

export const CompanyBrandedHeader = ({ 
  companyId, 
  fallbackTitle = "MINUTE",
  className = ""
}: CompanyBrandedHeaderProps) => {
  const { theme, loading } = useCompanyTheme(companyId);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-muted animate-pulse rounded" />
        <div className="w-20 h-6 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {theme.logo_url ? (
        <img 
          src={theme.logo_url} 
          alt="Company Logo" 
          className="h-8 w-auto object-contain"
          style={{ filter: `brightness(0) saturate(100%) hue-rotate(${theme.primary_color})` }}
        />
      ) : (
        <div 
          className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: theme.primary_color }}
        >
          {fallbackTitle.charAt(0)}
        </div>
      )}
      <span 
        className="font-bold text-xl"
        style={{ 
          color: theme.primary_color,
          fontFamily: theme.brand_font 
        }}
      >
        {fallbackTitle}
      </span>
    </div>
  );
};