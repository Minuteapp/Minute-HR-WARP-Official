const GanttLegend = () => {
  const items = [
    { color: 'bg-blue-500', label: 'Aktiv' },
    { color: 'bg-orange-400', label: 'Risiko' },
    { color: 'bg-red-400', label: 'Verzögert' },
    { color: 'bg-gray-400', label: 'Planung' },
  ];

  return (
    <div className="flex items-center gap-6 text-sm">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div className={`w-4 h-3 rounded ${item.color}`} />
          <span className="text-muted-foreground">{item.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-400 border-2 border-white rounded-full shadow-sm" />
        <span className="text-muted-foreground">Meilenstein</span>
      </div>
      <div className="flex items-center gap-2 border-l border-border pl-6">
        <div className="w-0.5 h-4 bg-red-500" />
        <span className="text-muted-foreground">Heute</span>
      </div>
    </div>
  );
};

export default GanttLegend;
