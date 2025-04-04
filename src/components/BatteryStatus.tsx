
import React from 'react';
import { Battery } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BatteryStatusProps {
  level: number;
}

export const BatteryStatus: React.FC<BatteryStatusProps> = ({ level }) => {
  const getBatteryColor = () => {
    if (level <= 20) return 'text-drone-danger';
    if (level <= 40) return 'text-drone-warning';
    return 'text-drone-accent';
  };

  return (
    <div className="flex items-center gap-1">
      <div className={cn("battery-indicator", getBatteryColor())}>
        <div 
          className="battery-level"
          style={{ width: `${level}%` }}
        />
      </div>
      <span className={cn("text-sm font-mono", getBatteryColor())}>
        {level}%
      </span>
    </div>
  );
};
