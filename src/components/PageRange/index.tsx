import React from "react";
import { type Locale } from '@/utilities/locale'
import { t } from '@/utilities/translations'

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
        return isPlural ? t('posts', locale) : t('post', locale);
      default:
        return isPlural ? t('elements', locale) : t('element', locale);
    }
  };

  if (typeof totalDocs === "undefined" || totalDocs === 0) {
    return (
      <div className={[className, "text-sm text-muted-foreground"].filter(Boolean).join(" ")}>
        {t('noResults', locale)}
      </div>
    );
  }

  if (totalDocs > 0) {
    const plural = getCollectionLabel(true);
    const singular = getCollectionLabel(false);
    const label = totalDocs > 1 ? plural : singular;
    
    return (
      <div className={[className, "text-sm text-muted-foreground"].filter(Boolean).join(" ")}>
        {t('showing', locale)} {indexStart}{indexStart > 0 ? ` - ${indexEnd}` : ""} {t('of', locale)} {totalDocs} {label}
      </div>
    );
  }

  return null;
};
