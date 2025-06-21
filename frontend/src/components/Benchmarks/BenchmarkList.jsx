// src/components/Benchmarks/BenchmarkList.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusIcon, 
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import BenchmarkUpload from './BenchmarkUpload';
import LoadingSpinner from '../Common/LoadingSpinner';
import { apiClient } from '../../utils/api';

const BenchmarkList = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('all');

  const { data: benchmarks = [], isLoading } = useQuery({
    queryKey: ['benchmarks', selectedType],
    queryFn: () => {
      const params = selectedType !== 'all' ? { benchmark_type: selectedType } : {};
      return apiClient.get('/benchmarks', { params }).then(res => res.data);
    }
  });

  const benchmarkTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'elecbench', label: 'ElecBench' },
    { value: 'engibench', label: 'EngiBench' },
    { value: 'custom', label: 'Custom' },
  ];

  const getBenchmarkIcon = (type) => {
    const icons = {
      elecbench: '⚡',
      engibench: '🔧',
      custom: '📋'
    };
    return icons[type] || '📄';
  };

  const handleViewSamples = async (benchmarkId) => {
    try {
      const response = await apiClient.get(`/benchmarks/${benchmarkId}/cases?limit=5`);
      console.log('Sample cases:', response.data);
      // You could show this in a modal or navigate to a detailed view
    } catch (error) {
      console.error('Error fetching samples:', error);
    }
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
        <h2 className="text-2xl font-bold text-gray-900">Benchmarks</h2>
        <button onClick={() => setIsUploadOpen(true)} className="btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Upload Benchmark
        </button>
      </div>

      <div className="flex space-x-4 items-center">
        <label className="text-sm font-medium text-gray-700">Filter by type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="form-select w-auto"
        >
          {benchmarkTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {benchmarks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No benchmarks available</h3>
          <p className="text-gray-600 mb-6">
            Upload a custom benchmark or create predefined ones to start testing
          </p>
          <div className="flex justify-center space-x-4">
            <button onClick={() => setIsUploadOpen(true)} className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Upload Custom
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benchmarks.map((benchmark) => (
            <div key={benchmark.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getBenchmarkIcon(benchmark.benchmark_type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {benchmark.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {benchmark.benchmark_type}
                      </p>
                    </div>
                  </div>
                </div>

                {benchmark.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {benchmark.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {benchmark.config && (
                    <div className="text-sm">
                      {benchmark.config.total_questions && (
                        <div>
                          <span className="text-gray-600">Questions: </span>
                          <span className="badge badge-info">
                            {benchmark.config.total_questions}
                          </span>
                        </div>
                      )}
                      {benchmark.config.test_cases && (
                        <div>
                          <span className="text-gray-600">Test cases: </span>
                          <span className="badge badge-info">
                            {benchmark.config.test_cases}
                          </span>
                        </div>
                      )}
                      {benchmark.config.format && (
                        <div>
                          <span className="text-gray-600">Format: </span>
                          <span className="badge badge-info capitalize">
                            {benchmark.config.format}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="text-gray-600">Created: </span>
                    <span className="text-gray-900">
                      {new Date(benchmark.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewSamples(benchmark.id)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Preview
                  </button>
                  {benchmark.file_path && (
                    <button className="flex items-center justify-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BenchmarkUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};

export default BenchmarkList;