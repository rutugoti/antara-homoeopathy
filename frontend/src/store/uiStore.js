import { create } from 'zustand';

const useUiStore = create((set) => ({
  sidebarOpen: true,
  isLoading: false,
  pageTitle: 'Dashboard',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setLoading: (isLoading) => set({ isLoading }),
  setPageTitle: (pageTitle) => set({ pageTitle }),
}));

export default useUiStore;
