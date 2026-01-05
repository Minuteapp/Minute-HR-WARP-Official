import { useState, useCallback, useMemo } from 'react';

export interface Location {
  id: string;
  name: string;
  address: string;
  timezone: string;
  country: string;
  region: string;
}

export interface Department {
  id: string;
  name: string;
  locationId: string;
  managerId: string;
  description: string;
  costCenter: string;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  teamLeadId: string;
  shift: 'day' | 'night' | 'rotating';
  maxSize: number;
}

export interface ShiftType {
  id: string;
  name: string;
  time: string;
  workers: number;
  color: string;
  skills: string[];
  locationId?: string;
  departmentId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  equipmentIds?: string[];
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  locationId: string;
  departmentId: string;
  requiredSkills: string[];
  maintenanceSchedule: string;
  isActive: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeNumber: string;
  department: string;
  departmentId: string;
  teamId: string;
  locationId: string;
  skills: string[];
  availability: boolean;
  role: 'worker' | 'team_lead' | 'supervisor' | 'manager' | 'admin';
  contractType: 'full_time' | 'part_time' | 'temporary' | 'contractor';
  workingHours: number;
  isBackup?: boolean;
  hireDate: Date;
  certifications: string[];
  performanceRating: number;
  costPerHour: number;
}

export interface ShiftAssignment {
  id: string;
  employeeId: string;
  day: string;
  shiftType: ShiftType;
  requiredSkills: string[];
  backupIds: string[];
  equipmentIds: string[];
  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  assignedBy: string;
  assignedAt: Date;
  notes?: string;
}

export interface FilterOptions {
  locations: string[];
  departments: string[];
  teams: string[];
  skills: string[];
  roles: string[];
  contractTypes: string[];
  availability: boolean | null;
  performanceRating: [number, number];
  search: string;
}

export function useDragDropShifts() {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    locations: [],
    departments: [],
    teams: [],
    skills: [],
    roles: [],
    contractTypes: [],
    availability: null,
    performanceRating: [1, 5],
    search: ''
  });

  // Mock data for enterprise scenario
  const locations: Location[] = [
    {
      id: 'loc-1',
      name: 'Hamburg Werk Nord',
      address: 'Industriestraße 123, 22047 Hamburg',
      timezone: 'Europe/Berlin',
      country: 'Deutschland',
      region: 'Nord'
    },
    {
      id: 'loc-2',
      name: 'München Süd',
      address: 'Bayernallee 456, 80335 München',
      timezone: 'Europe/Berlin',
      country: 'Deutschland',
      region: 'Süd'
    },
    {
      id: 'loc-3',
      name: 'Berlin Zentrale',
      address: 'Hauptstraße 789, 10115 Berlin',
      timezone: 'Europe/Berlin',
      country: 'Deutschland',
      region: 'Ost'
    }
  ];

  const departments: Department[] = [
    {
      id: 'dept-1',
      name: 'Produktion',
      locationId: 'loc-1',
      managerId: 'emp-manager-1',
      description: 'Hauptproduktionslinie',
      costCenter: 'CC-PROD-001'
    },
    {
      id: 'dept-2',
      name: 'Qualitätssicherung',
      locationId: 'loc-1',
      managerId: 'emp-manager-2',
      description: 'Qualitätskontrolle und Testing',
      costCenter: 'CC-QS-001'
    },
    {
      id: 'dept-3',
      name: 'Wartung & Instandhaltung',
      locationId: 'loc-1',
      managerId: 'emp-manager-3',
      description: 'Technische Wartung aller Anlagen',
      costCenter: 'CC-MAINT-001'
    },
    {
      id: 'dept-4',
      name: 'Logistik',
      locationId: 'loc-2',
      managerId: 'emp-manager-4',
      description: 'Warenein- und ausgang',
      costCenter: 'CC-LOG-001'
    }
  ];

  const teams: Team[] = [
    {
      id: 'team-1',
      name: 'Produktionslinie A',
      departmentId: 'dept-1',
      teamLeadId: 'emp-lead-1',
      shift: 'rotating',
      maxSize: 15
    },
    {
      id: 'team-2',
      name: 'Produktionslinie B',
      departmentId: 'dept-1',
      teamLeadId: 'emp-lead-2',
      shift: 'day',
      maxSize: 12
    },
    {
      id: 'team-3',
      name: 'QS Team Alpha',
      departmentId: 'dept-2',
      teamLeadId: 'emp-lead-3',
      shift: 'day',
      maxSize: 8
    },
    {
      id: 'team-4',
      name: 'Wartung Nachtschicht',
      departmentId: 'dept-3',
      teamLeadId: 'emp-lead-4',
      shift: 'night',
      maxSize: 6
    }
  ];

  const equipment: Equipment[] = [
    {
      id: 'eq-1',
      name: 'Turbine A',
      type: 'Produktionsanlage',
      locationId: 'loc-1',
      departmentId: 'dept-1',
      requiredSkills: ['Turbine A Zertifikat', 'Maschinenbedienung'],
      maintenanceSchedule: 'weekly',
      isActive: true
    },
    {
      id: 'eq-2',
      name: 'Qualitätsprüfstand',
      type: 'Prüfgerät',
      locationId: 'loc-1',
      departmentId: 'dept-2',
      requiredSkills: ['Qualitätskontrolle', 'Messtechnik'],
      maintenanceSchedule: 'monthly',
      isActive: true
    },
    {
      id: 'eq-3',
      name: 'Förderband System',
      type: 'Logistik',
      locationId: 'loc-2',
      departmentId: 'dept-4',
      requiredSkills: ['Fördertechnik', 'Grundqualifikation'],
      maintenanceSchedule: 'daily',
      isActive: true
    }
  ];

  const shiftTypes: ShiftType[] = [
    {
      id: 'shift-1',
      name: 'Frühschicht Produktion',
      time: '06:00 - 14:00',
      workers: 8,
      color: 'bg-green-100 border-green-300',
      skills: ['Grundqualifikation', 'Maschinenbedienung'],
      locationId: 'loc-1',
      departmentId: 'dept-1',
      priority: 'high',
      equipmentIds: ['eq-1']
    },
    {
      id: 'shift-2',
      name: 'Spätschicht Produktion',
      time: '14:00 - 22:00',
      workers: 8,
      color: 'bg-yellow-100 border-yellow-300',
      skills: ['Grundqualifikation', 'Maschinenbedienung'],
      locationId: 'loc-1',
      departmentId: 'dept-1',
      priority: 'high',
      equipmentIds: ['eq-1']
    },
    {
      id: 'shift-3',
      name: 'Nachtschicht Wartung',
      time: '22:00 - 06:00',
      workers: 4,
      color: 'bg-blue-100 border-blue-300',
      skills: ['Wartung', 'Nachtwache', 'Turbine A Zertifikat'],
      locationId: 'loc-1',
      departmentId: 'dept-3',
      priority: 'critical',
      equipmentIds: ['eq-1', 'eq-2']
    },
    {
      id: 'shift-4',
      name: 'Qualitätskontrolle',
      time: '08:00 - 16:00',
      workers: 3,
      color: 'bg-purple-100 border-purple-300',
      skills: ['Qualitätskontrolle', 'Messtechnik'],
      locationId: 'loc-1',
      departmentId: 'dept-2',
      priority: 'medium',
      equipmentIds: ['eq-2']
    }
  ];

  // Generate mock employees for demonstration (in real app, this would come from backend)
  const generateMockEmployees = (count: number): Employee[] => {
    return [];
  };

  const employees = useMemo(() => generateMockEmployees(0), []); // Keine Mock-Mitarbeiter für neue Firmen

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Location filter
      if (filterOptions.locations.length > 0 && !filterOptions.locations.includes(emp.locationId)) {
        return false;
      }
      
      // Department filter
      if (filterOptions.departments.length > 0 && !filterOptions.departments.includes(emp.departmentId)) {
        return false;
      }
      
      // Team filter
      if (filterOptions.teams.length > 0 && !filterOptions.teams.includes(emp.teamId)) {
        return false;
      }
      
      // Skills filter
      if (filterOptions.skills.length > 0 && !filterOptions.skills.some(skill => emp.skills.includes(skill))) {
        return false;
      }
      
      // Role filter
      if (filterOptions.roles.length > 0 && !filterOptions.roles.includes(emp.role)) {
        return false;
      }
      
      // Contract type filter
      if (filterOptions.contractTypes.length > 0 && !filterOptions.contractTypes.includes(emp.contractType)) {
        return false;
      }
      
      // Availability filter
      if (filterOptions.availability !== null && emp.availability !== filterOptions.availability) {
        return false;
      }
      
      // Performance rating filter
      if (emp.performanceRating < filterOptions.performanceRating[0] || 
          emp.performanceRating > filterOptions.performanceRating[1]) {
        return false;
      }
      
      // Search filter
      if (filterOptions.search && !emp.name.toLowerCase().includes(filterOptions.search.toLowerCase()) &&
          !emp.employeeNumber.toLowerCase().includes(filterOptions.search.toLowerCase()) &&
          !emp.email.toLowerCase().includes(filterOptions.search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [employees, filterOptions]);

  const assignShift = useCallback((
    employeeId: string, 
    day: string, 
    shiftType: ShiftType,
    sourceAssignmentId?: string
  ) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return false;

    // Check if employee has required skills
    const hasRequiredSkills = shiftType.skills.every(skill => employee.skills.includes(skill));
    if (!hasRequiredSkills) {
      return false;
    }

    // Remove source assignment if this is a move operation
    if (sourceAssignmentId) {
      setAssignments(prev => prev.filter(a => a.id !== sourceAssignmentId));
    }

    // Remove existing assignment for this employee/day if any
    const existingAssignmentKey = `${employeeId}-${day}`;
    setAssignments(prev => prev.filter(a => `${a.employeeId}-${a.day}` !== existingAssignmentKey));

    // Find potential backup employees from same department/location
    const backupCandidates = employees.filter(e => 
      e.id !== employeeId && 
      e.departmentId === employee.departmentId &&
      e.locationId === employee.locationId &&
      shiftType.skills.every(skill => e.skills.includes(skill)) &&
      e.availability
    );

    // Create new assignment
    const newAssignment: ShiftAssignment = {
      id: `${employeeId}-${day}-${Date.now()}`,
      employeeId,
      day,
      shiftType,
      requiredSkills: shiftType.skills,
      backupIds: backupCandidates.slice(0, 2).map(e => e.id), // 2 backup employees
      equipmentIds: shiftType.equipmentIds || [],
      status: 'planned',
      assignedBy: 'current-user', // Would be actual user ID
      assignedAt: new Date(),
      notes: `Auto-assigned with ${backupCandidates.length} backup candidates available`
    };

    setAssignments(prev => [...prev, newAssignment]);
    return true;
  }, [employees]);

  const removeAssignment = useCallback((assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  }, []);

  const getAssignmentForCell = useCallback((employeeId: string, day: string) => {
    return assignments.find(a => a.employeeId === employeeId && a.day === day);
  }, [assignments]);

  const canEmployeeHandleShift = useCallback((employeeId: string, shiftType: ShiftType) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee || !employee.availability) return false;
    
    return shiftType.skills.every(skill => employee.skills.includes(skill));
  }, [employees]);

  const getSkillsMatch = useCallback((employeeId: string, shiftType: ShiftType) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return { matched: 0, total: shiftType.skills.length, percentage: 0 };
    
    const matchedSkills = shiftType.skills.filter(skill => employee.skills.includes(skill));
    return {
      matched: matchedSkills.length,
      total: shiftType.skills.length,
      percentage: (matchedSkills.length / shiftType.skills.length) * 100
    };
  }, [employees]);

  const batchAssignShifts = useCallback((assignmentRequests: Array<{
    employeeId: string;
    day: string;
    shiftTypeId: string;
  }>) => {
    const results = assignmentRequests.map(request => {
      const shiftType = shiftTypes.find(st => st.id === request.shiftTypeId);
      if (!shiftType) return { success: false, error: 'Shift type not found' };
      
      const success = assignShift(request.employeeId, request.day, shiftType);
      return { success, error: success ? null : 'Assignment failed' };
    });
    
    return results;
  }, [assignShift, shiftTypes]);

  const getOrganizationStats = useCallback(() => {
    const stats = {
      totalEmployees: employees.length,
      availableEmployees: employees.filter(e => e.availability).length,
      byLocation: locations.map(loc => ({
        location: loc.name,
        employees: employees.filter(e => e.locationId === loc.id).length,
        available: employees.filter(e => e.locationId === loc.id && e.availability).length
      })),
      byDepartment: departments.map(dept => ({
        department: dept.name,
        employees: employees.filter(e => e.departmentId === dept.id).length,
        available: employees.filter(e => e.departmentId === dept.id && e.availability).length
      })),
      byTeam: teams.map(team => ({
        team: team.name,
        employees: employees.filter(e => e.teamId === team.id).length,
        available: employees.filter(e => e.teamId === team.id && e.availability).length,
        capacity: team.maxSize
      }))
    };
    
    return stats;
  }, [employees, locations, departments, teams]);

  return {
    // Data
    shiftTypes,
    employees: filteredEmployees,
    assignments,
    locations,
    departments,
    teams,
    equipment,
    
    // Filter functions
    filterOptions,
    setFilterOptions,
    
    // Assignment functions
    assignShift,
    removeAssignment,
    getAssignmentForCell,
    canEmployeeHandleShift,
    getSkillsMatch,
    batchAssignShifts,
    
    // Organization functions
    getOrganizationStats,
    
    // Statistics
    totalEmployees: employees.length,
    filteredCount: filteredEmployees.length
  };
}