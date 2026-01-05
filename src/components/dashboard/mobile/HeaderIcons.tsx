import React from 'react';

export const SignalBars = () => (
  <div className="flex items-end gap-0.5 h-3.5">
    {[1, 2, 3, 4].map((bar) => (
      <div
        key={bar}
        className="w-0.5 bg-current rounded-t"
        style={{ height: `${bar * 25}%` }}
      />
    ))}
  </div>
);

export const BatteryIcon = ({ percentage = 100 }: { percentage?: number }) => (
  <div className="flex items-center gap-1">
    <div className="relative w-6 h-3 border border-gray-900 rounded-sm">
      <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-1 h-1.5 bg-gray-900 rounded-r" />
      <div 
        className="absolute inset-0.5 bg-gray-900 rounded-sm transition-all"
        style={{ width: `${Math.max(percentage - 10, 0)}%` }}
      />
    </div>
    <span className="text-[10px] text-gray-900 font-medium">{percentage}%</span>
  </div>
);
