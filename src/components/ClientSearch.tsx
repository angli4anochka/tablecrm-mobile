import React, { useState, useEffect } from 'react';
import type { Client } from '../types';
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
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!selectedClient) {
      setPhone('');
      setClients([]);
      setShowResults(false);
      setShowAll(false);
    }
  }, [selectedClient]);

  useEffect(() => {
    const searchClients = async () => {
      if (phone.length >= 3) {
        setLoading(true);
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        
        const results = await api.searchClient(cleanPhone);
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
    setShowAll(false);
  };

  const formatPhone = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    if (phoneNumber.length <= 10) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };
  
  const loadAllClients = async () => {
    setLoading(true);
    setShowAll(true);
    const allClients = await api.getAllClients();
    setClients(allClients);
    setShowResults(true);
    setLoading(false);
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">
          Телефон клиента
        </label>
        {!selectedClient && (
          <button
            onClick={loadAllClients}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Загрузить всех клиентов
          </button>
        )}
      </div>
      <input
        type="tel"
        value={phone}
        onChange={(e) => {
          if (!selectedClient) {
            setPhone(e.target.value);
            setShowAll(false);
          }
        }}
        placeholder="+7 (999) 999-99-99"
        disabled={!!selectedClient}
        autoComplete="off"
        name="client-phone"
        data-form-type="other"
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          selectedClient ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'border-gray-300'
        }`}
      />
      
      {selectedClient && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-sm text-green-800">
              Выбран: {selectedClient.name} - {selectedClient.phone}
            </p>
            <button
              onClick={() => {
                onClientSelect(null as any);
                setPhone('');
                setClients([]);
                setShowResults(false);
              }}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Изменить
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-2">
          <p className="text-sm text-gray-500">Поиск...</p>
        </div>
      )}

      {showResults && !loading && clients.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {showAll && (
            <div className="px-3 py-2 bg-blue-50 border-b text-sm text-blue-700">
              Все клиенты ({clients.length})
            </div>
          )}
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
            >
              <p className="font-medium">{client.name}</p>
              <p className="text-sm text-gray-600">{client.phone}</p>
              {client.email && (
                <p className="text-xs text-gray-500">{client.email}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {showResults && !loading && clients.length === 0 && phone.length >= 3 && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <p className="text-sm text-gray-500 mb-2">Клиент не найден</p>
          <button
            onClick={() => {
              const newClient: Client = {
                id: 'new-' + Date.now(),
                name: 'Новый клиент',
                phone: phone,
                email: '',
                address: ''
              };
              handleClientSelect(newClient);
            }}
            className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded text-sm text-blue-700"
          >
            Создать нового клиента с этим номером
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientSearch;