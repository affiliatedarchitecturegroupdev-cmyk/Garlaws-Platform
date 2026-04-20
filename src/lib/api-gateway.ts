// Centralized API Gateway for cross-module communication
import { useAppStore } from '@/lib/store/app-store';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

class ApiGateway {
  private baseUrl = '/api';
  private defaultTimeout = 30000; // 30 seconds

  // Generic API call method
  private async makeRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout
    } = options;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Financial Module APIs
  async getFinancialOverview(timeframe: string = 'month'): Promise<ApiResponse> {
    return this.makeRequest(`/financial?timeframe=${timeframe}`);
  }

  async updateFinancialBudget(budgetData: any): Promise<ApiResponse> {
    return this.makeRequest('/financial/budget', {
      method: 'PUT',
      body: budgetData
    });
  }

  async getFinancialAnalytics(): Promise<ApiResponse> {
    return this.makeRequest('/financial/analytics');
  }

  // Inventory Module APIs
  async getInventoryStatus(): Promise<ApiResponse> {
    return this.makeRequest('/supply-chain/inventory/status');
  }

  async updateInventoryItem(itemId: string, data: any): Promise<ApiResponse> {
    return this.makeRequest(`/supply-chain/inventory/${itemId}`, {
      method: 'PUT',
      body: data
    });
  }

  async getLowStockAlerts(): Promise<ApiResponse> {
    return this.makeRequest('/supply-chain/inventory/alerts');
  }

  // E-commerce/Order APIs
  async getOrderSummary(): Promise<ApiResponse> {
    return this.makeRequest('/shop/orders/summary');
  }

  async getRecentOrders(limit: number = 10): Promise<ApiResponse> {
    return this.makeRequest(`/shop/orders/recent?limit=${limit}`);
  }

  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse> {
    return this.makeRequest(`/shop/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status }
    });
  }

  // Project Management APIs
  async getProjectOverview(): Promise<ApiResponse> {
    return this.makeRequest('/projects/overview');
  }

  async getActiveProjects(): Promise<ApiResponse> {
    return this.makeRequest('/projects/active');
  }

  async updateProjectStatus(projectId: string, status: string): Promise<ApiResponse> {
    return this.makeRequest(`/projects/${projectId}/status`, {
      method: 'PUT',
      body: { status }
    });
  }

  // CRM APIs
  async getCustomerMetrics(): Promise<ApiResponse> {
    return this.makeRequest('/crm/metrics');
  }

  async getRecentInteractions(): Promise<ApiResponse> {
    return this.makeRequest('/crm/interactions/recent');
  }

  async updateCustomer(customerId: string, data: any): Promise<ApiResponse> {
    return this.makeRequest(`/crm/customers/${customerId}`, {
      method: 'PUT',
      body: data
    });
  }

  // System Health APIs
  async getSystemHealth(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  async getSystemMetrics(): Promise<ApiResponse> {
    return this.makeRequest('/health/metrics');
  }

  async checkServiceStatus(service: string): Promise<ApiResponse> {
    return this.makeRequest(`/health/status/${service}`);
  }

  // Cross-module data synchronization
  async syncAllModules(): Promise<ApiResponse[]> {
    const modules = [
      this.getFinancialOverview(),
      this.getInventoryStatus(),
      this.getOrderSummary(),
      this.getProjectOverview(),
      this.getSystemHealth()
    ];

    return Promise.all(modules);
  }

  // Bulk operations
  async getDashboardData(): Promise<ApiResponse> {
    return this.makeRequest('/dashboard/data');
  }

  async getCrossModuleAnalytics(): Promise<ApiResponse> {
    return this.makeRequest('/analytics/cross-module');
  }

  // Notification APIs
  async getNotifications(): Promise<ApiResponse> {
    return this.makeRequest('/notifications');
  }

  async markNotificationRead(notificationId: string): Promise<ApiResponse> {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async createNotification(notification: any): Promise<ApiResponse> {
    return this.makeRequest('/notifications', {
      method: 'POST',
      body: notification
    });
  }

  // Search across modules
  async searchAllModules(query: string): Promise<ApiResponse> {
    return this.makeRequest(`/search?q=${encodeURIComponent(query)}`);
  }

  async searchModule(module: string, query: string): Promise<ApiResponse> {
    return this.makeRequest(`/${module}/search?q=${encodeURIComponent(query)}`);
  }
}

// Singleton instance
export const apiGateway = new ApiGateway();

// React hook for using API gateway with loading states
export function useApiGateway() {
  const { addNotification } = useAppStore();

  const handleApiCall = async <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    options?: {
      showErrorToast?: boolean;
      successMessage?: string;
    }
  ): Promise<ApiResponse<T>> => {
    const { showErrorToast = true, successMessage } = options || {};

    try {
      const result = await apiCall();

      if (result.success && successMessage) {
        addNotification({
          id: `api-success-${Date.now()}`,
          type: 'success',
          title: 'Success',
          message: successMessage,
          timestamp: new Date(),
          read: false
        });
      } else if (!result.success && showErrorToast) {
        addNotification({
          id: `api-error-${Date.now()}`,
          type: 'error',
          title: 'API Error',
          message: result.error || 'An unexpected error occurred',
          timestamp: new Date(),
          read: false
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (showErrorToast) {
        addNotification({
          id: `api-exception-${Date.now()}`,
          type: 'error',
          title: 'Connection Error',
          message: errorMessage,
          timestamp: new Date(),
          read: false
        });
      }
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  return {
    apiGateway,
    handleApiCall
  };
}