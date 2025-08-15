import React from 'react';
import type { Character } from '../types';
import CharacterCard from './CharacterCard';
import { useI18n } from '../hooks/useI18n';
import { FilterIcon } from './icons';

interface CharacterRosterProps {
  characters: Character[];
  allCharacters: Character[];
  onAddCharacter: (character: Character) => void;
  isSquad1Full: boolean;
  isSquad2Full: boolean;
  activeSquad: 'squad1' | 'squad2';
  activeLeader: Character | null;
}

// Get all unique, filterable factions from the characters list
const getFilterableFactions = (characters: Character[]): string[] => {
    const allFactions = new Set<string>();
    characters.forEach(char => {
        if (char && Array.isArray(char.factions)) {
            char.factions.forEach(faction => allFactions.add(faction));
        }
    });
    // These tags are more like roles/descriptors than primary factions for filtering
    const ignoredFactions = new Set([
        'Leader', 'Attacker', 'Support', 'Tank', 'Healer', 
        'Galactic Legend', 'Light Side', 'Dark Side', 'Neutral', 'Unaligned Force User'
    ]);
    return Array.from(allFactions)
      .filter(f => !ignoredFactions.has(f))
      .sort();
};

const CharacterRoster: React.FC<CharacterRosterProps> = ({ characters, allCharacters, onAddCharacter, isSquad1Full, isSquad2Full, activeSquad, activeLeader }) => {
    const { t } = useI18n();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showFilters, setShowFilters] = React.useState(false);
    const [selectedFactions, setSelectedFactions] = React.useState<Set<string>>(new Set());
    
    const uniqueFactions = React.useMemo(() => getFilterableFactions(allCharacters), [allCharacters]);

    const handleFactionToggle = (faction: string) => {
        setSelectedFactions(prev => {
            const newSet = new Set(prev);
            if (newSet.has(faction)) {
                newSet.delete(faction);
            } else {
                newSet.add(faction);
            }
            return newSet;
        });
    };

    const clearFactions = () => {
        setSelectedFactions(new Set());
    };

    const isTargetSquadFull = activeSquad === 'squad1' ? isSquad1Full : isSquad2Full;

    const filteredAndSortedCharacters = React.useMemo(() => {
        const filtered = characters.filter(char => {
            if (!char || !char.name || !Array.isArray(char.factions)) {
                return false;
            }

            // Faction filter: must have ALL selected factions
            if (selectedFactions.size > 0) {
                for (const sf of selectedFactions) {
                    if (!char.factions.includes(sf)) {
                        return false;
                    }
                }
            }

            // Search term filter
            const term = searchTerm.toLowerCase();
            if (term) {
                const nameMatch = char.name.toLowerCase().includes(term);
                const factionMatch = char.factions.some(f => t(f).toLowerCase().includes(term));
                if (!(nameMatch || factionMatch)) {
                    return false;
                }
            }
            
            return true;
        });

        // Sort by leader synergy if a leader is selected
        if (activeLeader && activeLeader.synergies) {
            const leaderSynergies = new Set(activeLeader.synergies);
            
            const synergyCharacters: Character[] = [];
            const otherCharacters: Character[] = [];

            for (const char of filtered) {
                if (leaderSynergies.has(char.id)) {
                    synergyCharacters.push(char);
                } else {
                    otherCharacters.push(char);
                }
            }
            // The base list is already sorted alphabetically, so this preserves order within groups
            return [...synergyCharacters, ...otherCharacters];
        }

        return filtered;
    }, [characters, selectedFactions, searchTerm, t, activeLeader]);

  return (
    <div className="bg-sw-panel p-4 rounded-lg border border-sw-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-sw-light">{t('rosterTitle')}</h3>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="flex items-center gap-2 text-sw-light bg-sw-dark px-3 py-1 rounded-md border border-sw-border hover:bg-sw-border transition-colors"
          aria-expanded={showFilters}
        >
          <FilterIcon className="w-5 h-5" />
          {t('filterButton')}
        </button>
      </div>

      {showFilters && (
        <div className="mb-4 p-3 bg-sw-darker rounded-lg border border-sw-border">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-sw-light">{t('filterByFaction')}</h4>
                <button onClick={clearFactions} className="text-xs text-sw-sith-red hover:underline">
                    {t('clearFilters')}
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {uniqueFactions.map(faction => (
                    <button
                        key={faction}
                        onClick={() => handleFactionToggle(faction)}
                        className={`text-xs px-2 py-1 rounded-full border transition-colors ${selectedFactions.has(faction) ? 'bg-sw-jedi-blue border-blue-400 text-white' : 'bg-sw-dark border-sw-border text-sw-light hover:bg-sw-border'}`}
                        aria-pressed={selectedFactions.has(faction)}
                    >
                        {t(faction)}
                    </button>
                ))}
            </div>
        </div>
      )}

      <input
        type="text"
        placeholder={t('rosterSearchPlaceholder')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-sw-dark border border-sw-border rounded-md px-3 py-2 mb-4 text-sw-light focus:outline-none focus:ring-2 focus:ring-sw-gold"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[calc(60vh-100px)] overflow-y-auto pr-2">
        {filteredAndSortedCharacters.map(character => {
          const isLeader = character.factions.includes('Leader');
          const hasLeaderSynergy = !!(activeLeader && activeLeader.synergies && activeLeader.synergies.includes(character.id));
          
          return (
            <CharacterCard 
              key={character.id} 
              character={character} 
              onAdd={onAddCharacter}
              isSquadFull={isTargetSquadFull}
              isLeader={isLeader}
              hasLeaderSynergy={hasLeaderSynergy}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CharacterRoster;