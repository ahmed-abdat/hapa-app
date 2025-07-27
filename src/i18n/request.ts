import {getRequestConfig} from 'next-intl/server';
import {IntlErrorCode} from 'next-intl';
import {routing} from './routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale: 'fr' | 'ar';
  
  // Await the requestLocale if it's a promise and ensure that a valid locale is used
  const resolvedLocale = await requestLocale;
  if (!resolvedLocale || !routing.locales.includes(resolvedLocale as 'fr' | 'ar')) {
    locale = routing.defaultLocale;
  } else {
    locale = resolvedLocale as 'fr' | 'ar';
  }
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    
    // Best practice: Handle missing translations gracefully
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        // Missing translation - will use default
      } else {
        // Translation error - will use default
      }
    },

    // Best practice: Provide fallbacks for missing messages  
    getMessageFallback({namespace, key}) {
      const path = [namespace, key].filter(Boolean).join('.');
      return `[${path}]`;
    }
  };
});