export const API_URL = 'http://localhost:3000';

export const api = {
  post: async (endpoint: string, body: any) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return response;
  },

  postFormData: async (endpoint: string, formData: FormData) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    
    // When sending FormData, DO NOT set Content-Type header.
    // fetch will automatically set it to multipart/form-data with the correct boundary.
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return response;
  },
  
  patch: async (endpoint: string, body: any) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    return response;
  },

  get: async (endpoint: string) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return response;
  },

  fetchMenuItems: async () => {
    const response = await api.get("/items");
    
    if (!response.ok) {
      throw new Error('Erro ao buscar o cardapio');
    }
    
    const res = await response.json();

    const groupedData: Record<string, any[]> = {};

    for (const item of res.data) {
      const categoryName = item.category.name;

      if (!groupedData[categoryName]) {
        groupedData[categoryName] = [];
      }
      
      groupedData[categoryName].push(item);
    }

    return Object.entries(groupedData).map(([categoryName, items]) => ({
      categoryName,
      items
    }));
  },

  fetchCategories: async () => {
    const response = await api.get("/categories");
    if (!response.ok) {
      throw new Error('Erro ao buscar as categorias');
    }
    const res = await response.json();
    return res.data || res;
  },

  createCategory: async (name: string) => {
    const response = await api.post("/categories", { name });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Erro ao criar categoria');
    }
    const res = await response.json();
    return res.data || res;
  },

  fetchMyRestaurant: async () => {
    const response = await api.get("/restaurants");
    if (!response.ok) {
      throw new Error('Erro ao buscar o restaurante');
    }
    const res = await response.json();
    return res.data || res;
  },

  updateMyRestaurant: async (data: any) => {
    const response = await api.patch("/restaurants", data);
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Erro ao atualizar o restaurante');
    }
    const res = await response.json();
    return res.data || res;
  },

  updateLinktree: async (data: any) => {
    const response = await api.patch("/restaurants/links", data);
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Erro ao atualizar o linktree');
    }
    const res = await response.json();
    return res.data || res;
  },

  fetchLinktree: async () => {
    const response = await api.get("/restaurants/links");
    if (!response.ok) {
      throw new Error('Erro ao buscar o linktree');
    }
    const res = await response.json();
    return res.data || res;
  },


  fetchStockItems: async () => {
    const response = await api.get("/stock");
    if (!response.ok) {
      throw new Error('Erro ao buscar o estoque');
    }
    const res = await response.json();
    return res.data || res;
  },

  createStockItem: async (data: any) => {
    const response = await api.post("/stock", data);
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Erro ao criar item de estoque');
    }
    const res = await response.json();
    return res.data || res;
  },

  createOrder: async (payload: any) => {
    const response = await api.post("/orders", payload);
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Erro ao criar pedido');
    }
    return response.json();
  },

  fetchOrders: async (page: number = 1, includeDelivered: boolean = false) => {
    const response = await api.get(`/orders?page=${page}&includeDelivered=${includeDelivered}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar pedidos');
    }
    const res = await response.json();
    return res;
  },

  fetchOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar detalhes do pedido');
    }
    const res = await response.json();
    return res.data || res;
  },

  fetchOrdersDashboard: async (daysAgo: number = 7) => {
    const response = await api.get(`/orders/dashboard?days-ago=${daysAgo}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do dashboard de pedidos');
    }
    return response.json();
  },

  fetchFinanceDashboard: async (daysAgo: number = 7) => {
    const response = await api.get(`/finance/dashboard?days-ago=${daysAgo}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar dados do dashboard de financas');
    }
    return response.json();
  },

  fetchFinanceOverview: async () => {
    const response = await api.get('/finance');
    if (!response.ok) {
      throw new Error('Erro ao buscar visão geral financeira');
    }
    const res = await response.json();
    return res.data || res;
  },

  createTransaction: async (data: any) => {
    const response = await api.post('/finance', data);
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Erro ao criar transação');
    }
    const res = await response.json();
    return res.data || res;
  },

  updateOrderStatus: async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || 'Erro ao atualizar status do pedido');
    }
    return response.json();
  }
};
