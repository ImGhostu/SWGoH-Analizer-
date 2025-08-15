import React from 'react';

interface SynergyIndicatorProps {
  level: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const SynergyIndicator: React.FC<SynergyIndicatorProps> = ({
  level,
  size = 24,
  strokeWidth = 3,
  className = ''
}) => {
  if (level <= 0) {
    return null; // Don't render anything if there's no synergy
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - level * circumference;

  return (
    <div className="bg-black/50 rounded-full">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
        {/* Background Circle */}
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(107, 114, 128, 0.5)" // sw-border with opacity
            strokeWidth={strokeWidth}
            fill="transparent"
        />
        {/* Foreground Arc */}
        <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981" // A vibrant green
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.3s ease-in-out' }}
        />
        </svg>
    </div>
  );
};

export default SynergyIndicator;