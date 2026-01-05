
export function calculateDaysRemaining(dateString: string): number {
  const dueDate = new Date(dateString);
  const today = new Date();
  
  // Beide Daten auf Mitternacht setzen, um nur die Tage zu vergleichen
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  // Differenz in Millisekunden und dann in Tage umrechnen
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function formatDateGerman(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric' 
    });
  } catch (e) {
    return 'Ungültiges Datum';
  }
}

/**
 * Berechnet den prozentualen Fortschritt zwischen Start- und Enddatum
 */
export function calculateDateProgress(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const today = new Date();
  
  // Alle Daten auf Mitternacht setzen
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Wenn das heutige Datum vor dem Startdatum liegt, ist der Fortschritt 0%
  if (today < startDate) return 0;
  
  // Wenn das heutige Datum nach dem Enddatum liegt, ist der Fortschritt 100%
  if (today > endDate) return 100;
  
  // Gesamtdauer des Zeitraums (in Millisekunden)
  const totalDuration = endDate.getTime() - startDate.getTime();
  
  // Verstrichene Zeit seit Beginn (in Millisekunden)
  const elapsedTime = today.getTime() - startDate.getTime();
  
  // Prozentualen Fortschritt berechnen
  const progress = Math.floor((elapsedTime / totalDuration) * 100);
  
  return progress;
}

/**
 * Formatiert eine Zeitdauer in Millisekunden als "HH:MM:SS"
 */
export function formatDuration(durationMs: number): string {
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Generiert einen Kalendererinnerungsdaten für ein Ziel
 * Gibt einen Google Calendar-Link zurück
 */
export function generateCalendarReminder(dueDateStr: string, title: string): string {
  if (!dueDateStr) return '';
  
  try {
    const dueDate = new Date(dueDateStr);
    
    // Die Startzeit ist der Fälligkeitstag um 9 Uhr morgens
    const startDate = new Date(dueDate);
    startDate.setHours(9, 0, 0, 0);
    
    // Die Endzeit ist 1 Stunde später
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);
    
    // Formatieren der Datums- und Zeitwerte für den Google Calendar-Link
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const startDateFormatted = formatDate(startDate);
    const endDateFormatted = formatDate(endDate);
    
    // Erstellen des Google Calendar-Links
    const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Fälligkeit: ${title}`)}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(`Erinnerung an die Fälligkeit des Ziels: ${title}`)}&sf=true&output=xml`;
    
    return calendarLink;
  } catch (e) {
    console.error('Fehler beim Generieren des Kalendererinnerungs-Links:', e);
    return '';
  }
}
