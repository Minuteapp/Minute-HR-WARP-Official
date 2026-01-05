export const sampleDashboardTemplate = [
  {
    id: 'w_dash_kpi_headcount',
    type: 'kpi',
    title: 'Mitarbeiter gesamt',
    size: 'small',
    position: { x: 0, y: 0 },
    settings: { color: 'primary', visible: true, refreshInterval: 60 }
  },
  {
    id: 'w_dash_kpi_sickrate',
    type: 'chart',
    title: 'Krankheitsquote (30T)',
    size: 'wide',
    position: { x: 1, y: 0 },
    settings: { visible: true, refreshInterval: 300 }
  },
  {
    id: 'w_dash_approvals_open',
    type: 'list',
    title: 'Offene Genehmigungen',
    size: 'medium',
    position: { x: 0, y: 1 },
    settings: { visible: true }
  }
];
