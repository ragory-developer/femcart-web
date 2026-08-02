import { create } from "zustand";

interface NavigationState {
  navbarItems: any[];
  topNavbarItems: any[];
  bottomNavbarItems: any[];
  footerSections: any[];
  categories: any[];
  brands: any[];
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
  brands: [],
  categoriesLoading: false,
  loading: false,
  isHeroCategoryVisible: false,
  setHeroCategoryVisible: (visible) => set({ isHeroCategoryVisible: visible }),
}));
