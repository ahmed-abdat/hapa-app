"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  X,
  FileText,
  Sparkles,
  History,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useDebounce } from "@/utilities/useDebounce";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { type Locale } from "@/utilities/locale";
import { cn } from "@/utilities/ui";
import { quickSearch, type QuickSearchResult } from "@/app/actions/search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchProps {
  initialValue?: string;
  showQuickResults?: boolean;
  variant?: "default" | "hero" | "compact";
}

export const Search: React.FC<SearchProps> = ({
  initialValue = "",
  showQuickResults = false,
  variant = "default",
}) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quickResults, setQuickResults] = useState<QuickSearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [liveMessage, setLiveMessage] = useState<string>("");
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [hasError, setHasError] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initializedFromUrl = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as Locale) || "fr";
  const isRtl = locale === "ar";
  const t = useTranslations();

  const debouncedValue = useDebounce(value, 300);

  // Load search history and popular terms from URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const history = urlParams.get("history");
      if (history) {
        try {
          const decoded = decodeURIComponent(history);
          const historyArray = decoded.split(",").filter(Boolean).slice(0, 5);
          setSearchHistory(historyArray);
        } catch (error) {
          // Failed to parse search history from URL
        }
      }
    }
  }, [locale]);

  // Load initial value from URL (only once on mount)
  useEffect(() => {
    if (typeof window !== "undefined" && !initializedFromUrl.current) {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("q");
      if (query) {
        setValue(decodeURIComponent(query));
      }
      initializedFromUrl.current = true;
    }
  }, []); // Empty dependency array is correct - we only want this to run once

  // Update URL with search query (only for search page)
  useEffect(() => {
    if (pathname === "/search" && debouncedValue !== initialValue) {
      const historyParam =
        searchHistory.length > 0
          ? `&history=${encodeURIComponent(searchHistory.join(","))}`
          : "";
      router.push(
        `/search${
          debouncedValue
            ? `?q=${encodeURIComponent(debouncedValue)}${historyParam}`
            : ""
        }`
      );
    }
  }, [debouncedValue, router, pathname, searchHistory, initialValue]);

  // Quick search functionality using server actions
  useEffect(() => {
    if (showQuickResults && debouncedValue.length > 2) {
      setIsLoading(true);
      setHasError(false);
      setSelectedIndex(-1);

      // Announce search start
      setLiveMessage(
        locale === "fr"
          ? `Recherche de "${debouncedValue}"...`
          : `البحث عن "${debouncedValue}"...`
      );

      const controller = new AbortController();

      const performQuickSearch = async () => {
        try {
          const results = await quickSearch(debouncedValue, locale);

          if (!controller.signal.aborted) {
            setQuickResults(results);
            setIsLoading(false);
            setHasError(false);

            // Announce results
            const count = results.length;
            setLiveMessage(
              locale === "fr"
                ? count === 0
                  ? "Aucun résultat trouvé"
                  : count === 1
                  ? "1 résultat trouvé"
                  : `${count} résultats trouvés`
                : count === 0
                ? "لم يتم العثور على نتائج"
                : count === 1
                ? "تم العثور على نتيجة واحدة"
                : `تم العثور على ${count} نتائج`
            );
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            setQuickResults([]);
            setIsLoading(false);
            setHasError(true);

            // Announce error
            setLiveMessage(
              locale === "fr"
                ? "Erreur lors de la recherche. Veuillez réessayer."
                : "خطأ في البحث. يرجى المحاولة مرة أخرى."
            );
          }
        }
      };

      performQuickSearch();

      return () => {
        controller.abort();
        setIsLoading(false);
      };
    } else {
      setQuickResults([]);
      setIsLoading(false);
      setSelectedIndex(-1);
      if (debouncedValue.length <= 2 && debouncedValue.length > 0) {
        setLiveMessage(
          locale === "fr"
            ? "Tapez au moins 3 caractères pour rechercher"
            : "اكتب 3 أحرف على الأقل للبحث"
        );
      } else {
        setLiveMessage("");
      }
    }
  }, [debouncedValue, showQuickResults, locale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      // Add to search history (URL-based)
      const newHistory = [
        value.trim(),
        ...searchHistory.filter((h) => h !== value.trim()),
      ].slice(0, 5);
      setSearchHistory(newHistory);

      // Navigate with search query and history
      const historyParam =
        newHistory.length > 0
          ? `&history=${encodeURIComponent(newHistory.join(","))}`
          : "";
      router.push(
        `/search?q=${encodeURIComponent(value.trim())}${historyParam}`
      );

      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setValue("");
    setHasError(false);
    setRetryCount(0);
    inputRef.current?.focus();
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount((prev) => prev + 1);
      setHasError(false);
      // Trigger search again with current value
      setValue(value + " "); // Force re-trigger
      setTimeout(() => setValue(value), 10);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems =
      quickResults.length +
      (searchHistory.length > 0 && !value
        ? searchHistory.slice(0, 3).length
        : 0);

    switch (e.key) {
      case "Escape":
        setIsFocused(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;

      case "ArrowDown":
        e.preventDefault();
        if (totalItems > 0) {
          const nextIndex =
            selectedIndex < totalItems - 1 ? selectedIndex + 1 : 0;
          setSelectedIndex(nextIndex);

          // Announce selection for screen readers
          const item = getItemAtIndex(nextIndex);
          if (item) {
            setLiveMessage(
              locale === "fr" ? `Navigation : ${item}` : `التنقل: ${item}`
            );
          }
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (totalItems > 0) {
          const prevIndex =
            selectedIndex > 0 ? selectedIndex - 1 : totalItems - 1;
          setSelectedIndex(prevIndex);

          // Announce selection for screen readers
          const item = getItemAtIndex(prevIndex);
          if (item) {
            setLiveMessage(
              locale === "fr" ? `Navigation : ${item}` : `التنقل: ${item}`
            );
          }
        }
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < totalItems) {
          const item = getItemAtIndex(selectedIndex);
          if (item) {
            handleSuggestionClick(item);
          }
        } else if (value.trim()) {
          // Submit current value if no item selected
          handleSubmit(e);
        }
        break;

      case "Tab":
        // Allow default tab behavior but reset selection
        setSelectedIndex(-1);
        break;
    }
  };

  // Helper function to get item at specific index
  const getItemAtIndex = (index: number): string | null => {
    if (quickResults.length > 0) {
      if (index < quickResults.length) {
        return quickResults[index].title;
      }
    } else if (searchHistory.length > 0 && !value) {
      const historyItems = searchHistory.slice(0, 3);
      if (index < historyItems.length) {
        return historyItems[index];
      }
    }
    return null;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    const newHistory = [
      suggestion,
      ...searchHistory.filter((h) => h !== suggestion),
    ].slice(0, 5);
    setSearchHistory(newHistory);
    const historyParam =
      newHistory.length > 0
        ? `&history=${encodeURIComponent(newHistory.join(","))}`
        : "";
    router.push(`/search?q=${encodeURIComponent(suggestion)}${historyParam}`);
  };

  // Variant-specific styles - optimized for alignment and touch targets
  const getVariantStyles = () => {
    switch (variant) {
      case "hero":
        return {
          container: "w-full max-w-2xl mx-auto",
          input:
            "h-14 text-lg px-6 pl-14 pr-14 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg text-gray-900 rounded-full transition-all duration-200 touch-manipulation",
          icon: "w-5 h-5 left-5",
          clearBtn: "right-4",
          clearBtnIcon: "w-4 h-4",
        };
      case "compact":
        return {
          container: "w-full max-w-md",
          input:
            "h-12 text-sm px-4 pl-12 pr-12 bg-white border border-gray-200 rounded-full transition-all duration-200 touch-manipulation",
          icon: "w-4 h-4 left-4",
          clearBtn: "right-3",
          clearBtnIcon: "w-3 h-3",
        };
      default:
        return {
          container: "w-full max-w-lg mx-auto",
          input:
            "h-12 text-base px-5 pl-12 pr-12 bg-white border border-gray-200 shadow-sm rounded-full transition-all duration-200 touch-manipulation",
          icon: "w-4 h-4 left-4",
          clearBtn: "right-3",
          clearBtnIcon: "w-3 h-3",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={cn("relative", styles.container)}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Single relative container for input and all buttons */}
        <div className="relative w-full">
          {/* Search Icon - positioned absolutely */}
          <SearchIcon
            className={cn(
              "absolute top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 z-10",
              styles.icon,
              "text-gray-500",
              isFocused && "text-primary",
              isRtl && "right-5 left-auto"
            )}
          />

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            className={cn(
              "w-full transition-all duration-200 focus:outline-none",
              "placeholder:text-gray-400 placeholder:transition-opacity",
              styles.input,
              // Enhanced focus management with better visual indicators
              isFocused
                ? "shadow-lg border-primary ring-2 ring-primary/20 placeholder:opacity-75"
                : "border-gray-200 hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-primary/20",
              // High contrast mode support
              "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              // RTL support - adjust padding and text alignment
              isRtl && "text-right pl-14 pr-4 font-medium"
            )}
            aria-label={t("searchPlaceholder")}
            role="combobox"
            aria-expanded={
              isFocused && (quickResults.length > 0 || searchHistory.length > 0)
            }
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-controls={isFocused ? "search-suggestions" : undefined}
            aria-activedescendant={
              selectedIndex >= 0
                ? `search-suggestion-${selectedIndex}`
                : undefined
            }
          />

          {/* Loading Indicator - positioned inside same container */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 pointer-events-none z-10",
                  // Position inside the rounded borders using variant-specific positioning
                  isRtl ? "left-4" : styles.clearBtn
                )}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className={cn(
                    "border-2 border-primary/30 border-t-primary rounded-full",
                    variant === "hero"
                      ? "w-5 h-5"
                      : variant === "compact"
                      ? "w-3 h-3"
                      : "w-4 h-4"
                  )}
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${
                      variant === "hero"
                        ? "hsl(var(--primary))"
                        : "hsl(var(--primary))"
                    })`,
                    maskImage:
                      "radial-gradient(circle, transparent 30%, black 30%)",
                    WebkitMaskImage:
                      "radial-gradient(circle, transparent 30%, black 30%)",
                  }}
                  aria-label={
                    locale === "fr" ? "Chargement..." : "جاري التحميل..."
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear Button - positioned absolutely in same container as input */}
          <AnimatePresence>
            {value && !isLoading && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={handleClear}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 z-10",
                  "h-8 w-8 rounded-full",
                  "flex items-center justify-center",
                  "text-gray-400 hover:text-gray-600",
                  "hover:bg-gray-100/70",
                  "transition-colors duration-150",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  // Position inside the rounded borders using variant-specific positioning
                  isRtl ? "left-4" : styles.clearBtn
                )}
                aria-label={
                  locale === "fr" ? "Effacer la recherche" : "مسح البحث"
                }
                tabIndex={0}
              >
                <X className={styles.clearBtnIcon} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* ARIA Live Region for Screen Reader Announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
        aria-label={locale === "fr" ? "Statut de la recherche" : "حالة البحث"}
      >
        {liveMessage}
      </div>

      {/* Quick Results Dropdown - Enhanced UX */}
      <AnimatePresence>
        {showQuickResults &&
          isFocused &&
          (quickResults.length > 0 || isLoading || hasError) && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] backdrop-blur-sm"
              role="listbox"
              id="search-suggestions"
              aria-label={
                locale === "fr" ? "Suggestions de recherche" : "اقتراحات البحث"
              }
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsFocused(false);
                  setSelectedIndex(-1);
                  inputRef.current?.focus();
                }
              }}
            >
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <span className="text-sm font-medium">{t("loading")}</span>
                  </motion.div>
                </div>
              ) : hasError ? (
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {locale === "fr"
                          ? "Erreur de recherche"
                          : "خطأ في البحث"}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {locale === "fr"
                          ? "Impossible de charger les résultats"
                          : "تعذر تحميل النتائج"}
                      </p>
                      {retryCount < 3 && (
                        <button
                          onClick={handleRetry}
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-3 text-xs font-medium",
                            "text-primary hover:text-primary/80 transition-all duration-200",
                            "border border-primary/20 rounded-lg hover:bg-primary/5",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20",
                            "min-h-[44px] touch-manipulation", // Enhanced mobile touch target
                            "active:scale-95 active:transition-transform active:duration-75" // Touch feedback
                          )}
                        >
                          <RefreshCw className="w-3 h-3" />
                          {locale === "fr" ? "Réessayer" : "إعادة المحاولة"}
                        </button>
                      )}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {quickResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      id={`search-suggestion-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: index * 0.02,
                        duration: 0.2,
                      }}
                      className={cn(
                        "p-4 cursor-pointer border-b border-gray-50 last:border-b-0 flex items-start gap-4",
                        "transition-colors duration-150 group focus-within:bg-gray-50",
                        "min-h-[48px] touch-manipulation", // Enhanced mobile touch target
                        selectedIndex === index
                          ? "bg-primary/10 border-primary/20"
                          : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-25 active:bg-gray-100"
                      )}
                      onClick={() => handleSuggestionClick(result.title)}
                      role="option"
                      aria-selected={selectedIndex === index}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSuggestionClick(result.title);
                        }
                      }}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-medium text-gray-900 truncate",
                            "group-hover:text-primary transition-colors",
                            isRtl && "text-right"
                          )}
                        >
                          {result.title}
                        </p>
                        {result.excerpt && (
                          <p
                            className={cn(
                              "text-xs text-gray-500 mt-1 line-clamp-2",
                              isRtl && "text-right"
                            )}
                          >
                            {result.excerpt}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      {/* Search History & Suggestions - Enhanced Design */}
      <AnimatePresence>
        {isFocused &&
          !value &&
          variant !== "compact" &&
          searchHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[9998] backdrop-blur-sm"
              role="listbox"
              id="search-suggestions"
              aria-label={
                locale === "fr" ? "Recherches récentes" : "عمليات البحث الأخيرة"
              }
            >
              {/* Search History */}
              <div className="p-5">
                <h4
                  className={cn(
                    "text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2",
                    isRtl && "flex-row-reverse text-right"
                  )}
                >
                  <div className="w-5 h-5 bg-primary/10 rounded-md flex items-center justify-center">
                    <History className="w-3 h-3 text-primary" />
                  </div>
                  {t("recentSearches")}
                </h4>
                <div className="space-y-1">
                  {searchHistory.slice(0, 3).map((query, index) => (
                    <motion.button
                      key={index}
                      id={`search-suggestion-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02, duration: 0.15 }}
                      onClick={() => handleSuggestionClick(query)}
                      className={cn(
                        "w-full px-3 py-3 text-sm text-gray-700 rounded-xl transition-colors duration-150",
                        "group focus:outline-none focus:ring-2 focus:ring-primary/20",
                        "border border-transparent min-h-[44px] touch-manipulation", // Enhanced mobile touch target
                        selectedIndex === index
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-25 hover:border-gray-100 active:bg-gray-100",
                        isRtl ? "text-right" : "text-left"
                      )}
                      role="option"
                      aria-selected={selectedIndex === index}
                      tabIndex={0}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                          <SearchIcon className="w-3 h-3 text-gray-500 group-hover:text-primary" />
                        </div>
                        <span className="truncate font-medium group-hover:text-primary transition-colors">
                          {query}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
};
