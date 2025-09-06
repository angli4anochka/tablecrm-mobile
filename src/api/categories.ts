import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface Category {
  id: number;
  key?: number;
  name: string;
  parent: number | null;
  description: string | null;
  code: string | null;
  status: boolean;
  nom_count?: number;
  children?: Category[];
  expanded_flag?: boolean;
}

class CategoriesApi {
  private token: string = '';
  private categoriesTree: Category[] = [];
  private productsCache: Map<number, any[]> = new Map();
  
  setToken(token: string) {
    this.token = token;
  }
  
  private getUrl(endpoint: string, params: string = '') {
    const baseUrl = API_CONFIG.BASE_URL;
    const formattedEndpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
    return `${baseUrl}${formattedEndpoint}?token=${this.token}${params ? '&' + params : ''}`;
  }
  
  async getCategoriesTree(): Promise<Category[]> {
    try {
      const url = this.getUrl('/categories_tree');
      const response = await axios.get(url);
      
      const data = response.data?.result || response.data || [];
      if (Array.isArray(data)) {
        this.categoriesTree = this.mapCategoryTree(data);
        return this.categoriesTree;
      }
      return [];
    } catch (error) {
      console.error('Error fetching categories tree:', error);
      return [];
    }
  }
  
  private mapCategoryTree(data: any[]): Category[] {
    return data.map(cat => ({
      id: cat.key || cat.id,
      key: cat.key,
      name: cat.name,
      parent: cat.parent,
      description: cat.description,
      code: cat.code,
      status: cat.status,
      nom_count: cat.nom_count || 0,
      children: cat.children ? this.mapCategoryTree(cat.children) : [],
      expanded_flag: cat.expanded_flag || false
    }));
  }
  
  async getCategories(): Promise<Category[]> {
    if (this.categoriesTree.length === 0) {
      await this.getCategoriesTree();
    }
    return this.flattenCategories(this.categoriesTree);
  }
  
  private flattenCategories(categories: Category[], result: Category[] = []): Category[] {
    for (const cat of categories) {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        this.flattenCategories(cat.children, result);
      }
    }
    return result;
  }
  
  async getCategoryProducts(categoryId: number): Promise<any[]> {
    try {
      if (this.productsCache.has(categoryId)) {
        return this.productsCache.get(categoryId) || [];
      }
      
      const url = this.getUrl('/nomenclatures');
      
      const response = await axios.post(url, [categoryId], {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const products = response.data?.result || response.data || [];
      
      this.productsCache.set(categoryId, products);
      
      return products;
    } catch (error) {
      console.error('Error fetching category products:', error);
      return [];
    }
  }
  
  buildCategoryTree(categories: Category[]): Category[] {
    return this.categoriesTree;
  }
}

export default new CategoriesApi();