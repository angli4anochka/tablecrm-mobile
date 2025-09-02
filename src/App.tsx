import { useState } from 'react';
import TokenForm from './components/TokenForm';
import OrderForm from './components/OrderForm';
import api from './api/tablecrm';

function App() {
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleTokenSubmit = (token: string) => {
    api.setToken(token);
    setIsAuthorized(true);
  };

  return (
    <>
      {!isAuthorized ? (
        <TokenForm onTokenSubmit={handleTokenSubmit} />
      ) : (
        <OrderForm />
      )}
    </>
  );
}

export default App;