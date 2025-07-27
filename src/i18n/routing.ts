import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['fr', 'ar'],
  
  // Used when no locale matches
  defaultLocale: 'fr',

  // Configure locale prefix strategy
  // 'always' ensures all locales have prefixes, avoiding routing issues
  localePrefix: 'always',
  
  // Disable automatic locale detection to avoid conflicts
  localeDetection: false
});