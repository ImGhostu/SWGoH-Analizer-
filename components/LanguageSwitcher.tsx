
import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { supportedLanguages } from '../locales/translations';

const GlobeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);


const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useI18n();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLanguage(e.target.value);
    };

    return (
        <div className="flex items-center gap-2">
            <GlobeIcon className="w-6 h-6 text-sw-light" />
            <select
                value={language}
                onChange={handleLanguageChange}
                className="bg-sw-dark border border-sw-border text-sw-light rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sw-gold appearance-none"
            >
                {supportedLanguages.map(({ code, name }) => (
                    <option key={code} value={code}>
                        {name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSwitcher;
