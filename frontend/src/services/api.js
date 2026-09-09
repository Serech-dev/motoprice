const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '') 
  : '/api';

export const api = {
  // Suppliers
  async getSuppliers() {
    const res = await fetch(`${API_BASE}/suppliers/`);
    if (!res.ok) throw new Error('Error al cargar proveedores');
    return res.json();
  },

  async createSupplier(data) {
    const res = await fetch(`${API_BASE}/suppliers/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al crear proveedor');
    }
    return res.json();
  },

  async updateSupplier(id, data) {
    const res = await fetch(`${API_BASE}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

    const res = await fetch(`${API_BASE}/products/?${searchParams.toString()}`);
    if (!res.ok) throw new Error('Error al cargar catálogo de productos');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings/`);
    if (!res.ok) throw new Error('Error al cargar configuración');
    return res.json();
  },

  async updateSettings(data) {
    const res = await fetch(`${API_BASE}/settings/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar configuración');
    return res.json();
  },

  // Price Updates
  async uploadPriceList(formData) {
    const res = await fetch(`${API_BASE}/price-updates/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al procesar archivo de precios');
    }
    return res.json();
  },

  async getBatch(batchId) {
    const res = await fetch(`${API_BASE}/price-updates/${batchId}`);
    if (!res.ok) throw new Error('Error al cargar detalle del lote');
    return res.json();
  },

  async listBatches() {
    const res = await fetch(`${API_BASE}/price-updates/`);
    if (!res.ok) throw new Error('Error al listar lotes');
    return res.json();
  },

  async updateBatchItem(batchId, itemId, data) {
    const res = await fetch(`${API_BASE}/price-updates/${batchId}/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar item');
    return res.json();
  },

  async applyBatch(batchId, selectedItemIds = null) {
    const res = await fetch(`${API_BASE}/price-updates/${batchId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_item_ids: selectedItemIds })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Error al aplicar actualización de precios');
    }
    return res.json();
  },

  getExportUrl(batchId, format = 'xlsx') {
    return `${API_BASE}/price-updates/${batchId}/export?format=${format}`;
  }
};

