import React, { useState, useEffect, useRef } from 'react';
import type { Client, Account, Organization, Warehouse, PriceType, OrderItem, Product } from '../types';
import api from '../api/tablecrm';
import ClientSearch from './ClientSearch';
import SelectField from './SelectField';
import CategoryProductSearch, { type CategoryProductSearchRef } from './CategoryProductSearch';
import OrderItems from './OrderItems';
import AdditionalParamsModal from './AdditionalParamsModal';

const OrderForm: React.FC = () => {
  const [client, setClient] = useState<Client | undefined>();
  const [incomeAccounts, setIncomeAccounts] = useState<Account[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | undefined>();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | undefined>();
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [selectedPriceType, setSelectedPriceType] = useState<PriceType | undefined>();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [incomeAccount, setIncomeAccount] = useState<Account | undefined>();
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCost, setDeliveryCost] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [showAdditionalParams, setShowAdditionalParams] = useState(false);
  const [additionalParams, setAdditionalParams] = useState({
    number: '',
    comment: '',
    contract: '',
    tags: [] as string[],
    dealId: ''
  });
  const dataLoadedRef = useRef(false);
  const categorySearchRef = useRef<CategoryProductSearchRef>(null);

  useEffect(() => {
    if (!dataLoadedRef.current) {
      dataLoadedRef.current = true;
      loadInitialData();
    }
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [incomeAccountsData, orgsData, warehousesData, priceTypesData] = await Promise.all([
        api.getIncomeAccounts(),
        api.getOrganizations(),
        api.getWarehouses(),
        api.getPriceTypes()
      ]);
      
      api.getAllClients().then(() => {
        setClientsLoaded(true);
      }).catch(err => {
        console.error('Failed to load clients:', err);
      });
      
      setIncomeAccounts(incomeAccountsData);
      setOrganizations(orgsData);
      setWarehouses(warehousesData);
      setPriceTypes(priceTypesData);

      if (incomeAccountsData.length > 0) setIncomeAccount(incomeAccountsData[0]);
      if (orgsData.length > 0) setSelectedOrganization(orgsData[0]);
      if (warehousesData.length > 0) setSelectedWarehouse(warehousesData[0]);
      if (priceTypesData.length > 0) setSelectedPriceType(priceTypesData[0]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      alert('Ошибка загрузки данных. Проверьте подключение к API.');
    }
    setLoadingData(false);
  };

  const handleProductSelect = (product: Product, quantity: number) => {
    const newItem: OrderItem = {
      product,
      quantity,
      price: product.price,
      total: product.price * quantity
    };
    setOrderItems([...orderItems, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updatedItems = [...orderItems];
    updatedItems[index].quantity = quantity;
    updatedItems[index].total = updatedItems[index].price * quantity;
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCreateSale = async (conduct: boolean = false) => {
    
    if (!client || !incomeAccount || !selectedOrganization || !selectedWarehouse || !selectedPriceType) {
      const missing = [];
      if (!client) missing.push('Клиент');
      if (!incomeAccount) missing.push('Счет поступления');
      if (!selectedOrganization) missing.push('Организация');
      if (!selectedWarehouse) missing.push('Склад');
      if (!selectedPriceType) missing.push('Тип цены');
      
      alert(`Пожалуйста, заполните обязательные поля: ${missing.join(', ')}`);
      return;
    }

    if (orderItems.length === 0) {
      alert('Пожалуйста, добавьте хотя бы один товар');
      return;
    }

    setLoading(true);
    try {
      const order = {
        client,
        account: incomeAccount,
        organization: selectedOrganization,
        warehouse: selectedWarehouse,
        priceType: selectedPriceType,
        items: orderItems,
        total: calculateTotal(),
        status: conduct ? 'conducted' as const : 'created' as const,
        incomeAccount,
        delivery: deliveryEnabled ? {
          enabled: true,
          address: deliveryAddress,
          date: deliveryDate,
          cost: deliveryCost,
          note: deliveryNote,
          recipient: {
            name: recipientName,
            phone: recipientPhone
          }
        } : undefined,
        additionalParams: additionalParams
      };

      const result = await api.createSale(order, conduct);
      const orderNumber = result?.number || result?.id || '';
      const successMessage = orderNumber 
        ? `Заказ ${orderNumber} ${conduct ? 'создан и проведён' : 'создан'} успешно!`
        : `Заказ ${conduct ? 'создан и проведён' : 'создан'} успешно!`;
      
      alert(successMessage);
      setOrderItems([]);
      setClient(undefined);
      if (incomeAccounts.length > 0) setIncomeAccount(incomeAccounts[0]);
      if (organizations.length > 0) setSelectedOrganization(organizations[0]);
      if (warehouses.length > 0) setSelectedWarehouse(warehouses[0]);
      if (priceTypes.length > 0) setSelectedPriceType(priceTypes[0]);
      setDeliveryEnabled(false);
      setDeliveryAddress('');
      setDeliveryCost('');
      setDeliveryDate('');
      setDeliveryNote('');
      setRecipientName('');
      setRecipientPhone('');
      setAdditionalParams({
        number: '',
        comment: '',
        contract: '',
        tags: [],
        dealId: ''
      });
      if (categorySearchRef.current) {
        categorySearchRef.current.clearCategory();
      }
    } catch (error: any) {
      console.error('Error creating sale:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Неизвестная ошибка';
      alert(`Ошибка создания заказа: ${errorMessage}. Попробуйте ещё раз.`);
    }
    setLoading(false);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <ClientSearch 
            onClientSelect={setClient}
            selectedClient={client}
          />

          <SelectField
            label="Счет поступления"
            value={incomeAccount}
            options={incomeAccounts}
            onChange={setIncomeAccount}
            getOptionLabel={(acc) => acc.name}
            getOptionValue={(acc) => acc.id}
            placeholder="Выберите счет"
          />

          <SelectField
            label="Организация"
            value={selectedOrganization}
            options={organizations}
            onChange={setSelectedOrganization}
            getOptionLabel={(org) => org.name}
            getOptionValue={(org) => org.id}
            placeholder="Выберите организацию"
          />

          <SelectField
            label="Склад"
            value={selectedWarehouse}
            options={warehouses}
            onChange={setSelectedWarehouse}
            getOptionLabel={(wh) => wh.name}
            getOptionValue={(wh) => wh.id}
            placeholder="Выберите склад"
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Тип цены"
              value={selectedPriceType}
              options={priceTypes}
              onChange={setSelectedPriceType}
              getOptionLabel={(pt) => pt.name}
              getOptionValue={(pt) => pt.id}
              placeholder="Выберите тип цены"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Доп. параметры</h3>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={deliveryEnabled}
                onChange={(e) => setDeliveryEnabled(e.target.checked)}
                className="mr-2"
              />
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <span className="text-sm">Доставка</span>
            </label>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAdditionalParams(true)}
            className="mt-4 w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Доп. параметры
            {(additionalParams.number || additionalParams.comment || additionalParams.contract || 
              (additionalParams.tags && additionalParams.tags.length > 0) || additionalParams.dealId) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                Заполнено
              </span>
            )}
          </button>
          
          {deliveryEnabled && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-700 mb-2">Данные о доставке</h4>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Адрес</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Введите адрес доставки"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Стоимость доставки</label>
                <div className="relative">
                  <input
                    type="number"
                    value={deliveryCost}
                    onChange={(e) => setDeliveryCost(e.target.value)}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">₽</span>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Дата доставки</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Примечание</label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="Дополнительная информация о доставке"
                />
              </div>
              
              <h4 className="font-medium text-gray-700 mt-4 mb-2">Получатель</h4>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Имя</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Имя получателя"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Телефон</label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="+7 (999) 999-99-99"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Выбор товаров</h3>
          <CategoryProductSearch ref={categorySearchRef} onProductSelect={handleProductSelect} />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <OrderItems
            items={orderItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto p-4">
          <div className="flex space-x-3">
            <button
              onClick={() => handleCreateSale(false)}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Создание...' : 'Создать заказ'}
            </button>
            <button
              onClick={() => handleCreateSale(true)}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2.5 px-4 rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Проведение...' : 'Создать и провести'}
            </button>
          </div>
        </div>
      </div>
      <AdditionalParamsModal
        isOpen={showAdditionalParams}
        onClose={() => setShowAdditionalParams(false)}
        params={additionalParams}
        onSave={setAdditionalParams}
      />
    </div>
  );
};

export default OrderForm;