import React from 'react';
import { Leaf, Building2, Users, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ESGHeader = () => {
  // Lade Company-Daten
  const { data: companyData } = useQuery({
    queryKey: ['esg-company-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Hole Profile mit Company-ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) return null;

      // Hole Company-Daten
      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('id', profile.company_id)
        .single();

      // Zähle Mitarbeiter
      const { count: employeeCount } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      // Zähle Standorte
      const { count: locationCount } = await supabase
        .from('company_locations')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', profile.company_id);

      return {
        companyName: company?.name || 'Unbekannt',
        employeeCount: employeeCount || 0,
        locationCount: locationCount || 0,
        companyId: profile.company_id
      };
    }
  });

  // Lade aktuellen Benutzer
  const { data: currentUser } = useQuery({
    queryKey: ['esg-current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();

      return {
        name: profile?.full_name || user.email?.split('@')[0] || 'Benutzer',
        initials: (profile?.full_name || user.email || 'U').substring(0, 2).toUpperCase()
      };
    }
  });

  return (
    <div className="flex items-center justify-between py-4 px-6 border-b border-border bg-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">ESG-Management</h1>
            <p className="text-xs text-muted-foreground">Umwelt · Soziales · Unternehmensführung</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 ml-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Building2 className="h-4 w-4" />
            <span>{companyData?.companyName || 'Lädt...'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{companyData?.employeeCount || 0} MA</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{companyData?.locationCount || 0} Standorte</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground">{currentUser?.name || 'Lädt...'}</p>
          <p className="text-xs text-muted-foreground">ESG Manager</p>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-green-100 text-green-700">
            {currentUser?.initials || '...'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
