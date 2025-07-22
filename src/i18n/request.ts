import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
 
export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale;
  
  // Ensure that a valid locale is used
  if (!requestLocale || !routing.locales.includes(requestLocale as any)) {
    locale = routing.defaultLocale;
  } else {
    locale = requestLocale;
  }
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});