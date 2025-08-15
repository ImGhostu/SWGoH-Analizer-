
import React, { useRef, useState, useLayoutEffect } from 'react';
import type { Character } from '../types';
import { CrownIcon, SwordsIcon, SpeedIcon } from './icons';
import { useI18n } from '../hooks/useI18n';

interface CharacterCardProps {
  character: Character;
  onAdd: (character: Character) => void;
  isSquadFull: boolean;
  isLeader?: boolean;
  hasLeaderSynergy?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onAdd, isSquadFull, isLeader, hasLeaderSynergy }) => {
  const { t } = useI18n();
  const isGalacticLegend = character.factions.includes('Galactic Legend');
  const isDarkSide = character.factions.includes('Dark Side');
  const isLightSide = character.factions.includes('Light Side');
  const isNeutral = character.factions.includes('Neutral');

  const nameContainerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [isNameOverflowing, setIsNameOverflowing] = useState(false);

  useLayoutEffect(() => {
    setIsNameOverflowing(false);
    const nameElement = nameRef.current;
    const containerElement = nameContainerRef.current;

    if (nameElement && containerElement) {
      const containerWidth = containerElement.clientWidth;
      const textWidth = nameElement.scrollWidth;
      const isOverflowing = textWidth > containerWidth;

      setIsNameOverflowing(isOverflowing);

      if (isOverflowing) {
        const overflowAmount = textWidth - containerWidth;
        const translateValue = -(overflowAmount + 4);

        const scrollSpeed = 40; // pixels per second
        const duration = Math.max(3, overflowAmount / scrollSpeed);

        nameElement.style.setProperty('--marquee-translate', `${translateValue}px`);
        nameElement.style.setProperty('--marquee-duration', `${duration.toFixed(2)}s`);
      }
    }
  }, [character.name]);


  const handleAdd = () => {
    if (!isSquadFull) {
        onAdd(character);
    }
  };

  const factionColors: { [key: string]: string } = {
    'Sith': 'bg-red-800 text-red-100',
    'Jedi': 'bg-blue-800 text-blue-100',
    'Empire': 'bg-gray-600 text-gray-100',
    'Rebel': 'bg-orange-700 text-orange-100',
    'Galactic Republic': 'bg-yellow-700 text-yellow-100',
    'Bounty Hunter': 'bg-green-800 text-green-100',
    'Separatist': 'bg-indigo-800 text-indigo-100',
    'First Order': 'bg-stone-700 text-stone-100',
    'Resistance': 'bg-sky-700 text-sky-100',
    'Nightsister': 'bg-purple-800 text-purple-100',
    'Scoundrel': 'bg-amber-700 text-amber-100',
    'Droid': 'bg-slate-500 text-slate-100',
    'Phoenix': 'bg-rose-700 text-rose-100',
    'Mandalorian': 'bg-cyan-700 text-cyan-100',
    'Bad Batch': 'bg-teal-700 text-teal-100',
    'Clone Trooper': 'bg-slate-300 text-slate-900',
    'Gungan': 'bg-emerald-800 text-emerald-100',
  };

  const getFactionColor = (faction: string) => {
    return factionColors[faction] || 'bg-gray-700 text-gray-200';
  }

  const factionsTooltip = character.factions?.length > 0 ? `${t('factionsTooltip')} ${character.factions.map(f => t(f)).join(', ')}` : '';
  
  const getBorderClasses = () => {
    if (isGalacticLegend) {
      return 'border-sw-gold animate-glow';
    }
    if (isDarkSide) {
      return 'border-sw-sith-red animate-glow-red';
    }
    if (isLightSide) {
      return 'border-sw-jedi-blue animate-glow-blue';
    }
    if (isNeutral) {
      return 'border-gray-400 animate-glow-neutral';
    }
    return `border-sw-border ${!isSquadFull ? 'hover:border-sw-gold' : ''}`;
  };
  
  const cardClassName = `
    bg-sw-panel border-2 rounded-lg overflow-hidden transform transition-all duration-300
    ${isSquadFull 
        ? 'cursor-not-allowed opacity-50' 
        : 'cursor-pointer hover:scale-105'
    }
    ${getBorderClasses()}
  `;

  return (
    <div 
        className={cardClassName.replace(/\s+/g, ' ').trim()}
        onClick={handleAdd}
        title={isNameOverflowing ? '' : factionsTooltip}
    >
      <div className="relative h-24 w-full bg-cover bg-center" style={{ backgroundImage: `url(${character.imageUrl})` }}>
        <div className="absolute top-1 right-1 flex flex-col gap-1">
          {isLeader && (
            <div title={t('leaderAbility')} aria-label={t('leaderAbility')}>
              <CrownIcon className="w-5 h-5 text-sw-gold bg-black/50 rounded-full p-0.5" />
            </div>
          )}
          {hasLeaderSynergy && (
            <div title={t('leaderSynergy')} aria-label={t('leaderSynergy')}>
              <SwordsIcon className="w-5 h-5 text-green-400 bg-black/50 rounded-full p-0.5" />
            </div>
          )}
        </div>
        <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded">
            <span className="text-xs font-bold text-sw-gold">{character.galacticPower.toLocaleString()} GP</span>
        </div>
        <div className="absolute bottom-1 right-1 bg-black/60 px-1.5 py-0.5 rounded flex items-center" title={`${t('speedTooltip')}: ${character.speed}`}>
            <SpeedIcon className="w-3 h-3 text-cyan-300" />
            <span className="text-xs font-bold text-cyan-300 ml-0.5">{character.speed}</span>
        </div>
      </div>
      <div className="p-2">
        <div 
          ref={nameContainerRef} 
          className={`w-full overflow-hidden ${isNameOverflowing ? 'group' : ''}`}
          title={isNameOverflowing ? character.name : ''}
        >
          <h3
            ref={nameRef}
            className={`font-semibold text-sw-light text-sm whitespace-nowrap ${isNameOverflowing ? 'inline-block group-hover:animate-marquee' : 'truncate'}`}
          >
              {character.name}
          </h3>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
            {character.factions.slice(0, 3).map(faction => (
                <span key={faction} className={`text-xs px-1.5 py-0.5 rounded-full ${getFactionColor(faction)}`}>
                    {t(faction)}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
