import { create } from "zustand";

interface SearchResult {
  products: any[];
  categories: any[];
  brands: any[];
  timeTakenMs: number;
}

interface GlobalSearchState {
  isOpen: boolean;
  query: string;
  results: SearchResult;
  isLoading: boolean;
  error: string | null;
  selectedIndex: number;
  openSearch: () => void;
  closeSearch: () => void;
  setQuery: (q: string) => void;
  setResults: (results: SearchResult) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedIndex: (index: number) => void;
  moveSelection: (direction: "up" | "down", maxIndex: number) => void;
}

export const useGlobalSearchStore = create<GlobalSearchState>((set, get) => ({
  isOpen: false,
  query: "",
  results: { products: [], categories: [], brands: [], timeTakenMs: 0 },
  isLoading: false,
  error: null,
  selectedIndex: -1,

  openSearch: () => set({ isOpen: true, selectedIndex: -1 }),

  closeSearch: () =>
    set({
      isOpen: false,
      query: "",
      results: { products: [], categories: [], brands: [], timeTakenMs: 0 },
      selectedIndex: -1,
    }),

  setQuery: (query) => set({ query }),

  setResults: (results) => set({ results, selectedIndex: -1 }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),

  moveSelection: (direction, maxIndex) => {
    const { selectedIndex } = get();
    if (direction === "down") {
      set({ selectedIndex: selectedIndex < maxIndex ? selectedIndex + 1 : 0 });
    } else {
      set({ selectedIndex: selectedIndex > 0 ? selectedIndex - 1 : maxIndex });
    }
  },
}));
