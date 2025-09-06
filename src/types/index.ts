export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface Account {
  id: string;
  name: string;
  balance?: number;
  type?: 'paybox' | 'income' | 'regular';
}

export interface Organization {
  id: string;
  name: string;
  inn?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string;
}

export interface PriceType {
  id: string;
  name: string;
  coefficient?: number;
}

export interface Product {
  id: string;
  name: string;
  article?: string;
  sku?: string;
  price: number;
  stock: number;
  unit?: string;
  imageUrl?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

export interface Order {
  id?: string;
  client: Client;
  account: Account;
  organization: Organization;
  warehouse: Warehouse;
  priceType: PriceType;
  items: OrderItem[];
  total: number;
  discount?: number;
  comment?: string;
  status: 'draft' | 'created' | 'conducted';
  createdAt?: Date;
  incomeAccount?: Account;
  priority?: string;
  delivery?: {
    enabled: boolean;
    address?: string;
    date?: string;
    time?: string;
    cost?: string;
    note?: string;
    recipient?: {
      name?: string;
      phone?: string;
    };
  };
  additionalParams?: {
    number?: string;
    comment?: string;
    contract?: string;
    tags?: string[];
    dealId?: string;
  };
}

export type {
  Client,
  Account,
  Organization,
  Warehouse,
  PriceType,
  Product,
  OrderItem,
  Order
};