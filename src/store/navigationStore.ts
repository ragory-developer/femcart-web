import { create } from "zustand";

interface NavigationState {
  navbarItems: any[];
  topNavbarItems: any[];
  bottomNavbarItems: any[];
  footerSections: any[];
  categories: any[];
  categoriesLoading: boolean;
  loading: boolean;
  isHeroCategoryVisible: boolean;
  setHeroCategoryVisible: (visible: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  navbarItems: [],
  topNavbarItems: [],
  bottomNavbarItems: [],
  footerSections: [],
  categories: [],
  categoriesLoading: false,
  loading: false,
  isHeroCategoryVisible: false,
  setHeroCategoryVisible: (visible) => set({ isHeroCategoryVisible: visible }),
}));
