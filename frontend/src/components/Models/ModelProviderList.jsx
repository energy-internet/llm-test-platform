// src/components/Models/ModelProviderList.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import ModelProviderForm from './ModelProviderForm';
import ModelTestDialog from './ModelTestDialog';
import LoadingSpinner from '../Common/LoadingSpinner';
import { apiClient } from '../../utils/api';

const ModelProviderList = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [testingProvider, setTestingProvider] = useState(null);
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['model-providers'],
    queryFn: () => apiClient.get('/model-providers').then(res => res.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.post('/model-providers', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-providers']);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.put(`/model-providers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-providers']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/model-providers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['model-providers']);
    }
  });

  const handleAdd = () => {
    setEditingProvider(null);
    setIsFormOpen(true);
  };

  const handleEdit = (provider) => {
    setEditingProvider(provider);
    setIsFormOpen(true);
  };

  const handleDelete = async (provider) => {
    if (window.confirm(`Are you sure you want to delete "${provider.name}"?`)) {
      deleteMutation.mutate(provider.id);
    }
  };

  const handleTest = (provider) => {
    setTestingProvider(provider);
  };

  const handleFormSubmit = async (data) => {
    if (editingProvider) {
      await updateMutation.mutateAsync({ id: editingProvider.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const getProviderTypeIcon = (type) => {
    const icons = {
      openai: '🤖',
      anthropic: '🧠',
      google: '🔍',
      deepseek: '🌊',
      ollama: '🦙'
    };
    return icons[type] || '⚡';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Model Providers</h2>
        <button onClick={handleAdd} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Provider
        </button>
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No providers configured</h3>
          <p className="text-gray-600 mb-6">
            Add your first AI model provider to start evaluating models
          </p>
          <button onClick={handleAdd} className="btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Provider
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getProviderTypeIcon(provider.provider_type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {provider.provider_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {provider.is_active ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Status: </span>
                    <span className={`badge ${provider.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {provider.api_endpoint && (
                    <div className="text-sm">
                      <span className="text-gray-600">Endpoint: </span>
                      <span className="text-gray-900 text-xs font-mono">
                        {provider.api_endpoint}
                      </span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-600">Created: </span>
                    <span className="text-gray-900">
                      {new Date(provider.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTest(provider)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Test
                  </button>
                  <button
                    onClick={() => handleEdit(provider)}
                    className="flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(provider)}
                    className="flex items-center justify-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                    disabled={deleteMutation.isLoading}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModelProviderForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProvider(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingProvider}
      />

      {testingProvider && (
        <ModelTestDialog
          provider={testingProvider}
          isOpen={!!testingProvider}
          onClose={() => setTestingProvider(null)}
        />
      )}
    </div>
  );
};

export default ModelProviderList;