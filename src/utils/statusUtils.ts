export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'on-track':
      return 'bg-blue-500';
    case 'at-risk':
      return 'bg-orange-500';
    case 'delayed':
      return 'bg-red-500';
    case 'not-started':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Abgeschlossen';
    case 'on-track':
      return 'Im Plan';
    case 'at-risk':
      return 'Gefährdet';
    case 'delayed':
      return 'Verzögert';
    case 'not-started':
      return 'Nicht gestartet';
    default:
      return status;
  }
};

export const getMilestoneColor = (status: string) => {
  switch (status) {
    case 'reached':
      return 'text-green-500';
    case 'upcoming':
      return 'text-orange-500';
    case 'critical':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};
