// src/components/Reports/ReportViewer.jsx
import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import ReportCharts from './ReportCharts';
import LoadingSpinner from '../Common/LoadingSpinner';
import { api, handleApiError } from '../../utils/api';
import { useParams, Link } from 'react-router-dom';
import { Button, Card, CardContent, Typography, CircularProgress, Box, Grid, Paper } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ErrorAnalysis from './ErrorAnalysis';
import ModelComparison from './ModelComparison';

const ReportViewer = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await api.reports.getReport(id);
        setReport(response.data);
      } catch (err) {
        setError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleDownload = async () => {
    try {
      // This endpoint might need to be implemented in the backend
      // For now, we can mock the download functionality
      alert('Download functionality is not yet implemented.');
    } catch (err) {
      alert(`Failed to download report: ${handleApiError(err)}`);
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
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'charts', name: 'Charts', icon: ChartBarIcon },
  ];

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => {}}>
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
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {report?.name}
                  </Dialog.Title>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownload}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
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

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && report && (
                      <div className="space-y-6">
                        {/* Report Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="card">
                            <div className="card-body text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {report.summary?.total_models || 0}
                              </div>
                              <div className="text-sm text-gray-600">Models Tested</div>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-body text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {report.summary?.total_test_cases || 0}
                              </div>
                              <div className="text-sm text-gray-600">Test Cases</div>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-body text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {report.summary?.average_score?.toFixed(1) || 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Average Score</div>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-body text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {report.summary?.total_duration ? 
                                  `${Math.round(report.summary.total_duration / 60)}m` : 'N/A'}
                              </div>
                              <div className="text-sm text-gray-600">Total Time</div>
                            </div>
                          </div>
                        </div>

                        {/* Model Performance Table */}
                        {report.model_results && report.model_results.length > 0 && (
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Model Performance</h4>
                            <div className="overflow-x-auto">
                              <table className="table">
                                <thead className="table-header">
                                  <tr>
                                    <th className="table-header-cell">Rank</th>
                                    <th className="table-header-cell">Model</th>
                                    <th className="table-header-cell">Provider</th>
                                    <th className="table-header-cell">Score</th>
                                    <th className="table-header-cell">Accuracy</th>
                                    <th className="table-header-cell">Avg Response Time</th>
                                    <th className="table-header-cell">Success Rate</th>
                                  </tr>
                                </thead>
                                <tbody className="table-body">
                                  {report.model_results
                                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                                    .map((result, index) => (
                                    <tr key={result.model_id}>
                                      <td className="table-cell">
                                        <div className="flex items-center justify-center">
                                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                            index === 0 ? 'bg-yellow-500' :
                                            index === 1 ? 'bg-gray-400' :
                                            index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                                          }`}>
                                            {index + 1}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="table-cell">
                                        <div className="flex items-center space-x-2">
                                          <span className="text-lg">
                                            {getModelIcon(result.provider_type)}
                                          </span>
                                          <span className="font-medium">{result.model_name}</span>
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
                                      <td className="table-cell">
                                        {result.accuracy ? `${result.accuracy.toFixed(1)}%` : 'N/A'}
                                      </td>
                                      <td className="table-cell">
                                        {result.average_response_time ? 
                                          `${result.average_response_time.toFixed(2)}s` : 'N/A'}
                                      </td>
                                      <td className="table-cell">
                                        {result.success_rate ? `${result.success_rate.toFixed(1)}%` : 'N/A'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Test Configuration */}
                        {report.test_config && (
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Test Configuration</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Benchmark:</span>
                                  <p className="text-sm text-gray-900">{report.benchmark?.name}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Temperature:</span>
                                  <p className="text-sm text-gray-900">{report.test_config.temperature}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Max Tokens:</span>
                                  <p className="text-sm text-gray-900">{report.test_config.max_tokens}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Key Insights */}
                        {report.insights && report.insights.length > 0 && (
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h4>
                            <div className="space-y-3">
                              {report.insights.map((insight, index) => (
                                <div key={index} className="bg-blue-50 border-l-4 border-blue-400 p-4">
                                  <div className="flex">
                                    <div className="ml-3">
                                      <p className="text-sm text-blue-700">{insight}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Charts Tab */}
                    {activeTab === 'charts' && report && (
                      <ReportCharts data={report} />
                    )}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    className="btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleDownload}
                    className="btn-primary"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download PDF
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

export default ReportViewer;