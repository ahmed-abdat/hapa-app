"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  X,
  FileText,
  Sparkles,
  History,
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
  const inputRef = useRef<HTMLInputElement>(null);
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

      const controller = new AbortController();

      const performQuickSearch = async () => {
        try {
          const results = await quickSearch(debouncedValue, locale);

          if (!controller.signal.aborted) {
            setQuickResults(results);
            setIsLoading(false);
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            // Quick search error
            setQuickResults([]);
            setIsLoading(false);
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
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
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

  // Variant-specific styles - inspired by modern design
  const getVariantStyles = () => {
    switch (variant) {
      case "hero":
        return {
          container: "w-full max-w-2xl mx-auto",
          input:
            "h-14 text-lg px-4 pl-12 pr-12 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-lg text-gray-900 rounded-full",
          icon: "w-5 h-5 left-4",
          clearBtn: "right-4",
        };
      case "compact":
        return {
          container: "w-full max-w-md",
          input:
            "h-10 text-sm px-3 pl-10 pr-10 bg-white border border-gray-200 rounded-full",
          icon: "w-4 h-4 left-3",
          clearBtn: "right-3",
        };
      default:
        return {
          container: "w-full max-w-lg mx-auto",
          input:
            "h-12 text-base px-4 pl-11 pr-11 bg-white border border-gray-200 shadow-sm rounded-full",
          icon: "w-4 h-4 left-4",
          clearBtn: "right-4",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={cn("relative", styles.container)}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Icon */}
        <SearchIcon
          className={cn(
            "absolute top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200",
            styles.icon,
            "text-gray-500",
            isFocused && "text-primary",
            isRtl && "right-4 left-auto"
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
          className={cn(
            "w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "placeholder:text-gray-400",
            styles.input,
            isFocused && "shadow-lg border-primary/30",
            isRtl && "text-right pr-11 pl-11"
          )}
        />

        {/* Clear Button */}
        <AnimatePresence>
          {value && (
            <motion.button
              type="button"
              onClick={handleClear}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center",
                "text-gray-400 hover:text-gray-600 transition-colors duration-200",
                "hover:bg-gray-100/50 rounded-full",
                styles.clearBtn,
                isRtl && "left-4 right-auto"
              )}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "absolute top-1/2 -translate-y-1/2",
                isRtl ? "left-12" : "right-12"
              )}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Quick Results Dropdown */}
      <AnimatePresence>
        {showQuickResults &&
          isFocused &&
          (quickResults.length > 0 || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            >
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    {t("loading")}
                  </motion.div>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {quickResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                      onClick={() => handleSuggestionClick(result.title)}
                    >
                      <div className="flex-shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm text-gray-700 truncate"
                        >
                          {result.title}
                        </p>
                        {result.excerpt && (
                          <p className="text-xs text-gray-500 truncate">
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

      {/* Search History & Suggestions */}
      <AnimatePresence>
        {isFocused && !value && variant !== "compact" && searchHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-40"
          >
            {/* Search History */}
            <div className="p-4">
              <h4
                className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"
              >
                <History className="w-4 h-4 text-gray-500" />
                {t("recentSearches")}
              </h4>
              <div className="space-y-1">
                {searchHistory.slice(0, 3).map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(query)}
                    className="w-full text-left px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                  >
                    <span className="truncate">{query}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
