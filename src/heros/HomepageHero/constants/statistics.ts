/**
 * Shared statistics data across hero variants
 * Centralized for easy updates
 */
export const HERO_STATISTICS = {
  journalists: {
    value: 450,
    suffix: "+",
    key: "registeredJournalists" as const,
  },
  operators: {
    value: 40,
    suffix: "+", 
    key: "mediaOperators" as const,
  },
  complaints: {
    value: 89,
    suffix: "%",
    key: "complaintsResolved" as const,
  },
} as const;

export type StatisticKey = keyof typeof HERO_STATISTICS;