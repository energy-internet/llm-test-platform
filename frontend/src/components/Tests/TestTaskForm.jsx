// src/components/Tests/TestTaskForm.jsx
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../Common/LoadingSpinner';
import { apiClient } from '../../utils/api';

const TestTaskForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    benchmark_id: '',
    model_ids: [],
    config: {
      temperature: 0.7,
      max_tokens: 1000,
      timeout: 30,
    },
  });
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data: benchmarks = [], isLoading: benchmarksLoading } = useQuery({
    queryKey: ['benchmarks'],
    queryFn: () => apiClient.get('/benchmarks').then(res => res.data),
    enabled: isOpen,
  });

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: () => apiClient.get('/models').then(res => res.data),
    enabled: isOpen,
  });

  const createTestMutation = useMutation({
    mutationFn: (data) => apiClient.post('/tests', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['test-tasks']);
      handleClose();
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Failed to create test task');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.model_ids.length === 0) {
      setError('Please select at least one model');
      return;
    }

    createTestMutation.mutate(formData);
  };

  const handleModelToggle = (modelId) => {
    setFormData(prev => ({
      ...prev,
      model_ids: prev.model_ids.includes(modelId)
        ? prev.model_ids.filter(id => id !== modelId)
        : [...prev.model_ids, modelId]
    }));
  };

  const handleConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value
      }
    }));
  };

  const handleClose = () => {
    setFormData({
      name: '',
      benchmark_id: '',
      model_ids: [],
      config: {
        temperature: 0.7,
        max_tokens: 1000,
        timeout: 30,
      },
    });
    setError('');
    onClose();
  };

  const groupedModels = models.reduce((acc, model) => {
    const providerName = model.provider?.name || 'Unknown Provider';
    if (!acc[providerName]) {
      acc[providerName] = [];
    }
    acc[providerName].push(model);
    return acc;
  }, {});

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create Test Task
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="form-label">Test Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="Model Comparison Test"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Benchmark</label>
                    {benchmarksLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <select
                        value={formData.benchmark_id}
                        onChange={(e) => setFormData({ ...formData, benchmark_id: e.target.value })}
                        className="form-select"
                        required
                      >
                        <option value="">Select a benchmark</option>
                        {benchmarks.map((benchmark) => (
                          <option key={benchmark.id} value={benchmark.id}>
                            {benchmark.name} ({benchmark.benchmark_type})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Select Models</label>
                    {modelsLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="sm" />
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-3">
                        {Object.entries(groupedModels).map(([providerName, providerModels]) => (
                          <div key={providerName}>
                            <h4 className="font-medium text-gray-700 mb-2">{providerName}</h4>
                            <div className="space-y-2 ml-4">
                              {providerModels.map((model) => (
                                <label key={model.id} className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={formData.model_ids.includes(model.id)}
                                    onChange={() => handleModelToggle(model.id)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="text-sm text-gray-900">
                                    {model.name}
                                    {model.model_type && (
                                      <span className="text-gray-500 ml-1">({model.model_type})</span>
                                    )}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.model_ids.length > 0 && (
                      <p className="text-sm text-gray-600 mt-2">
                        {formData.model_ids.length} model(s) selected
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">Test Configuration</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Temperature
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={formData.config.temperature}
                          onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="8000"
                          value={formData.config.max_tokens}
                          onChange={(e) => handleConfigChange('max_tokens', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timeout (s)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          value={formData.config.timeout}
                          onChange={(e) => handleConfigChange('timeout', parseInt(e.target.value))}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-secondary"
                      disabled={createTestMutation.isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={createTestMutation.isLoading}
                    >
                      {createTestMutation.isLoading ? <LoadingSpinner size="sm" /> : 'Create Test'}
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

export default TestTaskForm;