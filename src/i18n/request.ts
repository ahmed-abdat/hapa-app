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
 
  let messages;
  try {
    // Enhanced message loading with fallback strategy
    const userMessages = (await import(`../../messages/${locale}.json`)).default;
    
    // For non-default locales, merge with default locale to prevent missing translations
    if (locale !== routing.defaultLocale) {
      try {
        const defaultMessages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
        
        // Type-safe merge function for translation messages
        type Messages = Record<string, unknown>;
        const mergeMessages = (defaults: Messages, user: Messages): Messages => {
          const merged = { ...defaults };
          for (const key in user) {
            if (user[key] && typeof user[key] === 'object' && !Array.isArray(user[key])) {
              merged[key] = mergeMessages(merged[key] as Messages || {}, user[key] as Messages);
            } else if (user[key] !== undefined) {
              merged[key] = user[key];
            }
          }
          return merged;
        };
        
        messages = mergeMessages(defaultMessages, userMessages);
      } catch (fallbackError) {
        console.warn(`Could not load default messages, using user messages only for ${locale}`);
        messages = userMessages;
      }
    } else {
      messages = userMessages;
    }
    
    // Validate that messages were loaded
    if (!messages || typeof messages !== 'object') {
      console.warn(`Invalid messages for locale: ${locale}, using empty object`);
      messages = {};
    }
  } catch (error) {
    console.error(`Error loading messages for locale: ${locale}`, error);
    
    // Ultimate fallback - try loading default locale
    try {
      messages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
      console.warn(`Fallback to default locale (${routing.defaultLocale}) for ${locale}`);
    } catch (fallbackError) {
      console.error(`Could not load any messages, using empty object`);
      messages = {};
    }
  }

  return {
    locale,
    messages,
    
    // Best practice: Handle missing translations gracefully
    onError(error) {
      if (error.code === IntlErrorCode.MISSING_MESSAGE) {
        // Only log in development mode to avoid console spam
        if (process.env.NODE_ENV === 'development') {
          // Parse the error message to extract key info if available
          const errorMessage = error.message || '';
          if (errorMessage && !errorMessage.includes('undefined')) {
            console.warn('Missing translation:', errorMessage, { locale });
          }
        }
      } else {
        // Only log other translation errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Translation error:', error.message || error, { locale });
        }
      }
    },

    // Best practice: Provide fallbacks for missing messages  
    getMessageFallback({namespace, key, error}) {
      // Handle undefined or invalid keys gracefully
      if (!key || typeof key !== 'string' || key.trim() === '') {
        return ''; // Return empty string for undefined/invalid keys
      }
      
      const path = [namespace, key].filter((part) => part != null && part !== '').join('.');
      
      // Enhanced fallback strategy based on next-intl best practices
      if (error?.code === IntlErrorCode.MISSING_MESSAGE) {
        // Provide meaningful fallbacks for critical UI elements
        const fallbackMap: Record<string, string> = {};
        
        // Return fallback if available, empty string to hide placeholder during SSG
        return fallbackMap[key] || fallbackMap[path] || '';
      }
      
      // For other errors, return empty string to avoid showing broken translations
      return '';
    }
  };
});