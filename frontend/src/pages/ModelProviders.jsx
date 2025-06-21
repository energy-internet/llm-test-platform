// src/pages/ModelProviders.jsx
import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import ModelProviderList from '../components/Models/ModelProviderList';
import ModelProviderForm from '../components/Models/ModelProviderForm';

const ModelProviders = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Model Providers</h1>
          <p className="mt-2 text-gray-600">
            Manage your AI model providers and their configurations
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)} 
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Provider
        </button>
      </div>

      <ModelProviderList />

      <ModelProviderForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={async (data) => {
          // Handle form submission - this will be handled by the component
          console.log('Provider data:', data);
        }}
      />
    </div>
  );
};

export default ModelProviders;