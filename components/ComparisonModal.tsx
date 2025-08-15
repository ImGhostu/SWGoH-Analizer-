

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CloseIcon } from './icons';
import { useI18n } from '../hooks/useI18n';
import type { Squad } from '../types';
import TurnOrderAnimator from './TurnOrderAnimator';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: string;
  isLoading: boolean;
  squad1: Squad;
  squad2: Squad;
  squad1GP: number;
  squad2GP: number;
  squad1LeaderIndex: number | null;
  squad2LeaderIndex: number | null;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, analysis, isLoading, squad1, squad2, squad1GP, squad2GP, squad1LeaderIndex, squad2LeaderIndex }) => {
  const { t } = useI18n();

  if (!isOpen) return null;
  
  const parsedAnalysis = useMemo(() => {
    const sections: { [key: string]: string } = {
        squadA: '',
        squadB: '',
        matchup: '',
        outcome: ''
    };
    if (!analysis) return sections;

    const headers = {
        squadA: t('analysisSquadA'),
        squadB: t('analysisSquadB'),
        matchup: t('analysisMatchup'),
        outcome: t('analysisOutcome'),
    };
    
    const extractSection = (header: string, content: string) => {
        const regex = new RegExp(`##\\s*${header}\\s*([\\s\\S]*?)(?=##|$)`, 'i');
        const match = content.match(regex);
        return match ? match[1].trim() : '';
    };

    sections.squadA = extractSection(headers.squadA, analysis);
    sections.squadB = extractSection(headers.squadB, analysis);
    sections.matchup = extractSection(headers.matchup, analysis);
    sections.outcome = extractSection(headers.outcome, analysis);
    
    return sections;
  }, [analysis, t]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sw-jedi-blue"></div>
          <p className="mt-4 text-sw-light">{t('modalLoading')}</p>
        </div>
      );
    }
    
    const markdownStyles = "prose prose-invert prose-p:text-sw-light prose-li:text-sw-light prose-h2:text-sw-jedi-blue prose-h2:text-2xl prose-h2:font-bold prose-strong:text-sw-sith-red prose-strong:font-semibold max-w-none";

    return (
      <>
        {/* Squads and GP */}
        <div className="flex flex-col md:flex-row mb-6 gap-4">
          <div className="w-full md:w-1/2 px-2 text-center">
             <h4 className="text-lg font-semibold text-sw-light mb-2">{t('totalGP')}</h4>
             <p className="text-4xl font-bold text-sw-gold mb-3">{squad1GP.toLocaleString()}</p>
            <div className="flex justify-center flex-wrap gap-2">
              {squad1.map((character, index) => (
                <div key={character?.id || `squad1-${index}`} title={character?.name}>
                  {character ? (
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className={`w-20 h-20 rounded-full object-cover ${index === squad1LeaderIndex ? 'border-4 border-sw-gold' : 'border-2 border-sw-border'}`}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-sw-dark border-2 border-dashed border-sw-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 px-2 text-center">
            <h4 className="text-lg font-semibold text-sw-light mb-2">{t('totalGP')}</h4>
             <p className="text-4xl font-bold text-sw-gold mb-3">{squad2GP.toLocaleString()}</p>
            <div className="flex justify-center flex-wrap gap-2">
              {squad2.map((character, index) => (
                <div key={character?.id || `squad2-${index}`} title={character?.name}>
                  {character ? (
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className={`w-20 h-20 rounded-full object-cover ${index === squad2LeaderIndex ? 'border-4 border-sw-gold' : 'border-2 border-sw-border'}`}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-sw-dark border-2 border-dashed border-sw-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <TurnOrderAnimator squad1={squad1} squad2={squad2} />

        {/* Predicted Outcome */}
        {parsedAnalysis.outcome && (
          <div className="border-t-2 border-sw-gold pt-4 my-6">
            <h3 className="text-2xl font-bold text-center mb-4 text-sw-gold">{t('analysisOutcome')}</h3>
            <div className={markdownStyles}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedAnalysis.outcome}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Analysis Columns */}
        <div className="flex flex-col md:flex-row gap-6 my-6">
            <div className="w-full md:w-1/2 bg-sw-darker p-4 rounded-lg border border-sw-border">
                <h3 className="text-xl font-bold mb-4 text-sw-jedi-blue">{t('analysisSquadA')}</h3>
                <div className={markdownStyles}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedAnalysis.squadA}</ReactMarkdown>
                </div>
            </div>
            <div className="w-full md:w-1/2 bg-sw-darker p-4 rounded-lg border border-sw-border">
                <h3 className="text-xl font-bold mb-4 text-sw-sith-red">{t('analysisSquadB')}</h3>
                 <div className={markdownStyles}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedAnalysis.squadB}</ReactMarkdown>
                </div>
            </div>
        </div>
        
        {/* Head-to-Head */}
        {parsedAnalysis.matchup && (
             <div className="border-t border-sw-border pt-4 mt-6">
                <h3 className="text-2xl font-bold text-center mb-4 text-sw-light">{t('analysisMatchup')}</h3>
                <div className={markdownStyles}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsedAnalysis.matchup}</ReactMarkdown>
                </div>
            </div>
        )}
      </>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-sw-panel border-2 border-sw-gold rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-sw-border">
          <h2 className="text-2xl font-bold text-sw-gold">{t('modalTitle')}</h2>
          <button onClick={onClose} className="text-sw-light hover:text-sw-sith-red transition-colors">
            <CloseIcon className="w-8 h-8" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;