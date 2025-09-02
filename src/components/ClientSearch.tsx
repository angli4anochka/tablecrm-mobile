import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import api from '../api/tablecrm';

interface ClientSearchProps {
  onClientSelect: (client: Client) => void;
  selectedClient?: Client;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ onClientSelect, selectedClient }) => {
  const [phone, setPhone] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchClients = async () => {
      if (phone.length >= 3) {
        setLoading(true);
        const results = await api.searchClient(phone);
        setClients(results);
        setShowResults(true);
        setLoading(false);
      } else {
        setClients([]);
        setShowResults(false);
      }
    };

    const timer = setTimeout(searchClients, 500);
    return () => clearTimeout(timer);
  }, [phone]);

  const handleClientSelect = (client: Client) => {
    onClientSelect(client);
    setPhone(client.phone);
    setShowResults(false);
  };

  const formatPhone = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    if (phoneNumber.length <= 10) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Client Phone
      </label>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+7 (999) 999-99-99"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      {selectedClient && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            Selected: {selectedClient.name} - {selectedClient.phone}
          </p>
        </div>
      )}

      {loading && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2">
          <p className="text-sm text-gray-500">Searching...</p>
        </div>
      )}

      {showResults && !loading && clients.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
            >
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-gray-600">{client.phone}</p>
            </button>
          ))}
        </div>
      )}

      {showResults && !loading && clients.length === 0 && phone.length >= 3 && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <p className="text-sm text-gray-500">No clients found</p>
        </div>
      )}
    </div>
  );
};

export default ClientSearch;