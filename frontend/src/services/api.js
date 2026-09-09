const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : '/api';

export const AUTH_TOKEN_KEY = 'motopriceAuthToken';
export const AUTH_USER_KEY = 'motopriceAuthUser';

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { ...options.headers };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Auto set json content type if body is plain object or stringified json, not FormData
  if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    window.dispatchEvent(new CustomEvent('motoprice:auth-expired'));
  }

  return response;
}

export const api = {
  // Authentication & License
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Error al iniciar sesión' }));
      throw new Error(err.detail || 'Credenciales inválidas');
    }
    const data = await res.json();
    localStorage.setItem(AUTH_TOKEN_KEY, data.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
    return data;
  },

  async getMe() {
    const res = await request('/auth/me');
    if (!res.ok) throw new Error('No autenticado o sesión expirada');
    return res.json();
  },

  async getLicense() {
    const res = await request('/auth/license');
    if (!res.ok) throw new Error('Error al consultar licencia');
    return res.json();
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      window.dispatchEvent(new CustomEvent('motoprice:logout'));
    }
  },

  // Suppliers
  async getSuppliers() {
    const res = await request('/suppliers/');
    if (!res.ok) throw new Error('Error al cargar proveedores');
    return res.json();
  },

  async createSupplier(data) {
    const res = await request('/suppliers/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al crear proveedor');
    }
    return res.json();
  },

  async updateSupplier(id, data) {
    const res = await request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar proveedor');
    return res.json();
  },

  // Products
  async getProducts(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.category) searchParams.append('category', params.category);
    if (params.brand) searchParams.append('brand', params.brand);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.offset) searchParams.append('offset', params.offset);

    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await request(`/products/${qs}`);
    if (!res.ok) throw new Error('Error al cargar catálogo de productos');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await request('/settings/');
    if (!res.ok) throw new Error('Error al cargar configuración');
    return res.json();
  },

  async updateSettings(data) {
    const res = await request('/settings/', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar configuración');
    return res.json();
  },

  // Price Updates
  async uploadPriceList(formData) {
    const res = await request('/price-updates/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al procesar archivo de precios');
    }
    return res.json();
  },

  async getBatch(batchId) {
    const res = await request(`/price-updates/${batchId}`);
    if (!res.ok) throw new Error('Error al cargar detalle del lote');
    return res.json();
  },

  async listBatches() {
    const res = await request('/price-updates/');
    if (!res.ok) throw new Error('Error al listar lotes');
    return res.json();
  },

  async updateBatchItem(batchId, itemId, data) {
    const res = await request(`/price-updates/${batchId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar item');
    return res.json();
  },

  async applyBatch(batchId, selectedItemIds = null) {
    const res = await request(`/price-updates/${batchId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ selected_item_ids: selectedItemIds })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al aplicar actualización de precios');
    }
    return res.json();
  },

  getExportUrl(batchId, format = 'xlsx') {
    return `${API_BASE}/price-updates/${batchId}/export?format=${format}`;
  }
};
