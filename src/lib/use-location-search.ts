"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";

export type LocationResult = {
  city: string;
  state: string;
};

export function useLocationSearch() {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const searchLocations = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await api<LocationResult[]>(
        `/portal/locations?q=${encodeURIComponent(query.trim())}`,
      );
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    results,
    loading,
    searchLocations,
    clearResults,
  };
}
