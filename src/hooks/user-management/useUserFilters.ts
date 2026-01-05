
import { useMemo } from 'react';
import { User } from '@/components/settings/users/types';

export const useUserFilters = (users: User[] | undefined, query: string) => {
  // Benutzer nach Abfrage filtern
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    if (!query.trim()) return users;
    
    const lowercaseQuery = query.toLowerCase();
    
    return users.filter(user => {
      // Nach E-Mail, Name oder Rolle suchen
      return (
        user.email?.toLowerCase().includes(lowercaseQuery) ||
        user.name?.toLowerCase().includes(lowercaseQuery) ||
        user.user_metadata?.full_name?.toLowerCase().includes(lowercaseQuery) ||
        user.role?.toLowerCase().includes(lowercaseQuery)
      );
    });
  }, [users, query]);

  return {
    filteredUsers
  };
};
