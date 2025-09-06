import axios, { AxiosError } from 'axios';
import type { Client, Account, Organization, Warehouse, PriceType, Product, Order } from '../types/index';
import { API_CONFIG, getApiUrl } from '../config/api';
import { extractProductsFromOrders, setCachedProducts, searchInCachedProducts } from './extractProducts';
import categoriesApi from './categories';

class TableCRMApi {
  private token: string = '';
  private cachedClients: Client[] = [];
  private clientsCacheLoaded = false;

  setToken(token: string) {
    this.token = token;
    categoriesApi.setToken(token);
  }

  async getIncomeAccounts(): Promise<Account[]> {
    const payboxes = await this.getPayboxes();
    return payboxes.map(acc => ({...acc, type: 'income' as const}));
  }

  private getUrl(endpoint: string, includeToken: boolean = true, addTrailingSlash: boolean = true) {
    const isDev = window.location.hostname === 'localhost';
    const isVercel = window.location.hostname.includes('vercel.app');
    
    const formattedEndpoint = addTrailingSlash 
      ? (endpoint.endsWith('/') ? endpoint : `${endpoint}/`)
      : endpoint;
    
    if (isDev) {
      const tokenParam = includeToken ? `?token=${this.token}` : '';
      return `http://localhost:3001/api/v1${formattedEndpoint}${tokenParam}`;
    }
    
    if (isVercel) {
      const tokenParam = includeToken ? `&token=${this.token}` : '';
      return `/api/proxy?path=${encodeURIComponent(formattedEndpoint)}${tokenParam}`;
    }
    
    const baseUrl = API_CONFIG.BASE_URL;
    const tokenParam = includeToken ? `?token=${this.token}` : '';
    return `${baseUrl}${formattedEndpoint}${tokenParam}`;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  async searchClient(phone: string): Promise<Client[]> {
    if (!this.clientsCacheLoaded) {
      await this.loadAllClients();
    }
    
    if (phone.length < 3) {
      return [];
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    const results = this.cachedClients.filter(client => {
      if (client.phone) {
        const clientPhone = client.phone.replace(/\D/g, '');
        if (clientPhone.includes(cleanPhone) || cleanPhone.includes(clientPhone)) {
          return true;
        }
      }
      
      if (phone.match(/[^\d+\s()-]/)) {
        const searchTerm = phone.toLowerCase();
        if (client.name && client.name.toLowerCase().includes(searchTerm)) {
          return true;
        }
      }
      
      return false;
    });
    
    return results;
  }
  
  private loadingClientsPromise: Promise<void> | null = null;
  
  async loadAllClients(): Promise<void> {
    if (this.loadingClientsPromise) {
      return this.loadingClientsPromise;
    }
    
    if (this.clientsCacheLoaded && this.cachedClients.length > 0) {
      return Promise.resolve();
    }
    
    this.loadingClientsPromise = this.doLoadClients();
    
    try {
      await this.loadingClientsPromise;
    } finally {
      this.loadingClientsPromise = null;
    }
  }
  
  private async doLoadClients(): Promise<void> {
    try {
      const baseUrl = API_CONFIG.BASE_URL;
      const limit = 500;
      let offset = 0;
      let allClients = [];
      let hasMore = true;
      
      while (hasMore) {
        const url = `${baseUrl}/contragents/?token=${this.token}&limit=${limit}&offset=${offset}`;
        
        const response = await axios.get(url, {
          headers: this.getHeaders()
        });
        
        const totalCount = response.data?.count || 0;
        const clientsBatch = response.data?.result || [];
        
        if (Array.isArray(clientsBatch) && clientsBatch.length > 0) {
          allClients = [...allClients, ...clientsBatch];
          offset += clientsBatch.length;
          hasMore = offset < totalCount && clientsBatch.length === limit;
        } else {
          hasMore = false;
        }
        
        if (allClients.length >= 500) {
          hasMore = false;
        }
      }
      
      this.cachedClients = allClients.map((item: any) => {
        let displayName = item.name;
        
        if (!displayName || displayName.trim() === '') {
          if (item.first_name || item.last_name) {
            displayName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
          } else if (item.company) {
            displayName = item.company;
          } else if (item.title) {
            displayName = item.title;
          } else if (item.phone) {
            displayName = `Клиент ${item.phone}`;
          } else {
            displayName = `Клиент #${item.id}`;
          }
        }
        
        return {
          id: item.id?.toString() || item.external_id || '',
          name: displayName,
          phone: item.phone || '',
          email: item.email || '',
          address: item.address || ''
        };
      });
      
      this.clientsCacheLoaded = true;
    } catch (error: any) {
      console.error('Error loading all clients:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      this.cachedClients = [];
      this.clientsCacheLoaded = false;
    }
  }
  
  async getAllClients(): Promise<Client[]> {
    if (!this.clientsCacheLoaded) {
      await this.loadAllClients();
    }
    return this.cachedClients;
  }

  async getPayboxes(): Promise<Account[]> {
    try {
      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/payboxes/?token=${this.token}&limit=100&offset=0`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });
      const data = response.data?.result || response.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        const accounts = data.map((item: any) => ({
          id: item.id || item.code,
          name: item.name || item.title || 'Счет',
          balance: item.balance || item.sum || 0,
          type: 'paybox' as const
        }));
        return accounts;
      }
      return [];
    } catch (error: any) {
      console.error('Payboxes error:', error.message);
      return [];
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    try {
      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/organizations/?token=${this.token}&limit=100&offset=0`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });
      const data = response.data?.result || response.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        const organizations = data.map((item: any) => ({
          id: item.id || item.code,
          name: item.short_name || item.full_name || item.work_name || item.name || item.title || 'Организация',
          inn: item.inn || item.INN || ''
        }));
        return organizations;
      }
      return [];
    } catch (error: any) {
      console.error('Organizations error:', error.message);
      return [];
    }
  }

  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const baseUrl = API_CONFIG.BASE_URL;
      const url = `${baseUrl}/warehouses/?token=${this.token}&limit=100&offset=0`;
      
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });
      const data = response.data?.result || response.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        const warehouses = data.map((item: any) => ({
          id: item.id || item.code,
          name: item.name || item.title || 'Склад',
          address: item.address || item.location || ''
        }));
        return warehouses;
      }
      return [];
    } catch (error: any) {
      console.error('Warehouses error:', error.message);
      return [];
    }
  }

  async getCategories() {
    return categoriesApi.getCategories();
  }

  async getPriceTypes(): Promise<PriceType[]> {
    try {
      const response = await axios.get(this.getUrl('/price_types'), {
        headers: this.getHeaders()
      });
      const data = response.data?.result || response.data || [];
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || item.code,
          name: item.name || item.title,
          coefficient: item.coefficient || item.markup || 1
        }));
      }
      return [];
    } catch (error) {
      console.error('Price types endpoint not available');
      return [];
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    await this.getOrders(30, 0);
    
    const cachedResults = searchInCachedProducts(query);
    if (cachedResults.length > 0) {
      return cachedResults;
    }
    
    return [];
  }

  async createSale(order: Order, conduct: boolean = false): Promise<any> {
    try {
      const payload = this.buildSalePayload(order, conduct);
      
      const payloadArray = [payload];
      
      const endpoint = '/docs_sales';
      const url = this.getUrl(endpoint, true);
      
      const response = await axios.post(url, payloadArray, {
        headers: this.getHeaders()
      });
      
      const responseData = response.data;
      if (Array.isArray(responseData) && responseData.length > 0) {
        return responseData[0];
      }
      return responseData;
    } catch (error: any) {
      console.error('Error creating sale:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  async getOrders(limit: number = 20, offset: number = 0): Promise<any[]> {
    let url = '';
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        const baseUrl = API_CONFIG.BASE_URL;
        url = `${baseUrl}/docs_sales/?token=${this.token}&limit=${limit}&offset=${offset}`;
        
        const response = await axios.get(url, {
          headers: this.getHeaders(),
          timeout: API_CONFIG.TIMEOUT
        });
      const ordersData = response.data;
      let orders = Array.isArray(ordersData) ? ordersData : (ordersData?.result || []);
      
      orders = orders.sort((a: any, b: any) => {
        const dateA = a.created_at || a.dated || 0;
        const dateB = b.created_at || b.dated || 0;
        return dateB - dateA;
      });
      
      if (Array.isArray(orders) && orders.length > 0) {
        const products = extractProductsFromOrders(orders);
        setCachedProducts(products);
      }
      
        return orders;
      } catch (error: any) {
        retryCount++;
        
        if (retryCount > maxRetries) {
      if (error instanceof AxiosError) {
        console.error('Error fetching orders:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
          url: url
        });
        
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
          return [];
        }
        }
          console.error('Error fetching orders:', error);
          return [];
        }
        
        // Ждем перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return [];
  }

  private buildSalePayload(order: Order, conduct: boolean = false) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    
    const clientId = typeof order.client.id === 'string' ? parseInt(order.client.id) : order.client.id;
    const warehouseId = order.warehouse?.id ? (typeof order.warehouse.id === 'string' ? parseInt(order.warehouse.id) : order.warehouse.id) : null;
    const organizationId = order.organization?.id ? (typeof order.organization.id === 'string' ? parseInt(order.organization.id) : order.organization.id) : null;
    const payload: any = {
      dated: currentTimestamp,
      operation: "Заказ",
      contragent: clientId,
      status: conduct,
      paid_doc: order.total || 0,
      paid_rubles: order.total || 0,
      nomenclature_count: order.items.length
    };
    if (organizationId) {
      payload.organization = organizationId;
    }
    if (warehouseId) {
      payload.warehouse = warehouseId;
    }
    if (order.items && order.items.length > 0) {
      payload.goods = order.items.map(item => {
        const nomenclatureId = typeof item.product.id === 'string' ? parseInt(item.product.id) : item.product.id;
        return {
          nomenclature: nomenclatureId,
          quantity: item.quantity,
          price: item.price
        };
      });
    }
    let comment = '';
    
    if (order.additionalParams?.comment) {
      comment = order.additionalParams.comment;
    }
    
    if (order.delivery && order.delivery.enabled) {
      const deliveryInfo = [];
      if (order.delivery.address) {
        deliveryInfo.push(`Адрес: ${order.delivery.address}`);
      }
      if (order.delivery.date) {
        deliveryInfo.push(`Дата: ${order.delivery.date}`);
      }
      if (order.delivery.recipient?.name) {
        deliveryInfo.push(`Получатель: ${order.delivery.recipient.name}`);
      }
      if (order.delivery.recipient?.phone) {
        deliveryInfo.push(`Тел: ${order.delivery.recipient.phone}`);
      }
      
      if (deliveryInfo.length > 0) {
        const deliveryText = `ДОСТАВКА: ${deliveryInfo.join(', ')}`;
        comment = comment ? `${comment}\n${deliveryText}` : deliveryText;
      }
    }
    
    if (comment) {
      payload.comment = comment;
    }
    if (order.additionalParams?.tags && order.additionalParams.tags.length > 0) {
      payload.tags = order.additionalParams.tags.join(',');
    }
    
    return payload;
  }
}

export default new TableCRMApi();