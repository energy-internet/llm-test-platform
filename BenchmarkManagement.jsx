// src/pages/BenchmarkManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ArrowUpTrayIcon,
  CogIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import BenchmarkImportForm from '../components/Benchmarks/BenchmarkImportForm';
import BenchmarkFormatConverter from '../components/Benchmarks/BenchmarkFormatConverter';
import BenchmarkTemplateManager from '../components/Benchmarks/BenchmarkTemplateManager';

const BenchmarkManagement = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [isImportOpen, setIsImportOpen] = useState(false);

  useEffect(() => {
    console.log('BenchmarkManagement component mounted');
    console.log('Available tabs:', tabs.map(t => t.id));
    console.log('Active tab:', activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'import', name: 'Import Benchmarks', icon: ArrowUpTrayIcon },
    { id: 'convert', name: 'Format Converter', icon: CogIcon },
    { id: 'templates', name: 'Templates', icon: DocumentTextIcon },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <p className="text-green-800">✅ Benchmark Management功能已成功加载！</p>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benchmark Management</h1>
          <p className="mt-2 text-gray-600">
            Import, convert, and manage various benchmark formats for unified testing
          </p>
        </div>
        <button 
          onClick={() => setIsImportOpen(true)} 
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Import Benchmark
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'import' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Supported Formats</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">JSON</span>
                  </div>
                  <p className="text-sm text-gray-600">Standard JSON format with test cases</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">CSV</span>
                  </div>
                  <p className="text-sm text-gray-600">Comma-separated values format</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium">TXT</span>
                  </div>
                  <p className="text-sm text-gray-600">Plain text format with custom parsing</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-medium">Excel</span>
                  </div>
                  <p className="text-sm text-gray-600">Excel files (coming soon)</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-medium">XML</span>
                  </div>
                  <p className="text-sm text-gray-600">XML format (coming soon)</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="font-medium">YAML</span>
                  </div>
                  <p className="text-sm text-gray-600">YAML format (coming soon)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'convert' && (
          <BenchmarkFormatConverter />
        )}

        {activeTab === 'templates' && (
          <BenchmarkTemplateManager />
        )}
      </div>

      {/* Import Modal */}
      <BenchmarkImportForm
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
};

export default BenchmarkManagement; 