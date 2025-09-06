import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { Product } from '../types';
import api from '../api/tablecrm';
import categoriesApi from '../api/categories';
import type { Category } from '../api/categories';

interface CategoryProductSearchProps {
  onProductSelect: (product: Product, quantity: number) => void;
}

export interface CategoryProductSearchRef {
  clearCategory: () => void;
}

const CategoryProductSearch = forwardRef<CategoryProductSearchRef, CategoryProductSearchProps>(
  ({ onProductSelect }, ref) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  useImperativeHandle(ref, () => ({
    clearCategory: () => {
      setSelectedCategory(null);
      setProducts([]);
      setSearchQuery('');
      setQuantity(1);
      setSelectedProduct(null);
      setShowCategories(false);
    }
  }));

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    const cats = await categoriesApi.getCategories();
    setCategories(cats);
    setLoading(false);
  };

  const handleCategorySelect = async (category: Category) => {
    setSelectedCategory(category);
    setShowCategories(false);
    
    setLoading(true);
    try {
      const categoryProducts = await categoriesApi.getCategoryProducts(category.id);
      
      const products = categoryProducts.map((item: any) => ({
        id: item.id || item.code || Math.random(),
        name: item.name || item.title || 'Товар',
        article: item.article || item.articul || '',
        sku: item.sku || item.article || '',
        price: item.price || item.price_sale || item.price_retail || 0,
        stock: item.quantity || item.rest || item.stock || 10
      }));
      
      setProducts(products);
    } catch (error) {
      console.error('Error loading category products:', error);
      setProducts([]);
    }
    setLoading(false);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      onProductSelect(selectedProduct, quantity);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Поиск товара
        </label>
        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            {selectedCategory ? selectedCategory.name : 'Выбрать категорию'}
          </button>
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setProducts([]);
              }}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Очистить
            </button>
          )}
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={showCategories ? "Поиск категорий..." : "Поиск товаров..."}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {showCategories && !loading && (
        <div className="border rounded-lg max-h-60 overflow-y-auto">
          {filteredCategories.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {category.parent && <span className="text-gray-400 mr-2">└</span>}
                  <span>{category.name}</span>
                </div>
                {category.nom_count !== undefined && category.nom_count > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    ({category.nom_count})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {!showCategories && selectedCategory && products.length > 0 && (
        <div className="border rounded-lg max-h-60 overflow-y-auto">
          <div className="bg-gray-50 px-3 py-2 border-b font-medium text-sm">
            Товары в категории "{selectedCategory.name}"
          </div>
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0 ${
                selectedProduct?.id === product.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{product.name}</p>
                  {product.article && (
                    <p className="text-xs text-gray-500">Арт: {product.article}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">{product.price} ₽</p>
                  <p className="text-xs text-gray-500">Остаток: {product.stock}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="font-medium">{selectedProduct.name}</p>
              <p className="text-sm text-gray-600">Цена: {selectedProduct.price} ₽</p>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Кол-во:</label>
              <input
                type="number"
                min="1"
                max={selectedProduct.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <button
            onClick={handleAddProduct}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Добавить в заказ
          </button>
        </div>
      )}

      {!showCategories && selectedCategory && products.length === 0 && !loading && (
        <div className="text-center py-4 text-gray-500">
          Нет товаров в категории "{selectedCategory.name}"
        </div>
      )}
    </div>
  );
});

CategoryProductSearch.displayName = 'CategoryProductSearch';

export default CategoryProductSearch;