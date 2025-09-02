import axios from 'axios';
import { Client, Account, Organization, Warehouse, PriceType, Product, Order } from '../types';

const BASE_URL = 'https://app.tablecrm.com/api/v1';

class TableCRMApi {
  private token: string = '';

  setToken(token: string) {
    this.token = token;
  }

  private getUrl(endpoint: string) {
    return `${BASE_URL}${endpoint}?token=${this.token}`;
  }

  async searchClient(phone: string): Promise<Client[]> {
    try {
      const response = await axios.get(this.getUrl(`/clients/search`), {
        params: { phone }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching client:', error);
      return [];
    }
  }

  async getAccounts(): Promise<Account[]> {
    try {
      const response = await axios.get(this.getUrl('/accounts'));
      return response.data;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  }

  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await axios.get(this.getUrl('/organizations'));
      return response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  }

  async getWarehouses(): Promise<Warehouse[]> {
    try {
      const response = await axios.get(this.getUrl('/warehouses'));
      return response.data;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      return [];
    }
  }

  async getPriceTypes(): Promise<PriceType[]> {
    try {
      const response = await axios.get(this.getUrl('/price_types'));
      return response.data;
    } catch (error) {
      console.error('Error fetching price types:', error);
      return [];
    }
  }

  async searchProducts(query: string): Promise<Product[]> {
    try {
      const response = await axios.get(this.getUrl('/products/search'), {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async createSale(order: Order, conduct: boolean = false): Promise<any> {
    try {
      const payload = this.buildSalePayload(order);
      const endpoint = conduct ? '/docs_sales/conduct' : '/docs_sales';
      const response = await axios.post(this.getUrl(endpoint), payload);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  private buildSalePayload(order: Order) {
    return {
      client_id: order.client.id,
      account_id: order.account.id,
      organization_id: order.organization.id,
      warehouse_id: order.warehouse.id,
      price_type_id: order.priceType.id,
      items: order.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        total: item.total
      })),
      total: order.total,
      discount: order.discount || 0,
      comment: order.comment || ''
    };
  }
}

export default new TableCRMApi();