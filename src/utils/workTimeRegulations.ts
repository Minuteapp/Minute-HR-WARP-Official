
// Arbeitszeitgesetze in der EU (fokussiert auf Deutschland)
export const EU_REGULATIONS = {
  // Maximale tägliche Arbeitszeit
  MAX_DAILY_HOURS: 8, // Grundsätzlich max. 8h
  MAX_DAILY_HOURS_EXTENDED: 10, // Kann temporär auf 10h ausgedehnt werden
  
  // Ruhepausen
  PAUSE_REQUIREMENT_6_HOURS: 30, // Min. 30 Min Pause bei >6h Arbeit
  PAUSE_REQUIREMENT_9_HOURS: 45, // Min. 45 Min Pause bei >9h Arbeit
  
  // Ruhezeiten
  DAILY_REST_HOURS: 11, // Mindestens 11h Ruhezeit zwischen zwei Arbeitstagen
  WEEKLY_REST_HOURS: 35, // Mindestens 35h zusammenhängende Ruhezeit pro Woche
  
  // Wochenarbeitszeit
  MAX_WEEKLY_HOURS: 48, // Max. 48h im Wochendurchschnitt
  STANDARD_WEEKLY_HOURS: 40, // Übliche Vollzeitstunden in Deutschland
  
  // Arbeitszeiten für verschiedene Gruppen
  TEEN_MAX_DAILY_HOURS: 8, // Maximal 8h für Jugendliche
  PREGNANT_MAX_DAILY_HOURS: 8.5, // Maximal 8.5h für Schwangere
};

/**
 * Überprüft die tägliche Arbeitszeit
 * @param hours Anzahl der gearbeiteten Stunden
 * @returns Validierungsergebnis mit Status und Nachricht
 */
export const checkDailyWorkHours = (hours: number): { isValid: boolean, message: string } => {
  if (hours > EU_REGULATIONS.MAX_DAILY_HOURS_EXTENDED) {
    return {
      isValid: false,
      message: `Die tägliche Arbeitszeit von ${hours.toFixed(1)} Stunden überschreitet das gesetzliche Maximum von ${EU_REGULATIONS.MAX_DAILY_HOURS_EXTENDED} Stunden.`
    };
  }
  
  if (hours > EU_REGULATIONS.MAX_DAILY_HOURS) {
    return {
      isValid: true, // Immer noch gültig, aber mit Warnung
      message: `Die tägliche Arbeitszeit von ${hours.toFixed(1)} Stunden überschreitet die reguläre Arbeitszeit von ${EU_REGULATIONS.MAX_DAILY_HOURS} Stunden. Dies ist für begrenzte Zeit zulässig, muss aber ausgeglichen werden.`
    };
  }
  
  return {
    isValid: true,
    message: ""
  };
};

/**
 * Überprüft die wöchentliche Arbeitszeit
 * @param hours Anzahl der wöchentlich gearbeiteten Stunden
 * @returns Validierungsergebnis mit Status und Nachricht
 */
export const checkWeeklyWorkHours = (hours: number): { isValid: boolean, message: string } => {
  if (hours > EU_REGULATIONS.MAX_WEEKLY_HOURS) {
    return {
      isValid: false,
      message: `Die wöchentliche Arbeitszeit von ${hours.toFixed(1)} Stunden überschreitet das gesetzliche Maximum von ${EU_REGULATIONS.MAX_WEEKLY_HOURS} Stunden.`
    };
  }
  
  if (hours > EU_REGULATIONS.STANDARD_WEEKLY_HOURS) {
    return {
      isValid: true, // Immer noch gültig, aber mit Warnung
      message: `Die wöchentliche Arbeitszeit von ${hours.toFixed(1)} Stunden überschreitet die reguläre Vollzeitarbeitszeit von ${EU_REGULATIONS.STANDARD_WEEKLY_HOURS} Stunden. Dies sollte durch Überstunden oder flexible Arbeitszeit abgedeckt sein.`
    };
  }
  
  return {
    isValid: true,
    message: ""
  };
};

/**
 * Überprüft, ob ausreichend Pausen gemacht wurden
 * @param hours Anzahl der gearbeiteten Stunden
 * @param breakMinutes Dauer der Pausen in Minuten
 * @returns Validierungsergebnis mit Status und Nachricht
 */
export const checkRequiredPause = (hours: number, breakMinutes: number): { isValid: boolean, message: string } => {
  if (hours > 9 && breakMinutes < EU_REGULATIONS.PAUSE_REQUIREMENT_9_HOURS) {
    return {
      isValid: false,
      message: `Bei einer Arbeitszeit von mehr als 9 Stunden ist eine Pause von mindestens ${EU_REGULATIONS.PAUSE_REQUIREMENT_9_HOURS} Minuten gesetzlich vorgeschrieben. Sie haben nur ${breakMinutes} Minuten Pause gemacht.`
    };
  }
  
  if (hours > 6 && breakMinutes < EU_REGULATIONS.PAUSE_REQUIREMENT_6_HOURS) {
    return {
      isValid: false,
      message: `Bei einer Arbeitszeit von mehr als 6 Stunden ist eine Pause von mindestens ${EU_REGULATIONS.PAUSE_REQUIREMENT_6_HOURS} Minuten gesetzlich vorgeschrieben. Sie haben nur ${breakMinutes} Minuten Pause gemacht.`
    };
  }
  
  return {
    isValid: true,
    message: ""
  };
};

/**
 * Überprüft die Ruhezeit zwischen zwei Arbeitstagen
 * @param lastEndTime Zeitpunkt des Endes der letzten Arbeitsperiode
 * @returns Validierungsergebnis mit Status und Nachricht
 */
export const checkRestPeriod = (lastEndTime: Date): { isValid: boolean, message: string } => {
  const now = new Date();
  const hoursSinceLastWork = (now.getTime() - lastEndTime.getTime()) / (1000 * 60 * 60);
  
  if (hoursSinceLastWork < EU_REGULATIONS.DAILY_REST_HOURS) {
    return {
      isValid: false,
      message: `Die gesetzlich vorgeschriebene Ruhezeit von mindestens ${EU_REGULATIONS.DAILY_REST_HOURS} Stunden zwischen zwei Arbeitstagen wurde nicht eingehalten. Seit dem Ende Ihrer letzten Arbeitsperiode sind erst ${hoursSinceLastWork.toFixed(1)} Stunden vergangen.`
    };
  }
  
  return {
    isValid: true,
    message: "Die gesetzlich vorgeschriebene Ruhezeit wurde eingehalten."
  };
};
