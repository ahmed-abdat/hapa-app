import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale: string;
  
  // Await the requestLocale if it's a promise and ensure that a valid locale is used
  const resolvedLocale = await requestLocale;
  if (!resolvedLocale || !routing.locales.includes(resolvedLocale as 'fr' | 'ar')) {
    locale = routing.defaultLocale;
  } else {
    locale = resolvedLocale;
  }
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});