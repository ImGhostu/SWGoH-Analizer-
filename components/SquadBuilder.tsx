import React, { useRef, useState, useLayoutEffect } from 'react';
import type { Squad, Character } from '../types';
import { PlusIcon, CrownIcon } from './icons';
import { useI18n } from '../hooks/useI18n';
import SynergyIndicator from './SynergyIndicator';

interface SquadSlotProps {
  character: Character | null;
  onRemove: () => void;
  onSetLeader: () => void;
  synergyLevel: number;
  isLeader: boolean;
}

const SquadSlot: React.FC<SquadSlotProps> = ({ character, onRemove, onSetLeader, synergyLevel, isLeader }) => {
  const { t } = useI18n();
  const canBeLeader = character && character.factions.includes('Leader');
  
  const nameContainerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const [isNameOverflowing, setIsNameOverflowing] = useState(false);

  useLayoutEffect(() => {
    setIsNameOverflowing(false);
    const nameElement = nameRef.current;
    const containerElement = nameContainerRef.current;

    if (nameElement && containerElement && character) {
      const containerWidth = containerElement.clientWidth;
      const textWidth = nameElement.scrollWidth;
      const isOverflowing = textWidth > containerWidth;

      setIsNameOverflowing(isOverflowing);

      if (isOverflowing) {
        const overflowAmount = textWidth - containerWidth;
        const translateValue = -(overflowAmount + 4);

        const scrollSpeed = 40;
        const duration = Math.max(2.5, overflowAmount / scrollSpeed);

        nameElement.style.setProperty('--marquee-translate', `${translateValue}px`);
        nameElement.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
      }
    }
  }, [character]);


  const handleClick = () => {
    if (canBeLeader && !isLeader) {
      onSetLeader();
    }
  };

  const borderClasses = isLeader
    ? 'border-solid border-sw-gold animate-glow'
    : 'border-dashed border-sw-border';

  const cursorClass = canBeLeader && !isLeader ? 'hover:border-gray-400 cursor-pointer' : '';
  const tooltip = canBeLeader && !isLeader ? t('setLeaderTooltip') : (character?.name || '');


  return (
    <div
      className={`h-28 w-24 bg-sw-dark border-2 rounded-lg flex items-center justify-center relative group transition-colors ${borderClasses} ${cursorClass}`}
      onClick={handleClick}
      title={isNameOverflowing ? character?.name : tooltip}
    >
      {character ? (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center rounded-md" 
            style={{ backgroundImage: `url(${character.imageUrl})` }}
          />
           <div 
            className="absolute top-1 left-1" 
            title={t('synergyTooltip')}
            data-testid="synergy-indicator"
          >
            <SynergyIndicator level={synergyLevel} />
          </div>
          <div 
            ref={nameContainerRef} 
            className="absolute inset-x-0 bottom-0 p-1 bg-black bg-opacity-40 overflow-hidden"
          >
            <p
              ref={nameRef}
              className={`text-white text-xs font-semibold w-full text-center whitespace-nowrap ${isNameOverflowing ? 'inline-block group-hover:animate-marquee' : 'truncate'}`}
            >
              {character.name}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-2 -right-2 bg-sw-sith-red text-white rounded-full h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={`Remove ${character.name}`}
          >
            &times;
          </button>
          {isLeader && (
            <div className="absolute -bottom-2.5" title={t('leaderAbility')}>
              <CrownIcon className="w-7 h-7 text-sw-gold filter drop-shadow-lg" />
            </div>
          )}
        </>
      ) : (
        <PlusIcon className="h-8 w-8 text-sw-border" />
      )}
    </div>
  );
};


interface SquadBuilderProps {
  title: string;
  squad: Squad;
  titleColor: string;
  onRemoveCharacter: (index: number) => void;
  onClearSquad: () => void;
  synergyLevels: number[];
  leaderIndex: number | null;
  onSetLeader: (index: number) => void;
  totalGP: number;
}

const SquadBuilder: React.FC<SquadBuilderProps> = ({ title, squad, titleColor, onRemoveCharacter, onClearSquad, synergyLevels, leaderIndex, onSetLeader, totalGP }) => {
  const { t } = useI18n();
  return (
    <div className="bg-sw-panel p-4 rounded-lg border border-sw-border w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${titleColor}`}>{title}</h2>
        <div className="text-right">
          <p className="text-lg font-bold text-sw-gold">{totalGP.toLocaleString()}</p>
          <p className="text-xs text-sw-light -mt-1">{t('totalGP')}</p>
        </div>
        <button 
          onClick={onClearSquad}
          className="text-sm bg-sw-sith-red text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
        >
          {t('clearButton')}
        </button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {squad.map((character, index) => (
          <SquadSlot 
            key={character ? `${character.id}-${index}` : `empty-${index}`}
            character={character} 
            onRemove={() => onRemoveCharacter(index)}
            onSetLeader={() => onSetLeader(index)}
            synergyLevel={synergyLevels[index]}
            isLeader={index === leaderIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default SquadBuilder;