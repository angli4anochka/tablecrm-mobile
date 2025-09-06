import React from 'react';
import type { OrderItem } from '../types';

interface OrderItemsProps {
  items: OrderItem[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

const OrderItems: React.FC<OrderItemsProps> = ({ items, onRemoveItem, onUpdateQuantity }) => {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateDiscount = () => {
    return items.reduce((sum, item) => sum + (item.discount || 0) * item.quantity, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Нет товаров в заказе
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Товары</h3>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Наименование</th>
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-700 w-20">Кол-во</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 w-24">Цена</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 w-24">Скидка</th>
              <th className="text-right py-2 px-3 text-sm font-medium text-gray-700 w-28">Сумма</th>
              <th className="text-center py-2 px-3 text-sm font-medium text-gray-700 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">
                  <div>
                    <p className="font-medium text-sm">{item.product.name}</p>
                    {item.product.article && (
                      <p className="text-xs text-gray-500">Арт: {item.product.article}</p>
                    )}
                  </div>
                </td>
                <td className="py-2 px-3">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                      className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value) || 1)}
                      className="w-12 px-1 py-0.5 text-center border border-gray-300 rounded text-sm"
                    />
                    <button
                      onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                      className="w-6 h-6 rounded border border-gray-300 hover:bg-gray-100 text-xs"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-2 px-3 text-right text-sm">
                  {item.price.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right text-sm">
                  {(item.discount || 0).toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right font-medium text-sm">
                  {item.total.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    onClick={() => onRemoveItem(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {items.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                {item.product.article && (
                  <p className="text-xs text-gray-500">Арт: {item.product.article}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  {item.price.toFixed(2)} ₽ × {item.quantity} = {item.total.toFixed(2)} ₽
                </p>
              </div>
              <button
                onClick={() => onRemoveItem(index)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                className="w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value) || 1)}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-md"
              />
              <button
                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                className="w-8 h-8 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="border-t pt-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Подитог:</span>
          <span className="font-medium">{calculateSubtotal().toFixed(2)} ₽</span>
        </div>
        {calculateDiscount() > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Скидка:</span>
            <span className="font-medium text-red-600">-{calculateDiscount().toFixed(2)} ₽</span>
          </div>
        )}
        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
          <span>Итого:</span>
          <span className="text-blue-600">{calculateTotal().toFixed(2)} ₽</span>
        </div>
      </div>
    </div>
  );
};

export default OrderItems;