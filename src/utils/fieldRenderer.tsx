/**
 * Utility für conditional rendering von Profil-Feldern.
 * Zeigt Felder nur an wenn Werte vorhanden sind - keine Platzhalter wie "-"
 */

export const renderFieldIfExists = (
  label: string,
  value: string | number | null | undefined
): JSX.Element | null => {
  // Prüfe ob Wert existiert und nicht leer
  const hasValue = value !== null && value !== undefined && value !== '';

  if (!hasValue) return null;

  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
};

export const renderEmptyState = (message: string = "Keine Daten vorhanden."): JSX.Element => {
  return (
    <div className="text-center py-8 text-muted-foreground text-sm">
      {message}
    </div>
  );
};
