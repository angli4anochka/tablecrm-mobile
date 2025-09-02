import React from 'react';
import { OrderItem } from '../types';

interface OrderItemsProps {
  items: OrderItem[];
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
}

const OrderItems: React.FC<OrderItemsProps> = ({ items, onRemoveItem, onUpdateQuantity }) => {
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No items in order
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Order Items</h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-600">
                  ${item.price} × {item.quantity} = ${item.total.toFixed(2)}
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
      <div className="border-t pt-3">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderItems;