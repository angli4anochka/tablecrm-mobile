import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import api from '../api/tablecrm';

interface ProductSearchProps {
  onProductSelect: (product: Product, quantity: number) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onProductSelect }) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length >= 2) {
        setLoading(true);
        const results = await api.searchProducts(query);
        setProducts(results);
        setShowResults(true);
        setLoading(false);
      } else {
        setProducts([]);
        setShowResults(false);
      }
    };

    const timer = setTimeout(searchProducts, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setQuery(product.name);
    setShowResults(false);
  };

  const handleAddProduct = () => {
    if (selectedProduct && quantity > 0) {
      onProductSelect(selectedProduct, quantity);
      setSelectedProduct(null);
      setQuery('');
      setQuantity(1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Поиск товара
        </label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск товаров..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {loading && (
          <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2 z-10">
            <p className="text-sm text-gray-500">Поиск...</p>
          </div>
        )}

        {showResults && !loading && products.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
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
      </div>

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
    </div>
  );
};

export default ProductSearch;