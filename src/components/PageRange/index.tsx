import React from "react";
import { useTranslations } from 'next-intl'
import { type Locale } from '@/utilities/locale'
import { FileText, Hash } from 'lucide-react'

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
        return isPlural ? (locale === 'ar' ? 'مقالات' : 'articles') : (locale === 'ar' ? 'مقال' : 'article');
      default:
        return isPlural ? (locale === 'ar' ? 'عناصر' : 'éléments') : (locale === 'ar' ? 'عنصر' : 'élément');
    }
  };

  if (typeof totalDocs === "undefined" || totalDocs === 0) {
    return (
      <div className={[className, "flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"].filter(Boolean).join(" ")}>
        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
          <FileText className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">
            {locale === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat trouvé'}
          </p>
          <p className="text-xs text-gray-400">
            {locale === 'ar' ? 'جرب استخدام فلاتر مختلفة' : 'Essayez avec des filtres différents'}
          </p>
        </div>
      </div>
    );
  }

  if (totalDocs > 0) {
    return (
      <div className={[className, "flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10"].filter(Boolean).join(" ")}>
        <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
          <Hash className="w-4 h-4 text-primary" />
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {locale === 'ar' 
              ? `عرض ${indexStart}${indexStart !== indexEnd ? ` - ${indexEnd}` : ""} من ${totalDocs} ${getCollectionLabel(totalDocs !== 1)}`
              : `Affichage de ${indexStart}${indexStart !== indexEnd ? ` - ${indexEnd}` : ""} sur ${totalDocs} ${getCollectionLabel(totalDocs !== 1)}`
            }
          </p>
          <p className="text-xs text-gray-500">
            {currentPage && (
              locale === 'ar' 
                ? `الصفحة ${currentPage}` 
                : `Page ${currentPage}`
            )}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-10 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (indexEnd / totalDocs) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {Math.round((indexEnd / totalDocs) * 100)}%
          </span>
        </div>
      </div>
    );
  }

  return null;
};
