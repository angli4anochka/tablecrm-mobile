import React, { useState, useEffect } from 'react';
import api from '../api/tablecrm';

interface SalesOrder {
  id: number;
  number: string;
  dated: number | null;
  operation: string;
  status: boolean;
  sum: number;
  contragent_name: string | null;
  order_status: string;
  created_at: number;
  warehouse: number | null;
  organization: number;
  delivery_info: {
    recipient?: {
      name: string;
      phone: string;
    };
  } | null;
}

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ordersPerPage = 20;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }
    
    try {
      const page = loadMore ? currentPage + 1 : 0;
      const response = await api.getOrders(ordersPerPage, page * ordersPerPage);
      
      if (loadMore) {
        setOrders(prev => [...prev, ...(response || [])]);
      } else {
        setOrders(response || []);
      }
      
      setCurrentPage(page);
      setHasMore(response && response.length === ordersPerPage);
      
      if (!loadMore && (!response || response.length === 0)) {
        setError('Нет заказов для отображения');
      }
    } catch (error: any) {
      console.error('Error loading orders from API:', error);
      if (!loadMore) {
        setError(error.message || 'Ошибка подключения к API');
        setOrders([]);
      }
    }
    
    if (loadMore) {
      setLoadingMore(false);
    } else {
      setLoading(false);
    }
  };


  const filteredOrders = orders.filter(order => {
    if (filter === 'active') return !order.status;
    if (filter === 'completed') return order.status;
    return true;
  });

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (order: SalesOrder) => {
    if (order.status) return 'bg-green-100 text-green-800';
    if (order.order_status === 'received') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (order: SalesOrder) => {
    if (order.status) return 'Проведен';
    if (order.order_status === 'received') return 'Получен';
    return 'Черновик';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка заказов...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="px-4 py-3">
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3 flex-1">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
              <button 
                onClick={loadOrders}
                className="ml-3 text-yellow-600 hover:text-yellow-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Все ({orders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md ${
              filter === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Активные ({orders.filter(o => !o.status).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md ${
              filter === 'completed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Проведенные ({orders.filter(o => o.status).length})
          </button>
        </div>

        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg p-4 text-center text-gray-500">
              Нет заказов для отображения
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-lg">
                        Заказ №{order.number}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order)}`}>
                        {getStatusText(order)}
                      </span>
                    </div>
                    {order.contragent_name && (
                      <p className="text-sm text-gray-600 mt-1">
                        Клиент: {order.contragent_name}
                      </p>
                    )}
                    {order.delivery_info?.recipient && (
                      <p className="text-sm text-gray-600">
                        Получатель: {order.delivery_info.recipient.name} ({order.delivery_info.recipient.phone})
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {order.sum.toFixed(2)} ₽
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <div className="flex space-x-2 text-xs text-gray-500">
                    <span>ID: {order.id}</span>
                    {order.warehouse && <span>Склад: {order.warehouse}</span>}
                    <span>Орг: {order.organization}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Подробнее →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {hasMore && !loading && orders.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => loadOrders(true)}
              disabled={loadingMore}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Загружаем...
                </span>
              ) : (
                'Показать ещё'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;