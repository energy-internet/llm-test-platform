// src/components/Models/ModelProviderForm.jsx
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';

const ModelProviderForm = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    provider_type: initialData?.provider_type || 'openai',
    api_key: '',
    api_endpoint: initialData?.api_endpoint || '',
    config: initialData?.config || {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const providerTypes = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'google', label: 'Google Gemini' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'ollama', label: 'Ollama (Local)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onSubmit(formData);
      setFormData({ name: '', provider_type: 'openai', api_key: '', api_endpoint: '', config: {} });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save provider');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getDefaultEndpoint = (providerType) => {
    const endpoints = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com',
      google: 'https://generativelanguage.googleapis.com/v1beta',
      deepseek: 'https://api.deepseek.com/v1',
      ollama: 'http://localhost:11434',
    };
    return endpoints[providerType] || '';
  };

  React.useEffect(() => {
    if (formData.provider_type && !formData.api_endpoint) {
      setFormData(prev => ({
        ...prev,
        api_endpoint: getDefaultEndpoint(prev.provider_type)
      }));
    }
  }, [formData.provider_type]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {initialData ? 'Edit Model Provider' : 'Add Model Provider'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Provider Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="My OpenAI Provider"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Provider Type</label>
                    <select
                      name="provider_type"
                      value={formData.provider_type}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {providerTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">API Key</label>
                    <input
                      type="password"
                      name="api_key"
                      value={formData.api_key}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter API key"
                      required={!initialData}
                    />
                    {initialData && (
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to keep existing key
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">API Endpoint</label>
                    <input
                      type="url"
                      name="api_endpoint"
                      value={formData.api_endpoint}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? <LoadingSpinner size="sm" /> : (initialData ? 'Update' : 'Add')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModelProviderForm;