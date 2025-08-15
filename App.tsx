

import React, { useState, useCallback, useEffect } from 'react';
import type { Character, Squad } from './types';
import { ALL_CHARACTERS } from './data/characters';
import { analyzeSquads } from './services/geminiService';
import CharacterRoster from './components/CharacterRoster';
import SquadBuilder from './components/SquadBuilder';
import ComparisonModal from './components/ComparisonModal';
import AdBanner from './components/AdBanner';
import { CrownIcon, SwordsIcon } from './components/icons';
import { useI18n } from './hooks/useI18n';
import LanguageSwitcher from './components/LanguageSwitcher';

const App: React.FC = () => {
  const SQUAD_SIZE = 5;
  const initialSquad: Squad = Array(SQUAD_SIZE).fill(null);
  const { t, language } = useI18n();
  
  const [squad1, setSquad1] = useState<Squad>(initialSquad);
  const [squad2, setSquad2] = useState<Squad>(initialSquad);
  const [squad1Synergies, setSquad1Synergies] = useState<number[]>(Array(SQUAD_SIZE).fill(0));
  const [squad2Synergies, setSquad2Synergies] = useState<number[]>(Array(SQUAD_SIZE).fill(0));
  const [squad1LeaderIndex, setSquad1LeaderIndex] = useState<number | null>(null);
  const [squad2LeaderIndex, setSquad2LeaderIndex] = useState<number | null>(null);
  const [squad1GP, setSquad1GP] = useState<number>(0);
  const [squad2GP, setSquad2GP] = useState<number>(0);

  const [activeSquad, setActiveSquad] = useState<'squad1' | 'squad2'>('squad1');
  const [activeLeader, setActiveLeader] = useState<Character | null>(null);
  
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showPremiumUpsell, setShowPremiumUpsell] = useState<boolean>(false);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);

  const isSquad1Full = squad1.every(c => c !== null);
  const isSquad2Full = squad2.every(c => c !== null);

  const syncLeader = useCallback((squad: Squad, leaderIndex: number | null, setLeaderIndex: (index: number | null) => void) => {
    if (leaderIndex !== null && squad[leaderIndex]?.factions.includes('Leader')) {
      return;
    }
    const newLeaderIndex = squad.findIndex(char => char && char.factions.includes('Leader'));
    setLeaderIndex(newLeaderIndex !== -1 ? newLeaderIndex : null);
  }, []);

  useEffect(() => {
    syncLeader(squad1, squad1LeaderIndex, setSquad1LeaderIndex);
  }, [squad1, syncLeader, squad1LeaderIndex]);

  useEffect(() => {
    syncLeader(squad2, squad2LeaderIndex, setSquad2LeaderIndex);
  }, [squad2, syncLeader, squad2LeaderIndex]);


  useEffect(() => {
    const calculateSynergies = (squad: Squad): number[] => {
        return squad.map((character, index, currentSquad) => {
            if (!character || !character.synergies || character.synergies.length === 0) {
                return 0;
            }

            const allies = currentSquad.filter((_, i) => i !== index);
            let synergyCount = 0;
            
            for (const ally of allies) {
                if (ally && character.synergies.includes(ally.id)) {
                    synergyCount++;
                }
            }
            
            return synergyCount / (SQUAD_SIZE - 1); 
        });
    };
    
    const calculateTotalGP = (squad: Squad): number => {
        return squad.reduce((total, char) => total + (char?.galacticPower || 0), 0);
    }

    setSquad1Synergies(calculateSynergies(squad1));
    setSquad2Synergies(calculateSynergies(squad2));
    setSquad1GP(calculateTotalGP(squad1));
    setSquad2GP(calculateTotalGP(squad2));

  }, [squad1, squad2]);

  useEffect(() => {
    const leaderIndex = activeSquad === 'squad1' ? squad1LeaderIndex : squad2LeaderIndex;
    const currentSquad = activeSquad === 'squad1' ? squad1 : squad2;

    if (leaderIndex !== null && currentSquad[leaderIndex]) {
        setActiveLeader(currentSquad[leaderIndex]);
    } else {
        setActiveLeader(null);
    }
  }, [squad1, squad2, activeSquad, squad1LeaderIndex, squad2LeaderIndex]);


  const handleAddCharacter = useCallback((character: Character) => {
    const setSquad = activeSquad === 'squad1' ? setSquad1 : setSquad2;
    const currentSquad = activeSquad === 'squad1' ? squad1 : squad2;

    if (currentSquad.some(c => c?.id === character.id)) return;

    const firstEmptyIndex = currentSquad.findIndex(slot => slot === null);
    if (firstEmptyIndex !== -1) {
      setSquad(prevSquad => {
        const newSquad = [...prevSquad];
        newSquad[firstEmptyIndex] = character;
        return newSquad;
      });
    }
  }, [activeSquad, squad1, squad2]);

  const handleRemoveCharacter = (squad: 'squad1' | 'squad2', index: number) => {
    const setSquad = squad === 'squad1' ? setSquad1 : setSquad2;
    setSquad(prevSquad => {
      const newSquad = [...prevSquad];
      newSquad[index] = null;
      return newSquad;
    });
  };

  const handleClearSquad = (squad: 'squad1' | 'squad2') => {
    const setSquad = squad === 'squad1' ? setSquad1 : setSquad2;
    setSquad(Array(SQUAD_SIZE).fill(null));
  };
  
  const handleSetLeader = useCallback((squadId: 'squad1' | 'squad2', index: number) => {
    const squad = squadId === 'squad1' ? squad1 : squad2;
    const setLeaderIndex = squadId === 'squad1' ? setSquad1LeaderIndex : setSquad2LeaderIndex;

    if (squad[index] && squad[index]?.factions.includes('Leader')) {
      setLeaderIndex(index);
    }
  }, [squad1, squad2]);

  const handleCompare = async () => {
    if (!isSquad1Full || !isSquad2Full) return;

    if (!isPremium) {
      setShowPremiumUpsell(true);
      return;
    }

    setIsModalOpen(true);
    setIsLoadingAnalysis(true);
    setAnalysisResult('');

    const analysis = await analyzeSquads(squad1 as Character[], squad2 as Character[], language, t('geminiError'));
    setAnalysisResult(analysis);
    setIsLoadingAnalysis(false);
  };
  
  const upgradeToPremium = () => {
      setIsPremium(true);
      setShowPremiumUpsell(false);
      if(isSquad1Full && isSquad2Full) {
        setIsModalOpen(true);
        setIsLoadingAnalysis(true);
        setAnalysisResult('');
        analyzeSquads(squad1 as Character[], squad2 as Character[], language, t('geminiError')).then(analysis => {
            setAnalysisResult(analysis);
            setIsLoadingAnalysis(false);
        });
      }
  };

  const getFilteredCharacters = () => {
    const currentSquad = activeSquad === 'squad1' ? squad1 : squad2;
    const usedIdsInCurrentSquad = new Set(currentSquad.map(c => c?.id).filter(Boolean));
    return ALL_CHARACTERS.filter(c => !usedIdsInCurrentSquad.has(c.id));
  };

  return (
    <div className="min-h-screen text-sw-light p-4 md:p-8">
      <header className="text-center mb-8 relative">
        <h1 className="text-4xl md:text-5xl font-bold text-sw-gold tracking-wider">{t('headerTitle')}</h1>
        <p className="text-sw-light mt-2">{t('headerSubtitle')}</p>
        <p className="text-sm text-gray-400 mt-1">{t('relicLevelInfo')}</p>
        <div className="absolute top-0 right-0">
          <LanguageSwitcher />
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-11 gap-8">
        <aside className="lg:col-span-1 xl:col-span-4">
            <CharacterRoster 
                characters={getFilteredCharacters()}
                allCharacters={ALL_CHARACTERS}
                onAddCharacter={handleAddCharacter}
                isSquad1Full={isSquad1Full}
                isSquad2Full={isSquad2Full}
                activeSquad={activeSquad}
                activeLeader={activeLeader}
            />
             {!isPremium && <AdBanner />}
        </aside>

        <main className="lg:col-span-2 xl:col-span-7 space-y-8">
          <div className="flex flex-col md:flex-row gap-4">
              <div 
                onClick={() => setActiveSquad('squad1')}
                className={`w-full p-2 border-4 rounded-xl transition-all ${activeSquad === 'squad1' ? 'border-sw-jedi-blue' : 'border-transparent'}`}
              >
                  <SquadBuilder 
                    title={t('squadA')} 
                    squad={squad1} 
                    titleColor="text-sw-jedi-blue"
                    onRemoveCharacter={(index) => handleRemoveCharacter('squad1', index)}
                    onClearSquad={() => handleClearSquad('squad1')}
                    synergyLevels={squad1Synergies}
                    leaderIndex={squad1LeaderIndex}
                    onSetLeader={(index) => handleSetLeader('squad1', index)}
                    totalGP={squad1GP}
                  />
              </div>
               <div 
                onClick={() => setActiveSquad('squad2')}
                className={`w-full p-2 border-4 rounded-xl transition-all ${activeSquad === 'squad2' ? 'border-sw-sith-red' : 'border-transparent'}`}
               >
                  <SquadBuilder 
                    title={t('squadB')} 
                    squad={squad2} 
                    titleColor="text-sw-sith-red"
                    onRemoveCharacter={(index) => handleRemoveCharacter('squad2', index)}
                    onClearSquad={() => handleClearSquad('squad2')}
                    synergyLevels={squad2Synergies}
                    leaderIndex={squad2LeaderIndex}
                    onSetLeader={(index) => handleSetLeader('squad2', index)}
                    totalGP={squad2GP}
                  />
               </div>
          </div>
          
           {!isPremium && <AdBanner />}

          <div className="flex justify-center">
            <button 
              onClick={handleCompare}
              disabled={!isSquad1Full || !isSquad2Full}
              className="flex items-center gap-3 bg-sw-gold text-sw-dark font-bold text-xl px-8 py-4 rounded-lg shadow-lg hover:bg-yellow-400 transition-all transform hover:scale-105 disabled:bg-sw-border disabled:text-gray-500 disabled:cursor-not-allowed disabled:scale-100"
            >
              <SwordsIcon className="w-7 h-7" />
              {t('analyzeButton')}
              {!isPremium && <CrownIcon className="w-7 h-7 text-purple-500"/>}
            </button>
          </div>
        </main>
      </div>
      
      <ComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        analysis={analysisResult}
        isLoading={isLoadingAnalysis}
        squad1={squad1}
        squad2={squad2}
        squad1GP={squad1GP}
        squad2GP={squad2GP}
        squad1LeaderIndex={squad1LeaderIndex}
        squad2LeaderIndex={squad2LeaderIndex}
      />

       {showPremiumUpsell && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-sw-panel border-2 border-sw-gold rounded-lg shadow-2xl p-8 text-center max-w-md">
            <CrownIcon className="w-16 h-16 mx-auto text-sw-gold mb-4" />
            <h2 className="text-2xl font-bold text-sw-light mb-2">{t('premiumTitle')}</h2>
            <p className="text-sw-light mb-6">{t('premiumSubtitle')}</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowPremiumUpsell(false)} className="bg-sw-border text-sw-light px-6 py-2 rounded-md hover:bg-gray-600 transition-colors">{t('premiumLater')}</button>
              <button onClick={upgradeToPremium} className="bg-sw-gold text-sw-dark font-bold px-6 py-2 rounded-md hover:bg-yellow-400 transition-colors">{t('premiumUpgrade')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;