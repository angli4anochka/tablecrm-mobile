import type { Product } from '../types';

export function extractProductsFromOrders(orders: any): Product[] {
  const productsMap = new Map<string, Product>();
  
  const ordersList = Array.isArray(orders) ? orders : (orders?.result || orders?.data || []);
  
  if (!Array.isArray(ordersList)) {
    console.warn('Orders is not an array:', orders);
    return [];
  }
  
  ordersList.forEach(order => {
    const items = order.goods || order.items || order.products || [];
    if (order.nomenclature) {
      const nom = order.nomenclature;
      const id = nom.id || nom.code || Math.random().toString();
      const name = nom.name || nom.title || `Товар ${id}`;
      
      if (!productsMap.has(id.toString())) {
        productsMap.set(id.toString(), {
          id: id,
          name: name, 
          article: nom.article || nom.articul || '',
          sku: nom.sku || nom.article || '',
          price: nom.price || nom.price_sale || 0,
          stock: nom.quantity || nom.stock || 10
        });
      }
    }
    
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        const id = item.nomenclature || 
                  item.nomenclature_id || 
                  item.product_id || 
                  item.good_id ||
                  item.id || 
                  Math.random().toString();
        const name = item.nomenclature_name ||
                    item.nomenclature_title ||
                    item.name || 
                    item.title || 
                    item.product_name ||
                    item.good_name ||
                    `Товар ${id}`;
        const existing = productsMap.get(id.toString());
        const price = item.price || item.price_sale || item.price_retail || existing?.price || 0;
        const stock = item.quantity || item.rest || item.stock || item.available || existing?.stock || 10;
        
        productsMap.set(id.toString(), {
          id: id,
          name: name,
          article: item.article || item.articul || item.code || existing?.article || '',
          sku: item.sku || item.article || item.articul || item.code || existing?.sku || '',
          price: price,
          stock: stock
        });
      });
    }
  });
  
  return Array.from(productsMap.values());
}

let cachedProducts: Product[] = [];

export function setCachedProducts(products: Product[]) {
  cachedProducts = products;
}

export function getCachedProducts(): Product[] {
  return cachedProducts;
}

export function searchInCachedProducts(query: string): Product[] {
  if (!query || query.trim() === '') {
    return cachedProducts.slice(0, 20);
  }
  
  const searchTerm = query.toLowerCase();
  return cachedProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm)) ||
    (p.article && p.article.toLowerCase().includes(searchTerm))
  );
}