import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Shared Types
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'guest' | 'user' | 'admin' | 'enterprise';
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface DashboardSettings {
  layout: 'grid' | 'list';
  widgets: string[];
  refreshInterval: number;
}

// Business Module Data Types
export interface FinancialData {
  revenue: number;
  expenses: number;
  profit: number;
  budget: number;
  lastUpdated: Date;
}

export interface InventoryData {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  lastUpdated: Date;
}

export interface OrderData {
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  lastUpdated: Date;
}

export interface ProjectData {
  activeProjects: number;
  completedProjects: number;
  overdueTasks: number;
  lastUpdated: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  lastChecked: Date;
}

// Main Application State
interface AppState {
  // User & Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Cross-Module Data
  financial: FinancialData | null;
  inventory: InventoryData | null;
  orders: OrderData | null;
  projects: ProjectData | null;
  systemHealth: SystemHealth | null;

  // UI State
  sidebarOpen: boolean;
  activeModule: string | null;
  notifications: Notification[];
  searchQuery: string;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;

  updateFinancial: (data: FinancialData) => void;
  updateInventory: (data: InventoryData) => void;
  updateOrders: (data: OrderData) => void;
  updateProjects: (data: ProjectData) => void;
  updateSystemHealth: (data: SystemHealth) => void;

  setSidebarOpen: (open: boolean) => void;
  setActiveModule: (module: string | null) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setSearchQuery: (query: string) => void;

  // Data synchronization
  syncModuleData: (module: string) => Promise<void>;
  syncAllData: () => Promise<void>;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Initial State
    user: null,
    isAuthenticated: false,
    isLoading: false,

    financial: null,
    inventory: null,
    orders: null,
    projects: null,
    systemHealth: null,

    sidebarOpen: false,
    activeModule: null,
    notifications: [],
    searchQuery: '',

    // Auth Actions
    setUser: (user) => set({ user }),
    setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
    setLoading: (loading) => set({ isLoading: loading }),

    // Module Data Actions
    updateFinancial: (data) => set({ financial: data }),
    updateInventory: (data) => set({ inventory: data }),
    updateOrders: (data) => set({ orders: data }),
    updateProjects: (data) => set({ projects: data }),
    updateSystemHealth: (data) => set({ systemHealth: data }),

    // UI Actions
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setActiveModule: (module) => set({ activeModule: module }),
    addNotification: (notification) =>
      set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50) // Keep last 50
      })),
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
    setSearchQuery: (query) => set({ searchQuery: query }),

    // Data Synchronization
    syncModuleData: async (module) => {
      const { updateFinancial, updateInventory, updateOrders, updateProjects, updateSystemHealth } = get();

      try {
        switch (module) {
          case 'financial':
            const financialRes = await fetch('/api/financial?sync=true');
            const financialData = await financialRes.json();
            if (financialData.success) {
              updateFinancial(financialData.data);
            }
            break;

          case 'inventory':
            const inventoryRes = await fetch('/api/supply-chain/inventory?sync=true');
            const inventoryData = await inventoryRes.json();
            if (inventoryData.success) {
              updateInventory(inventoryData.data);
            }
            break;

          case 'orders':
            const ordersRes = await fetch('/api/shop/orders?sync=true');
            const ordersData = await ordersRes.json();
            if (ordersData.success) {
              updateOrders(ordersData.data);
            }
            break;

          case 'projects':
            const projectsRes = await fetch('/api/projects?sync=true');
            const projectsData = await projectsRes.json();
            if (projectsData.success) {
              updateProjects(projectsData.data);
            }
            break;

          case 'system':
            const systemRes = await fetch('/api/health?sync=true');
            const systemData = await systemRes.json();
            if (systemData.success) {
              updateSystemHealth(systemData.data);
            }
            break;
        }
      } catch (error) {
        console.error(`Failed to sync ${module} data:`, error);
        // Add error notification
        get().addNotification({
          id: `sync-error-${Date.now()}`,
          type: 'error',
          title: 'Sync Failed',
          message: `Failed to sync ${module} data. Please try again.`,
          timestamp: new Date(),
          read: false
        });
      }
    },

    syncAllData: async () => {
      const modules = ['financial', 'inventory', 'orders', 'projects', 'system'];
      await Promise.all(modules.map(module => get().syncModuleData(module)));
    }
  }))
);

// Selectors for optimized re-renders
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAppStore((state) => state.isLoading);

export const useFinancialData = () => useAppStore((state) => state.financial);
export const useInventoryData = () => useAppStore((state) => state.inventory);
export const useOrdersData = () => useAppStore((state) => state.orders);
export const useProjectsData = () => useAppStore((state) => state.projects);
export const useSystemHealth = () => useAppStore((state) => state.systemHealth);

export const useNotifications = () => useAppStore((state) => state.notifications);
export const useSidebarOpen = () => useAppStore((state) => state.sidebarOpen);
export const useActiveModule = () => useAppStore((state) => state.activeModule);

// Action selectors
export const useAppActions = () => useAppStore((state) => ({
  setUser: state.setUser,
  setAuthenticated: state.setAuthenticated,
  setLoading: state.setLoading,
  updateFinancial: state.updateFinancial,
  updateInventory: state.updateInventory,
  updateOrders: state.updateOrders,
  updateProjects: state.updateProjects,
  updateSystemHealth: state.updateSystemHealth,
  setSidebarOpen: state.setSidebarOpen,
  setActiveModule: state.setActiveModule,
  addNotification: state.addNotification,
  removeNotification: state.removeNotification,
  setSearchQuery: state.setSearchQuery,
  syncModuleData: state.syncModuleData,
  syncAllData: state.syncAllData,
}));