import React, { useState, useEffect } from 'react';
import { Client, Account, Organization, Warehouse, PriceType, OrderItem, Product } from '../types';
import api from '../api/tablecrm';
import ClientSearch from './ClientSearch';
import SelectField from './SelectField';
import ProductSearch from './ProductSearch';
import OrderItems from './OrderItems';

const OrderForm: React.FC = () => {
  const [client, setClient] = useState<Client | undefined>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | undefined>();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | undefined>();
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [selectedPriceType, setSelectedPriceType] = useState<PriceType | undefined>();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [accountsData, orgsData, warehousesData, priceTypesData] = await Promise.all([
        api.getAccounts(),
        api.getOrganizations(),
        api.getWarehouses(),
        api.getPriceTypes()
      ]);
      
      setAccounts(accountsData);
      setOrganizations(orgsData);
      setWarehouses(warehousesData);
      setPriceTypes(priceTypesData);

      // Set defaults if available
      if (accountsData.length > 0) setSelectedAccount(accountsData[0]);
      if (orgsData.length > 0) setSelectedOrganization(orgsData[0]);
      if (warehousesData.length > 0) setSelectedWarehouse(warehousesData[0]);
      if (priceTypesData.length > 0) setSelectedPriceType(priceTypesData[0]);
    } catch (error) {
      console.error('Error loading initial data:', error);
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
    if (!client || !selectedAccount || !selectedOrganization || !selectedWarehouse || !selectedPriceType) {
      alert('Please fill in all required fields');
      return;
    }

    if (orderItems.length === 0) {
      alert('Please add at least one product');
      return;
    }

    setLoading(true);
    try {
      const order = {
        client,
        account: selectedAccount,
        organization: selectedOrganization,
        warehouse: selectedWarehouse,
        priceType: selectedPriceType,
        items: orderItems,
        total: calculateTotal(),
        status: conduct ? 'conducted' as const : 'created' as const
      };

      await api.createSale(order, conduct);
      alert(`Order ${conduct ? 'created and conducted' : 'created'} successfully!`);
      
      // Reset form
      setOrderItems([]);
      setClient(undefined);
    } catch (error) {
      alert('Error creating order. Please try again.');
      console.error('Error creating sale:', error);
    }
    setLoading(false);
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">New Order</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <ClientSearch 
            onClientSelect={setClient}
            selectedClient={client}
          />

          <SelectField
            label="Account"
            value={selectedAccount}
            options={accounts}
            onChange={setSelectedAccount}
            getOptionLabel={(acc) => acc.name}
            getOptionValue={(acc) => acc.id}
            placeholder="Select account"
          />

          <SelectField
            label="Organization"
            value={selectedOrganization}
            options={organizations}
            onChange={setSelectedOrganization}
            getOptionLabel={(org) => org.name}
            getOptionValue={(org) => org.id}
            placeholder="Select organization"
          />

          <SelectField
            label="Warehouse"
            value={selectedWarehouse}
            options={warehouses}
            onChange={setSelectedWarehouse}
            getOptionLabel={(wh) => wh.name}
            getOptionValue={(wh) => wh.id}
            placeholder="Select warehouse"
          />

          <SelectField
            label="Price Type"
            value={selectedPriceType}
            options={priceTypes}
            onChange={setSelectedPriceType}
            getOptionLabel={(pt) => pt.name}
            getOptionValue={(pt) => pt.id}
            placeholder="Select price type"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <ProductSearch onProductSelect={handleProductSelect} />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <OrderItems
            items={orderItems}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
          />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <button
            onClick={() => handleCreateSale(false)}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Sale'}
          </button>
          <button
            onClick={() => handleCreateSale(true)}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Create & Conduct'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;