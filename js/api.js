const API_BASE = 'http://localhost:5000/api';

class API {
  static token() {
    return localStorage.getItem('token');
  }

  static headers(includeAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (includeAuth && this.token()) {
      headers.Authorization = `Bearer ${this.token()}`;
    }
    return headers;
  }

  static async request(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  }

  static register(payload) {
    return this.request('/auth/register', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload)
    });
  }

  static login(payload) {
    return this.request('/auth/login', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload)
    });
  }

  static getMe() {
    return this.request('/auth/me', {
      headers: this.headers(true)
    });
  }

  static updateProfile(payload) {
    return this.request('/auth/me', {
      method: 'PUT',
      headers: this.headers(true),
      body: JSON.stringify(payload)
    });
  }

  static getDashboard() {
    return this.request('/auth/dashboard', {
      headers: this.headers(true)
    });
  }

  static getEntrepreneurs(filters = {}) {
    return this.request(`/marketplace/entrepreneurs?${new URLSearchParams(filters)}`);
  }

  static getEntrepreneur(id) {
    return this.request(`/marketplace/entrepreneurs/${id}`);
  }

  static getProducts(filters = {}) {
    return this.request(`/marketplace/products?${new URLSearchParams(filters)}`);
  }

  static getProduct(id) {
    return this.request(`/marketplace/products/${id}`);
  }

  static getServices(filters = {}) {
    return this.request(`/marketplace/services?${new URLSearchParams(filters)}`);
  }

  static createProduct(payload) {
    return this.request('/entrepreneur/products', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(payload)
    });
  }

  static createService(payload) {
    return this.request('/entrepreneur/services', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(payload)
    });
  }

  static getMyListings() {
    return this.request('/entrepreneur/listings', {
      headers: this.headers(true)
    });
  }

  static createOrder(payload) {
    return this.request('/orders', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(payload)
    });
  }

  static getOrders() {
    return this.request('/orders', {
      headers: this.headers(true)
    });
  }

  static updateOrderStatus(id, status) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      headers: this.headers(true),
      body: JSON.stringify({ status })
    });
  }

  static createServiceRequest(payload) {
    return this.request('/service-requests', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(payload)
    });
  }

  static getServiceRequests() {
    return this.request('/service-requests', {
      headers: this.headers(true)
    });
  }

  static updateServiceRequestStatus(id, status) {
    return this.request(`/service-requests/${id}`, {
      method: 'PUT',
      headers: this.headers(true),
      body: JSON.stringify({ status })
    });
  }

  static createReview(payload) {
    return this.request('/reviews', {
      method: 'POST',
      headers: this.headers(true),
      body: JSON.stringify(payload)
    });
  }

  static getAdminAnalytics() {
    return this.request('/admin/analytics', {
      headers: this.headers(true)
    });
  }

  static getAdminEntrepreneurs() {
    return this.request('/admin/entrepreneurs', {
      headers: this.headers(true)
    });
  }

  static verifyEntrepreneur(id, isVerified) {
    return this.request(`/admin/entrepreneurs/${id}/verify`, {
      method: 'PUT',
      headers: this.headers(true),
      body: JSON.stringify({ isVerified })
    });
  }

  static getAdminOperations() {
    return this.request('/admin/operations', {
      headers: this.headers(true)
    });
  }
}
