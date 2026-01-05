import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const heatmapStats = [
  { title: 'Durchschnitt Arbeitsbelastung', value: '63%', subtitle: 'Diese Woche', color: 'text-blue-600' },
  { title: 'Spitzenzeiten', value: '8:00, 6:00, 12:00', subtitle: 'Höchste Auslastung', color: 'text-orange-600' },
  { title: 'Gesamte Mitarbeiter', value: '6', subtitle: 'Maximum gleichzeitig', color: 'text-green-600' },
  { title: 'Schichtabdeckung', value: '24/7', subtitle: 'Vollständige Abdeckung', color: 'text-purple-600' }
];

const generateHeatmapData = (type: string) => {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  return days.map(day => 
    hours.map(hour => {
      let intensity = 0;
      switch (type) {
        case 'workload':
          intensity = Math.random() * 0.8 + 0.2; // 20-100%
          break;
        case 'staff':
          intensity = Math.random() * 0.6 + 0.1; // 10-70%
          break;
        case 'efficiency':
          intensity = Math.random() * 0.9 + 0.1; // 10-100%
          break;
      }
      return {
        day,
        hour,
        intensity,
        value: Math.floor(intensity * 100)
      };
    })
  );
};

const getColorClass = (intensity: number, type: string) => {
  if (type === 'workload') {
    if (intensity < 0.2) return 'bg-yellow-100';
    if (intensity < 0.4) return 'bg-yellow-200';
    if (intensity < 0.6) return 'bg-orange-200';
    if (intensity < 0.8) return 'bg-red-300';
    return 'bg-red-500';
  }
  if (type === 'staff') {
    if (intensity < 0.2) return 'bg-blue-100';
    if (intensity < 0.4) return 'bg-blue-200';
    if (intensity < 0.6) return 'bg-blue-300';
    if (intensity < 0.8) return 'bg-blue-400';
    return 'bg-blue-500';
  }
  if (type === 'efficiency') {
    if (intensity < 0.2) return 'bg-blue-100';
    if (intensity < 0.4) return 'bg-blue-200';
    if (intensity < 0.6) return 'bg-blue-300';
    if (intensity < 0.8) return 'bg-blue-400';
    return 'bg-blue-500';
  }
  return 'bg-gray-100';
};

const getLegendItems = (type: string) => {
  switch (type) {
    case 'workload':
      return [
        { label: 'Keine Daten', color: 'bg-yellow-100' },
        { label: 'Niedrig', color: 'bg-yellow-200' },
        { label: 'Mittel', color: 'bg-orange-200' },
        { label: 'Hoch', color: 'bg-red-300' },
        { label: 'Sehr hoch', color: 'bg-red-500' }
      ];
    case 'staff':
      return [
        { label: 'Keine Daten', color: 'bg-blue-100' },
        { label: 'Wenig', color: 'bg-blue-200' },
        { label: 'Mittel', color: 'bg-blue-300' },
        { label: 'Viel', color: 'bg-blue-400' },
        { label: 'Sehr hoch', color: 'bg-blue-500' }
      ];
    case 'efficiency':
      return [
        { label: 'Keine Daten', color: 'bg-blue-100' },
        { label: 'Niedrig', color: 'bg-blue-200' },
        { label: 'Mittel', color: 'bg-blue-300' },
        { label: 'Hoch', color: 'bg-blue-400' },
        { label: 'Sehr hoch', color: 'bg-blue-500' }
      ];
    default:
      return [];
  }
};

export const HeatmapView = () => {
  const [heatmapType, setHeatmapType] = useState('workload');
  const [timeRange, setTimeRange] = useState('week');
  
  const heatmapData = generateHeatmapData(heatmapType);
  const legendItems = getLegendItems(heatmapType);

  const getTitle = () => {
    switch (heatmapType) {
      case 'workload': return 'Arbeitsbelastung Heatmap';
      case 'staff': return 'Mitarbeiteranzahl Heatmap';
      case 'efficiency': return 'Effizienz Heatmap';
      default: return 'Schicht-Heatmap';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Schicht-Heatmap</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select value={heatmapType} onValueChange={setHeatmapType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workload">Arbeitsbelastung</SelectItem>
              <SelectItem value="staff">Mitarbeiteranzahl</SelectItem>
              <SelectItem value="efficiency">Effizienz</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Letzter Monat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        {heatmapStats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.subtitle}</div>
          </Card>
        ))}
      </div>

      {/* Heatmap */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
            <span className="text-white text-sm">📊</span>
          </div>
          <h3 className="text-base font-medium">{getTitle()}</h3>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm font-medium">Legende:</span>
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${item.color} border border-gray-300`}></div>
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Hour labels */}
        <div className="flex items-center mb-2">
          <div className="w-8"></div>
          <div className="grid grid-cols-24 gap-px flex-1">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="text-xs text-gray-500 text-center">
                {i % 2 === 0 ? i : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap grid */}
        <div className="space-y-px">
          {heatmapData.map((dayData, dayIndex) => (
            <div key={dayIndex} className="flex items-center">
              <div className="w-8 text-sm text-gray-600 font-medium">
                {dayData[0].day}
              </div>
              <div className="grid grid-cols-24 gap-px flex-1">
                {dayData.map((cell, hourIndex) => (
                  <div
                    key={hourIndex}
                    className={`h-6 ${getColorClass(cell.intensity, heatmapType)} border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity`}
                    title={`${cell.day} ${cell.hour}:00 - ${cell.value}%`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
              <span className="text-white text-sm">📈</span>
            </div>
            <h3 className="text-base font-medium">Erkenntnisse & Empfehlungen</h3>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-green-600 font-medium mb-1">Optimale Zeiten</div>
              <div className="text-gray-600 space-y-1">
                <div>• Frühschicht (6-14 Uhr): Beste Produktivität</div>
                <div>• Dienstag-Donnerstag: Höchste Effizienz</div>
                <div>• Vormittags: Optimale Mitarbeiterauslastung</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <h3 className="text-base font-medium">Verbesserungspotential</h3>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm">
              <div className="text-red-600 font-medium mb-1">Kritische Bereiche</div>
              <div className="text-gray-600 space-y-1">
                <div>• Wochenende: Unterbesetzung möglich</div>
                <div>• Nachtschicht: Backup-Personal einplanen</div>
                <div>• Pausenzeiten: Überlappung optimieren</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};