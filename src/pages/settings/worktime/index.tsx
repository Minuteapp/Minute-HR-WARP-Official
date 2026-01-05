import React from 'react';
import { Navigate } from 'react-router-dom';

// Phase A: Redirect Worktime → Timetracking
// Alle Arbeitszeit-Funktionen sind nun in TimeTrackingSettings konsolidiert
export default function WorktimeSettings() {
  return <Navigate to="/settings/timetracking" replace />;
}
