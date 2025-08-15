import React, { useMemo } from 'react';
import type { Squad, Character } from '../types';
import { useI18n } from '../hooks/useI18n';
import { SpeedIcon } from './icons';

interface TurnOrderAnimatorProps {
  squad1: Squad;
  squad2: Squad;
}

const TurnOrderAnimator: React.FC<TurnOrderAnimatorProps> = ({ squad1, squad2 }) => {
  const { t } = useI18n();

  const sortedCharacters = useMemo(() => {
    const allCharacters = [...squad1, ...squad2].filter((c): c is Character => c !== null);
    return allCharacters.sort((a, b) => b.speed - a.speed);
  }, [squad1, squad2]);

  if (sortedCharacters.length === 0) {
    return null;
  }
  
  return (
    <div className="my-6 py-4 border-y-2 border-sw-border">
      <h3 className="text-xl font-bold text-center mb-6 text-sw-light">{t('turnOrder')}</h3>
      <div 
        className="flex justify-center items-start gap-4 flex-wrap"
        style={{ minHeight: '100px' }} // Ensure container has height for absolutely positioned elements
      >
        {sortedCharacters.map((character, index) => {
          const isLightSide = character.factions.includes('Light Side');
          const isDarkSide = character.factions.includes('Dark Side');
          const pulseColor = isLightSide ? '#2563eb' : (isDarkSide ? '#dc2626' : '#9ca3af'); // Jedi Blue, Sith Red, Gray

          return (
            <div key={character.id} className="relative flex flex-col items-center w-20 text-center">
              <div 
                className="absolute -inset-1 rounded-full animate-turnPulse"
                style={{
                  animationDelay: `${index * 0.4}s`,
                  animationFillMode: 'both',
                  animationIterationCount: 1,
                  // @ts-ignore
                  '--tw-shadow-color': pulseColor,
                }}
              />
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-sw-dark"
                title={`${character.name} (${character.speed} Speed)`}
              />
              <div className="mt-2 flex items-center justify-center text-xs font-semibold text-cyan-300">
                <SpeedIcon className="w-3 h-3 mr-1 text-cyan-300" />
                {character.speed}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TurnOrderAnimator;
