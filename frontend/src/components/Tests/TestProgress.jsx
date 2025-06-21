// src/components/Tests/TestProgress.jsx
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../Common/LoadingSpinner';
import { apiClient } from '../../utils/api';

const TestProgress = ({ task, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('progress');

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['test-progress', task.id],
    queryFn: () => apiClient.get(`/tests/${task.id}/progress`).then(res => res.data),
    enabled: isOpen && task.status === 'running',
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['test-results', task.id],
    queryFn: () => apiClient.get(`/tests/${task.id}/results`).then(res => res.data),
    enabled: isOpen && ['completed', 'failed'].includes(task.status),
  });

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getModelIcon = (providerType) => {
    const icons = {
      openai: '🤖',
      anthropic: '🧠',
      google: '🔍',
      deepseek: '🌊',
      ollama: '🦙'
    };
    return icons[providerType] || '⚡';
  };

  const tabs = [
    { id: 'progress', name: 'Progress', icon: ChartBarIcon },
    { id: 'results', name: 'Results', icon: DocumentTextIcon },
  ];

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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {task.name} - Details
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap flex items-center py-2 px-1 border-b-2 font-medium text-sm`}
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Progress Tab */}
                {activeTab === 'progress' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="card">
                        <div className="card-body text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {task.status === 'running' ? (progress?.percentage || 0).toFixed(1) : 
                             task.status === 'completed' ? 100 : 0}%
                          </div>
                          <div className="text-sm text-gray-600">Overall Progress</div>
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-body text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {progress?.completed_cases || results?.total_completed || 0}
                          </div>
                          <div className="text-sm text-gray-600">Completed Cases</div>
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-body text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {progress?.failed_cases || results?.total_failed || 0}
                          </div>
                          <div className="text-sm text-gray-600">Failed Cases</div>
                        </div>
                      </div>
                    </div>

                    {task.status === 'running' && progress && (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-3">Real-time Progress</h4>
                        <div className="progress-bar mb-2">
                          <div 
                            className="progress-bar-fill"
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          {progress.completed_cases} / {progress.total_cases} test cases completed
                        </div>
                        
                        {progress.current_model && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <div className="text-sm">
                              <strong>Currently testing:</strong> {progress.current_model.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Provider: {progress.current_model.provider_type}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {progressLoading && (
                      <div className="flex justify-center items-center py-8">
                        <LoadingSpinner />
                      </div>
                    )}
                  </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                  <div className="space-y-6">
                    {resultsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <LoadingSpinner />
                      </div>
                    ) : results ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="card">
                            <div className="card-body text-center">
                              <div className="text-xl font-bold text-blue-600">
                                {results.total_models || 0}
                              </div>
                              <div className="text-sm text-gray-600">Models Tested</div>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-body text-center">
                              <div className="text-xl font-bold text-green-600">
                                {results.total_completed || 0}
                              </div>
                              <div className="text-sm text-gray-600">Total Completed</div>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-body text-center">
                              <div className="text-xl font-bold text-red-600">
                                {results.total_failed || 0}
                              </div>
                              <div className="text-sm text-gray-600">Total Failed</div>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-body text-center">
                              <div className="text-xl font-bold text-purple-600">
                                {results.average_score ? results.average_score.toFixed(2) : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Avg Score</div>
                            </div>
                          </div>
                        </div>

                        {results.model_results && results.model_results.length > 0 && (
                          <div>
                            <h4 className="text-md font-medium text-gray-900 mb-3">Model Performance</h4>
                            <div className="overflow-x-auto">
                              <table className="table">
                                <thead className="table-header">
                                  <tr>
                                    <th className="table-header-cell">Model</th>
                                    <th className="table-header-cell">Provider</th>
                                    <th className="table-header-cell">Score</th>
                                    <th className="table-header-cell">Completed</th>
                                    <th className="table-header-cell">Failed</th>
                                    <th className="table-header-cell">Avg Time</th>
                                  </tr>
                                </thead>
                                <tbody className="table-body">
                                  {results.model_results.map((result, index) => (
                                    <tr key={index}>
                                      <td className="table-cell">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">
                                            {getModelIcon(result.provider_type)}
                                          </span>
                                          <span>{result.model_name}</span>
                                        </div>
                                      </td>
                                      <td className="table-cell capitalize">
                                        {result.provider_type}
                                      </td>
                                      <td className="table-cell">
                                        <span className={`badge ${
                                          result.score >= 80 ? 'badge-success' :
                                          result.score >= 60 ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                          {result.score ? result.score.toFixed(1) : 'N/A'}
                                        </span>
                                      </td>
                                      <td className="table-cell">{result.completed_cases}</td>
                                      <td className="table-cell">{result.failed_cases}</td>
                                      <td className="table-cell">
                                        {result.average_response_time ? 
                                          `${result.average_response_time.toFixed(2)}s` : 'N/A'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-500">No results available yet</div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TestProgress;