// API Base URL from environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// API Service class for handling all backend communication
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  // Get authorization headers
  getAuthHeaders() {
    return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
  }

  // Generic API call method
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders()
    };

    try {
      const response = await fetch(url, {
        headers: defaultHeaders,
        ...options
      });

      if (response.status === 401) {
        // Token expired, redirect to login
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      // Remove console.error, let caller handle error display
      throw error;
    }
  }

  // Authentication methods
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail);
    }

    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('auth_token', this.token);
    return data;
  }

  async register(userData) {
    return this.apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // Items methods
  async getItems(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/items/?${params}`);
  }

  async getItem(itemId) {
    return this.apiCall(`/items/${itemId}`);
  }

  async createItem(itemData) {
    return this.apiCall('/items/', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });
  }

  async updateItem(itemId, itemData) {
    return this.apiCall(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData)
    });
  }

  async deleteItem(itemId) {
    return this.apiCall(`/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  // Categories methods
  async getCategories() {
    return this.apiCall('/categories/');
  }

  async createCategory(categoryData) {
    return this.apiCall('/categories/', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(categoryId, categoryData) {
    return this.apiCall(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(categoryId) {
    return this.apiCall(`/categories/${categoryId}`, {
      method: 'DELETE'
    });
  }

  // Stock methods
  async getStockLevels() {
    return this.apiCall('/stock/levels');
  }

  async createStockMovement(movementData) {
    return this.apiCall('/stock/movement', {
      method: 'POST',
      body: JSON.stringify(movementData)
    });
  }

  async getStockMovements(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/stock/movements?${params}`);
  }

  // Alerts methods
  async getAlerts() {
    return this.apiCall('/alerts/');
  }

  async getAlert(alertId) {
    return this.apiCall(`/alerts/${alertId}`);
  }

  async createAlert(alertData) {
    return this.apiCall('/alerts/', {
      method: 'POST',
      body: JSON.stringify(alertData)
    });
  }

  async updateAlert(alertId, alertData) {
    return this.apiCall(`/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(alertData)
    });
  }

  async deleteAlert(alertId) {
    return this.apiCall(`/alerts/${alertId}`, {
      method: 'DELETE'
    });
  }

  // Payments methods
  async getPayments(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/payments/?${params}`);
  }

  async getPayment(paymentId) {
    return this.apiCall(`/payments/${paymentId}`);
  }

  async createPayment(paymentData) {
    return this.apiCall('/payments/', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async updatePayment(paymentId, paymentData) {
    return this.apiCall(`/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData)
    });
  }

  async deletePayment(paymentId) {
    return this.apiCall(`/payments/${paymentId}`, {
      method: 'DELETE'
    });
  }

  async getTotalDebt(userId = null) {
    const params = userId ? `?user_id=${userId}` : '';
    return this.apiCall(`/payments/summary/debt${params}`);
  }

  async getTotalPaid(userId = null) {
    const params = userId ? `?user_id=${userId}` : '';
    return this.apiCall(`/payments/summary/paid${params}`);
  }

  async checkOverduePayments() {
    return this.apiCall('/payments/check-overdue', {
      method: 'POST'
    });
  }

  // Purchase methods
  async getPurchases(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/purchases/?${params}`);
  }

  async getPurchase(purchaseId) {
    return this.apiCall(`/purchases/${purchaseId}`);
  }

  async createPurchase(purchaseData) {
    return this.apiCall('/purchases/', {
      method: 'POST',
      body: JSON.stringify(purchaseData)
    });
  }

  async updatePurchase(purchaseId, purchaseData) {
    return this.apiCall(`/purchases/${purchaseId}`, {
      method: 'PUT',
      body: JSON.stringify(purchaseData)
    });
  }

  async makePurchasePayment(purchaseId, amount) {
    return this.apiCall(`/purchases/${purchaseId}/pay?amount=${amount}`, {
      method: 'PUT'
    });
  }

  async deletePurchase(purchaseId) {
    return this.apiCall(`/purchases/${purchaseId}`, {
      method: 'DELETE'
    });
  }

  async getPurchaseSummary() {
    return this.apiCall('/purchases/summary');
  }

  // Installment Payment methods
  async getInstallmentPayments(purchaseId) {
    return this.apiCall(`/installment-payments/purchase/${purchaseId}`);
  }

  async createInstallmentPayment(paymentData) {
    return this.apiCall('/installment-payments/', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async deleteInstallmentPayment(paymentId) {
    return this.apiCall(`/installment-payments/${paymentId}`, {
      method: 'DELETE'
    });
  }

  // Sales Invoice methods
  async getSalesInvoices(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/sales-invoices/?${params}`);
  }

  async getSalesInvoice(invoiceId) {
    return this.apiCall(`/sales-invoices/${invoiceId}`);
  }

  async createSalesInvoice(invoiceData) {
    return this.apiCall('/sales-invoices/', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async updateSalesInvoice(invoiceId, invoiceData) {
    return this.apiCall(`/sales-invoices/${invoiceId}`, {
      method: 'PUT',
      body: JSON.stringify(invoiceData)
    });
  }

  async deleteSalesInvoice(invoiceId) {
    return this.apiCall(`/sales-invoices/${invoiceId}`, {
      method: 'DELETE'
    });
  }

  // Installment Sales methods
  async getInstallmentSales(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/installment-sales/?${params}`);
  }

  async getInstallmentSale(saleId) {
    return this.apiCall(`/installment-sales/${saleId}`);
  }

  async createInstallmentSale(saleData) {
    return this.apiCall('/installment-sales/', {
      method: 'POST',
      body: JSON.stringify(saleData)
    });
  }

  async updateInstallmentSale(saleId, saleData) {
    return this.apiCall(`/installment-sales/${saleId}`, {
      method: 'PUT',
      body: JSON.stringify(saleData)
    });
  }

  async deleteInstallmentSale(saleId) {
    return this.apiCall(`/installment-sales/${saleId}`, {
      method: 'DELETE'
    });
  }

  async createInstallmentSalePayment(saleId, paymentData) {
    return this.apiCall(`/installment-sales/${saleId}/payment`, {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  }

  async getInstallmentSalePayments(saleId) {
    return this.apiCall(`/installment-sales/${saleId}/payments`);
  }

  // Barcode scanning method
  async scanBarcode(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const url = `${this.baseURL}/scanning/scan`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(), // Note: Don't set Content-Type for FormData
      body: formData
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Scan failed' }));
      throw new Error(error.detail);
    }

    return await response.json();
  }

  // Logout method
  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }
}

// Create a singleton instance
const apiService = new ApiService();

// Export for use in components
export default apiService;