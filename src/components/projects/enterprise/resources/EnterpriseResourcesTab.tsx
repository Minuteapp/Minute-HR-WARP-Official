import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ResourcesHeader from './ResourcesHeader';
import ResourcesStatsCards from './ResourcesStatsCards';
import ResourcesFilters from './ResourcesFilters';
import ResourcesViewTabs from './ResourcesViewTabs';
import OverloadWarningBox from './OverloadWarningBox';
import ResourcesOverview from './views/ResourcesOverview';
import ResourcesDetailsView from './views/ResourcesDetailsView';
import SkillsMatrixView from './views/SkillsMatrixView';
import TimeSchedulingView from './views/TimeSchedulingView';

type ViewType = 'overview' | 'details' | 'skills-matrix' | 'scheduling';

interface ProjectAssignment {
  id: string;
  projectId: string;
  name: string;
  role: string;
  hoursPerWeek: number;
  percentage: number;
  startDate: string;
  endDate: string;
}

interface Skill {
  name: string;
  level: 'expert' | 'senior' | 'medior' | 'junior';
  years: number;
}

interface ResourceMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  department: string;
  location: string;
  email: string;
  phone: string;
  utilizationPercent: number;
  bookedHours: number;
  maxHours: number;
  hourlyRate: number;
  skills: Skill[];
  projects: ProjectAssignment[];
  availability: {
    thisWeek: number;
    nextWeek: number;
    nextMonth: number;
  };
  performance: {
    tasks: number;
    punctuality: number;
    quality: number;
  };
}

interface SkillGroup {
  id: string;
  name: string;
  memberCount: number;
  availableCount: number;
  avgExperience: number;
  members: {
    id: string;
    initials: string;
    name: string;
    role: string;
    level: 'expert' | 'senior' | 'medior' | 'junior';
    years: number;
    utilizationPercent: number;
  }[];
}

const EnterpriseResourcesTab = () => {
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [memberFilter, setMemberFilter] = useState('all');
  const [members, setMembers] = useState<ResourceMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      
      // Fetch employees with their project assignments
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          position,
          department,
          location,
          hourly_rate,
          weekly_hours,
          skills
        `);

      if (employeesError) throw employeesError;

      // Fetch project member assignments
      const { data: projectMembers, error: pmError } = await supabase
        .from('project_members')
        .select(`
          id,
          employee_id,
          project_id,
          role,
          hours_per_week,
          allocation_percentage,
          start_date,
          end_date,
          projects (
            id,
            project_id,
            name
          )
        `);

      if (pmError) throw pmError;

      // Transform data
      const transformedMembers: ResourceMember[] = (employees || []).map(emp => {
        const empProjects = (projectMembers || [])
          .filter(pm => pm.employee_id === emp.id)
          .map(pm => {
            const project = pm.projects as unknown as { id: string; name: string; project_id: string } | null;
            return {
              id: pm.id,
              projectId: project?.project_id || '',
              name: project?.name || 'Unbekanntes Projekt',
              role: pm.role || 'Mitarbeiter',
              hoursPerWeek: pm.hours_per_week || 0,
              percentage: pm.allocation_percentage || 0,
              startDate: pm.start_date || new Date().toISOString(),
              endDate: pm.end_date || new Date().toISOString()
            };
          });

        const bookedHours = empProjects.reduce((sum, p) => sum + p.hoursPerWeek, 0);
        const maxHours = emp.weekly_hours || 40;
        const utilizationPercent = maxHours > 0 ? Math.round((bookedHours / maxHours) * 100) : 0;
        const availableThisWeek = Math.max(0, maxHours - bookedHours);

        // Parse skills from JSON
        let parsedSkills: Skill[] = [];
        if (emp.skills) {
          try {
            const skillsData = typeof emp.skills === 'string' ? JSON.parse(emp.skills) : emp.skills;
            if (Array.isArray(skillsData)) {
              parsedSkills = skillsData.map((s: any) => ({
                name: s.name || s,
                level: s.level || 'medior',
                years: s.years || 1
              }));
            }
          } catch (e) {
            // Skills parsing failed, use empty array
          }
        }

        const initials = `${(emp.first_name || '').charAt(0)}${(emp.last_name || '').charAt(0)}`.toUpperCase();

        return {
          id: emp.id,
          initials,
          name: `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Unbekannt',
          role: emp.position || 'Mitarbeiter',
          department: emp.department || 'Allgemein',
          location: emp.location || 'Nicht angegeben',
          email: emp.email || '',
          phone: emp.phone || '',
          utilizationPercent,
          bookedHours,
          maxHours,
          hourlyRate: emp.hourly_rate || 0,
          skills: parsedSkills,
          projects: empProjects,
          availability: {
            thisWeek: availableThisWeek,
            nextWeek: availableThisWeek,
            nextMonth: availableThisWeek * 4
          },
          performance: {
            tasks: 0,
            punctuality: 0,
            quality: 0
          }
        };
      });

      setMembers(transformedMembers);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      if (departmentFilter !== 'all' && member.department !== departmentFilter) return false;
      if (memberFilter !== 'all' && member.id !== memberFilter) return false;
      return true;
    });
  }, [members, departmentFilter, memberFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalMembers = filteredMembers.length;
    const averageUtilization = totalMembers > 0
      ? Math.round(filteredMembers.reduce((sum, m) => sum + m.utilizationPercent, 0) / totalMembers)
      : 0;
    const overloaded = filteredMembers.filter(m => m.utilizationPercent >= 90).length;
    const available = filteredMembers.filter(m => m.utilizationPercent < 70).length;
    const weeklyCosts = filteredMembers.reduce((sum, m) => sum + (m.bookedHours * m.hourlyRate), 0);

    return { totalMembers, averageUtilization, overloaded, available, weeklyCosts };
  }, [filteredMembers]);

  // Get unique departments
  const departments = useMemo(() => {
    return [...new Set(members.map(m => m.department))].filter(Boolean);
  }, [members]);

  // Get member list for filter
  const membersList = useMemo(() => {
    return members.map(m => ({ id: m.id, name: m.name }));
  }, [members]);

  // Get overloaded members for warning box
  const overloadedMembers = useMemo(() => {
    return filteredMembers
      .filter(m => m.utilizationPercent >= 90)
      .map(m => ({
        id: m.id,
        initials: m.initials,
        name: m.name,
        role: m.role,
        projectCount: m.projects.length,
        utilizationPercent: m.utilizationPercent,
        bookedHours: m.bookedHours,
        maxHours: m.maxHours
      }));
  }, [filteredMembers]);

  // Transform for details view
  const detailsData = useMemo(() => {
    return filteredMembers.map(m => ({
      id: m.id,
      initials: m.initials,
      name: m.name,
      location: m.location,
      role: m.role,
      department: m.department,
      utilizationPercent: m.utilizationPercent,
      projects: m.projects.map(p => ({ projectId: p.projectId })),
      availableThisWeek: m.availability.thisWeek,
      availableThisMonth: m.availability.nextMonth,
      weeklyCost: m.bookedHours * m.hourlyRate,
      hourlyRate: m.hourlyRate,
      performanceScore: m.performance.quality / 10,
      onTimePercent: m.performance.punctuality
    }));
  }, [filteredMembers]);

  // Build skill groups
  const skillGroups = useMemo(() => {
    const groupMap = new Map<string, SkillGroup>();

    filteredMembers.forEach(member => {
      member.skills.forEach(skill => {
        if (!groupMap.has(skill.name)) {
          groupMap.set(skill.name, {
            id: skill.name,
            name: skill.name,
            memberCount: 0,
            availableCount: 0,
            avgExperience: 0,
            members: []
          });
        }

        const group = groupMap.get(skill.name)!;
        group.memberCount++;
        if (member.utilizationPercent < 70) group.availableCount++;
        group.members.push({
          id: member.id,
          initials: member.initials,
          name: member.name,
          role: member.role,
          level: skill.level,
          years: skill.years,
          utilizationPercent: member.utilizationPercent
        });
      });
    });

    // Calculate average experience
    groupMap.forEach(group => {
      if (group.members.length > 0) {
        group.avgExperience = group.members.reduce((sum, m) => sum + m.years, 0) / group.members.length;
      }
    });

    return Array.from(groupMap.values());
  }, [filteredMembers]);

  // Transform for scheduling view
  const memberSchedules = useMemo(() => {
    return filteredMembers.map(m => ({
      id: m.id,
      initials: m.initials,
      name: m.name,
      role: m.role,
      utilizationPercent: m.utilizationPercent,
      projects: m.projects.map(p => ({
        id: p.id,
        projectName: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        hoursPerWeek: p.hoursPerWeek,
        role: p.role
      }))
    }));
  }, [filteredMembers]);

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <ResourcesOverview members={filteredMembers} />;
      case 'details':
        return <ResourcesDetailsView members={detailsData} />;
      case 'skills-matrix':
        return <SkillsMatrixView skillGroups={skillGroups} />;
      case 'scheduling':
        return <TimeSchedulingView memberSchedules={memberSchedules} />;
      default:
        return <ResourcesOverview members={filteredMembers} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResourcesHeader />
      <ResourcesStatsCards stats={stats} />
      <ResourcesFilters
        departmentFilter={departmentFilter}
        memberFilter={memberFilter}
        onDepartmentChange={setDepartmentFilter}
        onMemberChange={setMemberFilter}
        filteredCount={filteredMembers.length}
        totalCount={members.length}
        departments={departments}
        members={membersList}
      />
      <ResourcesViewTabs activeView={activeView} onViewChange={setActiveView} />
      <OverloadWarningBox members={overloadedMembers} />
      {renderView()}
    </div>
  );
};

export default EnterpriseResourcesTab;
