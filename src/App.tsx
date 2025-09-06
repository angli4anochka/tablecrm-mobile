import { useState, useEffect } from 'react';
import TokenForm from './components/TokenForm';
import OrderForm from './components/OrderForm';
import OrdersList from './components/OrdersList';
import api from './api/tablecrm';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'orders' | 'new-order'>('orders');

  useEffect(() => {
    const savedToken = localStorage.getItem('tablecrm_token');
    if (savedToken) {
      setToken(savedToken);
      api.setToken(savedToken);
    }
  }, []);

  const handleTokenSubmit = (newToken: string) => {
    setToken(newToken);
    api.setToken(newToken);
    localStorage.setItem('tablecrm_token', newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('tablecrm_token');
  };

  if (!token) {
    return <TokenForm onTokenSubmit={handleTokenSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-sm px-4 py-3">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-lg font-bold">TableCRM Mobile</h1>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Выход
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('orders')}
              className={`flex-1 py-2 px-4 rounded-md transition ${
                currentView === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Заказы
            </button>
            <button
              onClick={() => setCurrentView('new-order')}
              className={`flex-1 py-2 px-4 rounded-md transition ${
                currentView === 'new-order'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Новый заказ
            </button>
          </div>
        </div>
        
        {currentView === 'orders' ? <OrdersList /> : <OrderForm />}
      </div>
    </div>
  );
}

export default App;