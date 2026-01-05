/**
 * Route Validation Utilities
 * Zentralisierte Validierung und Behandlung von Routen
 */

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateProjectId = (id: string | undefined): boolean => {
  if (!id) return false;
  return isValidUUID(id);
};

export const validateEmployeeId = (id: string | undefined): boolean => {
  if (!id) return false;
  return isValidUUID(id);
};

export const getValidRoutes = () => {
  return {
    projects: {
      base: '/projects',
      list: '/projects',
      create: '/projects/new',
      detail: (id: string) => `/projects/${id}`,
      portfolio: '/projects/portfolio',
      gantt: '/projects/gantt',
      kanban: '/projects/kanban',
      manage: '/projects/manage',
      teams: '/projects/teams',
      reports: '/projects/reports',
      roadmap: '/projects/roadmap'
    },
    employees: {
      base: '/employees',
      profile: (id: string) => `/employees/profile/${id}`
    },
    businessTravel: {
      base: '/business-travel',
      detail: (id: string) => `/business-travel/${id}`
    },
    expenses: {
      base: '/expenses',
      detail: (id: string) => `/expenses/${id}`
    },
    documents: {
      base: '/documents',
      detail: (id: string) => `/documents/${id}`
    }
  };
};

export const getNotFoundComponent = (module: string) => {
  const components = {
    projects: 'ProjectNotFound',
    employees: 'EmployeeNotFound',
    businessTravel: 'BusinessTripNotFound',
    expenses: 'ExpenseNotFound',
    documents: 'DocumentNotFound'
  };
  
  return components[module as keyof typeof components] || 'NotFound';
};