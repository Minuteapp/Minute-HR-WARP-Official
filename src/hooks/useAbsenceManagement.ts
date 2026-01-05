
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { absenceManagementService } from '@/services/absenceManagementService';
import { AbsenceRequest, AbsenceFilter, AbsenceStatistic, AbsenceSettings, AbsenceType, AbsenceSubType } from '@/types/absence.types';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { useAuth } from '@/contexts/AuthContext';

export const useAbsenceManagement = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { hasPermission, isAdmin, isSuperAdmin } = useRolePermissions();
  const [filter, setFilter] = useState<AbsenceFilter>({});
  
  // Berechtigungen für verschiedene Aktionen prüfen - Superadmin hat alle Rechte
  const canApproveRequests = isSuperAdmin || isAdmin || hasPermission('absence:approve');
  const canViewAllRequests = isSuperAdmin || isAdmin || hasPermission('absence:view_all');
  const canManageSettings = isSuperAdmin || isAdmin || hasPermission('absence:manage_settings');
  
  console.log('Absence Management Permissions:', {
    isSuperAdmin,
    isAdmin,
    canApproveRequests,
    canViewAllRequests,
    canManageSettings
  });
  
  // Standard-Filter je nach Benutzerberechtigungen setzen
  useEffect(() => {
    if (!canViewAllRequests && user?.id) {
      setFilter(f => ({ ...f, employee_id: user.id }));
    }
  }, [canViewAllRequests, user?.id]);
  
  // Abwesenheitsanträge abrufen
  const { 
    data: absenceRequests, 
    isLoading: isLoadingRequests,
    isError: isErrorRequests,
    refetch: refetchRequests
  } = useQuery({
    queryKey: ['absenceRequests', filter],
    queryFn: () => absenceManagementService.getRequests(filter),
    enabled: !!user
  });
  
  // Statistiken abrufen
  const {
    data: statistics,
    isLoading: isLoadingStatistics,
    isError: isErrorStatistics,
    refetch: refetchStatistics
  } = useQuery({
    queryKey: ['absenceStatistics', canViewAllRequests ? 'all' : user?.id],
    queryFn: () => absenceManagementService.getStatistics(canViewAllRequests ? undefined : user?.id),
    enabled: !!user
  });
  
  // Einstellungen abrufen
  const {
    data: settings,
    isLoading: isLoadingSettings,
    isError: isErrorSettings
  } = useQuery({
    queryKey: ['absenceSettings'],
    queryFn: () => absenceManagementService.getSettings(),
    enabled: !!user && canManageSettings
  });
  
  // Mutation für das Erstellen von Anträgen
  const { mutate: createRequest, isPending: isCreatingRequest } = useMutation({
    mutationFn: (request: Partial<AbsenceRequest>) => absenceManagementService.createRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['absenceStatistics'] });
    }
  });
  
  // Mutation für das Genehmigen von Anträgen
  const { mutate: approveRequest, isPending: isApprovingRequest } = useMutation({
    mutationFn: (id: string) => absenceManagementService.approveRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['absenceStatistics'] });
    }
  });
  
  // Mutation für das Ablehnen von Anträgen
  const { mutate: rejectRequest, isPending: isRejectingRequest } = useMutation({
    mutationFn: ({ id, reason }: { id: string, reason?: string }) => 
      absenceManagementService.rejectRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absenceRequests'] });
      queryClient.invalidateQueries({ queryKey: ['absenceStatistics'] });
    }
  });
  
  // Filter aktualisieren
  const updateFilter = (newFilter: Partial<AbsenceFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };
  
  // Übersetzen der Typen und Status
  const getTypeLabel = (type: AbsenceType) => absenceManagementService.getAbsenceTypeLabel(type);
  const getSubTypeLabel = (subtype: AbsenceSubType) => absenceManagementService.getAbsenceSubTypeLabel(subtype);
  const getStatusLabel = (status: string) => absenceManagementService.getAbsenceStatusLabel(status as any);
  const getTypeColor = (type: AbsenceType) => absenceManagementService.getAbsenceTypeColor(type);
  
  return {
    // Daten
    absenceRequests,
    statistics,
    settings,
    filter,
    
    // Loading-States
    isLoadingRequests,
    isLoadingStatistics,
    isLoadingSettings,
    isCreatingRequest,
    isApprovingRequest,
    isRejectingRequest,
    
    // Error-States
    isErrorRequests,
    isErrorStatistics,
    isErrorSettings,
    
    // Aktionen
    createRequest,
    approveRequest,
    rejectRequest,
    updateFilter,
    refetchRequests,
    refetchStatistics,
    
    // Hilfsfunktionen
    getTypeLabel,
    getSubTypeLabel,
    getStatusLabel,
    getTypeColor,
    
    // Berechtigungen
    canApproveRequests,
    canViewAllRequests,
    canManageSettings
  };
};
