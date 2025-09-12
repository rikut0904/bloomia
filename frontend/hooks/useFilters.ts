import { useState, useEffect } from 'react';

interface FilterState {
  [key: string]: string;
}

interface UseFiltersOptions {
  initialFilters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
  debounceMs?: number;
}

export function useFilters(options: UseFiltersOptions = {}) {
  const { initialFilters = {}, onFilterChange, debounceMs = 300 } = options;
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    if (!onFilterChange) return;

    const timeoutId = setTimeout(() => {
      onFilterChange(filters);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange, debounceMs]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const resetFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    resetFilter,
    setFilters
  };
}