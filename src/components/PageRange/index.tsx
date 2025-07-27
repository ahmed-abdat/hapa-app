import React from "react";
import { useTranslations } from 'next-intl'
import { type Locale } from '@/utilities/locale'

export const PageRange: React.FC<{
  className?: string;
  collection?: string;
  collectionLabels?: {
    plural?: string;
    singular?: string;
  };
  currentPage?: number;
  limit?: number;
  totalDocs?: number;
  locale?: Locale;
}> = (props) => {
  const {
    className,
    collection = 'posts',
    collectionLabels: collectionLabelsFromProps,
    currentPage,
    limit,
    totalDocs,
    locale = 'fr',
  } = props;
  const t = useTranslations();

  let indexStart = (currentPage ? currentPage - 1 : 1) * (limit || 1) + 1;
  if (totalDocs && indexStart > totalDocs) indexStart = 0;

  let indexEnd = (currentPage || 1) * (limit || 1);
  if (totalDocs && indexEnd > totalDocs) indexEnd = totalDocs;

  // Get translated collection labels
  const getCollectionLabel = (isPlural: boolean) => {
    if (collectionLabelsFromProps) {
      return isPlural ? collectionLabelsFromProps.plural : collectionLabelsFromProps.singular;
    }
    
    switch (collection) {
      case 'posts':
        return isPlural ? t('posts') : t('post');
      default:
        return isPlural ? t('elements') : t('element');
    }
  };

  if (typeof totalDocs === "undefined" || totalDocs === 0) {
    return (
      <div className={[className, "text-sm text-muted-foreground"].filter(Boolean).join(" ")}>
        {t('noResults')}
      </div>
    );
  }

  if (totalDocs > 0) {
    return (
      <div className={[className, "text-sm text-muted-foreground"].filter(Boolean).join(" ")}>
        {t('showing')} {indexStart}{indexStart > 0 ? ` - ${indexEnd}` : ""}
      </div>
    );
  }

  return null;
};
