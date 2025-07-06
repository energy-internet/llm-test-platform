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
    credentials: '',
    api_endpoint: initialData?.api_endpoint || '',
    config: initialData?.config || {},
    project_id: initialData?.config?.project_id || '',
    location: initialData?.config?.location || 'us-central1'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const providerTypes = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic (Claude)' },
    { value: 'google', label: 'Google Gemini' },
    { value: 'google_vertex_ai', label: 'Google Vertex AI' },
    { value: 'deepseek', label: 'DeepSeek' },
    { value: 'ollama', label: 'Ollama (Local)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const submissionData = { ...formData };
    if (formData.provider_type === 'google_vertex_ai') {
      submissionData.config = {
        project_id: formData.project_id,
        location: formData.location,
      };
      delete submissionData.project_id;
      delete submissionData.location;
    }

    // 确保api_key字段存在，即使是空字符串
    // 对于Ollama，可以设置为空字符串，因为它不需要API密钥
    if (formData.provider_type === 'ollama') {
      submissionData.api_key = '';
    }

    try {
      await onSubmit(submissionData);
      // Reset form state if needed
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
      google_vertex_ai: '', // Vertex AI doesn't use a single endpoint URL in the same way
      deepseek: 'https://api.deepseek.com/v1',
      ollama: 'http://localhost:11434',
    };
    return endpoints[providerType] || '';
  };

  React.useEffect(() => {
    // When provider type changes, update endpoint and clear API key if switching to Vertex
    const newEndpoint = getDefaultEndpoint(formData.provider_type);
    setFormData(prev => ({
      ...prev,
      api_endpoint: newEndpoint,
      api_key: prev.provider_type === 'google_vertex_ai' ? '' : prev.api_key,
    }));
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

                  {formData.provider_type === 'google_vertex_ai' ? (
                    <>
                      <div>
                        <label className="form-label">Project ID</label>
                        <input
                          type="text"
                          name="project_id"
                          value={formData.project_id}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="gcp-project-id"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="us-central1"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Service Account JSON</label>
                        <textarea
                          name="credentials"
                          value={formData.credentials}
                          onChange={handleChange}
                          className="form-textarea"
                          rows="5"
                          placeholder='Paste your service account JSON here'
                          required={!initialData}
                        ></textarea>
                         {initialData && (
                          <p className="text-xs text-gray-500 mt-1">
                            Leave blank to keep existing credentials
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="form-label">API Key</label>
                        <input
                          type="password"
                          name="api_key"
                          value={formData.api_key}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter API key"
                          required={!initialData && formData.provider_type !== 'ollama'}
                        />
                        {initialData && (
                          <p className="text-xs text-gray-500 mt-1">
                            Leave blank to keep existing key
                          </p>
                        )}
                        {formData.provider_type === 'ollama' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Ollama本地模型不需要API密钥
                          </p>
                        )}
                      </div>

                      {formData.provider_type !== 'ollama' && (
                        <div>
                          <label className="form-label">API Endpoint</label>
                          <input
                            type="url"
                            name="api_endpoint"
                            value={formData.api_endpoint}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="API Endpoint URL"
                          />
                        </div>
                      )}
                    </>
                  )}
                  
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