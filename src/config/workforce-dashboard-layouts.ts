// Dashboard Layouts und Data Sources Configuration

export const dashboardLayouts = {
  wf_mobile_planner: {
    id: "wf_mobile_planner",
    device: "mobile",
    grid: { cols: 2, gutter: 12, rowHeight: 140 },
    widgets: [
      {
        id: "w_gap_today",
        type: "kpi_card",
        title: "Unterdeckung heute",
        icon: "alert-triangle",
        x: 0, y: 0, w: 1, h: 1,
        dataSourceId: "ds_gap_today",
        props: { format: "hours", suffix: " h" }
      },
      {
        id: "w_coverage_week",
        type: "line",
        title: "Abdeckungsgrad (Woche)",
        icon: "activity",
        x: 1, y: 0, w: 1, h: 1,
        dataSourceId: "ds_coverage_week"
      },
      {
        id: "w_expiring_certs",
        type: "list_compact",
        title: "Zertifikate laufen ab (30T)",
        icon: "shield",
        x: 0, y: 1, w: 2, h: 1,
        dataSourceId: "ds_expiring_certs",
        action: { route: "/workforce-planning?tab=skills&filter=expiring_30" }
      },
      {
        id: "w_top_gaps",
        type: "list_compact",
        title: "Top 5 Gaps (Rolle/Skill)",
        icon: "target",
        x: 0, y: 2, w: 2, h: 1,
        dataSourceId: "ds_top_gaps",
        action: { route: "/workforce-planning?tab=overview" }
      }
    ],
    visibility: { roles: ["admin", "hr", "workforce_planer"] }
  },

  wf_mobile_manager: {
    id: "wf_mobile_manager",
    device: "mobile",
    grid: { cols: 2, gutter: 12, rowHeight: 140 },
    widgets: [
      {
        id: "w_team_coverage",
        type: "kpi_card",
        title: "Teamabdeckung (Woche)",
        icon: "users",
        x: 0, y: 0, w: 1, h: 1,
        dataSourceId: "ds_team_coverage",
        props: { format: "percent" }
      },
      {
        id: "w_overtime_risk",
        type: "kpi_card",
        title: "Überstunden-Risiko",
        icon: "watch",
        x: 1, y: 0, w: 1, h: 1,
        dataSourceId: "ds_overtime_risk",
        props: { format: "score" }
      },
      {
        id: "w_open_requests",
        type: "list_compact",
        title: "Offene Requests",
        icon: "inbox",
        x: 0, y: 1, w: 2, h: 1,
        dataSourceId: "ds_open_requests",
        action: { route: "/workforce-planning?tab=requests" }
      }
    ],
    visibility: { roles: ["manager", "teamleiter"] }
  },

  wf_mobile_employee: {
    id: "wf_mobile_employee",
    device: "mobile",
    grid: { cols: 2, gutter: 12, rowHeight: 140 },
    widgets: [
      {
        id: "w_my_assignments",
        type: "list_compact",
        title: "Meine Zuweisungen (7T)",
        icon: "calendar",
        x: 0, y: 0, w: 2, h: 1,
        dataSourceId: "ds_my_assignments",
        action: { route: "/workforce-planning?tab=assignments&filter=me" }
      },
      {
        id: "w_prefs",
        type: "quick_actions",
        title: "Verfügbarkeiten & Präferenzen",
        icon: "settings",
        x: 0, y: 1, w: 2, h: 1,
        actions: [
          { label: "Bearbeiten", route: "/workforce-planning/preferences" }
        ]
      }
    ],
    visibility: { roles: ["employee"] }
  }
};

export const dataSources = [
  {
    id: "ds_gap_today",
    module: "Workforce",
    query: { metric: "gap_hours", range: "today" },
    cache_ttl: 60 // 1 Minute
  },
  {
    id: "ds_coverage_week",
    module: "Workforce",
    query: { metric: "coverage_percent", range: "this_week", scope: "org" },
    cache_ttl: 300 // 5 Minuten
  },
  {
    id: "ds_expiring_certs",
    module: "Workforce",
    query: { entity: "Cert", filter: { expires_in_days: "<=30" } },
    cache_ttl: 3600 // 1 Stunde
  },
  {
    id: "ds_top_gaps",
    module: "Workforce",
    query: { metric: "top_gaps", count: 5 },
    cache_ttl: 300 // 5 Minuten
  },
  {
    id: "ds_team_coverage",
    module: "Workforce",
    query: { metric: "coverage_percent", range: "this_week", scope: "team" },
    cache_ttl: 300 // 5 Minuten
  },
  {
    id: "ds_overtime_risk",
    module: "Workforce",
    query: { metric: "overtime_risk_score", scope: "team" },
    cache_ttl: 600 // 10 Minuten
  },
  {
    id: "ds_open_requests",
    module: "Workforce",
    query: { entity: "WF_Request", filter: { status: "open", scope: "team" } },
    cache_ttl: 120 // 2 Minuten
  },
  {
    id: "ds_my_assignments",
    module: "Workforce",
    query: { entity: "WF_Assignment", filter: { user: "me", range: "next_7d" } },
    cache_ttl: 60 // 1 Minute
  }
];

// Cache-Management für Performance
export const cacheConfig = {
  coverage_percent: { ttl: 300 }, // 5 Min
  gap_hours: { ttl: 60 },        // 1 Min
  overtime_risk: { ttl: 600 },   // 10 Min
  expiring_certs: { ttl: 3600 }, // 1 Stunde
  assignments: { ttl: 60 },      // 1 Min
  requests: { ttl: 120 }         // 2 Min
};

// RBAC Mapping für Layouts
export const roleLayoutMapping = {
  admin: 'wf_mobile_planner',
  hr: 'wf_mobile_planner',
  workforce_planer: 'wf_mobile_planner',
  manager: 'wf_mobile_manager',
  teamleiter: 'wf_mobile_manager',
  employee: 'wf_mobile_employee'
};