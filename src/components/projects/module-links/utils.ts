
export const getModuleTypeLabel = (type: string) => {
  switch (type) {
    case 'document':
      return 'Dokumente';
    case 'task':
      return 'Aufgaben';
    case 'calendar':
      return 'Termine';
    default:
      return type;
  }
};

export const getLinkTypeLabel = (type: string = 'related') => {
  switch (type) {
    case 'parent':
      return 'Übergeordnet';
    case 'child':
      return 'Untergeordnet';
    case 'reference':
      return 'Referenz';
    default:
      return 'Verwandt';
  }
};

export const getLinkTypeColor = (type: string) => {
  switch (type) {
    case 'parent':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'child':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'reference':
      return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};
