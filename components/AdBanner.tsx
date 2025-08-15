
import React from 'react';
import { useI18n } from '../hooks/useI18n';

const AdBanner = () => {
  const { t } = useI18n();
  return (
    <div className="w-full bg-sw-panel border border-sw-border rounded-lg p-4 my-4 text-center text-sw-light animate-pulse">
      <p className="font-semibold text-sw-gold">{t('adBannerTitle')}</p>
      <p className="text-sm">{t('adBannerSubtitle')}</p>
    </div>
  );
};

export default AdBanner;
