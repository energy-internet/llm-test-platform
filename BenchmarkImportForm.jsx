// src/components/Benchmarks/BenchmarkImportForm.jsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  XMarkIcon, 
  ArrowUpTrayIcon,
  DocumentTextIcon,
  CogIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../utils/apiClient';

const BenchmarkImportForm = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benchmark_type: 'custom',
    source_format: '',
    target_format: 'json',
    file: null,
    conversion_config: {}
  });
  const [preview, setPreview] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  const queryClient = useQueryClient();

  const supportedFormats = [
    { value: 'json', label: 'JSON', icon: '📄' },
    { value: 'csv', label: 'CSV', icon: '📊' },
    { value: 'txt', label: 'TXT', icon: '📝' },
    { value: 'excel', label: 'Excel', icon: '📈', disabled: true },
    { value: 'xml', label: 'XML', icon: '🔗', disabled: true },
    { value: 'yaml', label: 'YAML', icon: '⚙️', disabled: true }
  ];

  const benchmarkTypes = [
    { value: 'custom', label: 'Custom Benchmark' },
    { value: 'elecbench', label: 'ElecBench' },
    { value: 'engibench', label: 'EngiBench' },
    { value: 'mmlu', label: 'MMLU' },
    { value: 'gsm8k', label: 'GSM8K' },
    { value: 'human_eval', label: 'HumanEval' }
  ];

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('description', data.description);
      formDataToSend.append('benchmark_type', data.benchmark_type);
      formDataToSend.append('source_format', data.source_format);
      formDataToSend.append('target_format', data.target_format);
      formDataToSend.append('file', data.file);
      formDataToSend.append('conversion_config', JSON.stringify(data.conversion_config));
      
      return apiClient.post('/benchmarks/import', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['benchmarks']);
      onClose();
      setStep(1);
      setFormData({
        name: '',
        description: '',
        benchmark_type: 'custom',
        source_format: '',
        target_format: 'json',
        file: null,
        conversion_config: {}
      });
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      
      // Auto-detect format
      const extension = file.name.split('.').pop().toLowerCase();
      const formatMap = {
        'json': 'json',
        'csv': 'csv',
        'txt': 'txt',
        'xlsx': 'excel',
        'xls': 'excel',
        'xml': 'xml',
        'yaml': 'yaml',
        'yml': 'yaml'
      };
      
      if (formatMap[extension]) {
        setFormData(prev => ({ ...prev, source_format: formatMap[extension] }));
      }
      
      // Preview file content
      previewFile(file);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      setPreview({
        name: file.name,
        size: file.size,
        content: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
        format: file.name.split('.').pop().toLowerCase()
      });
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }
    
    if (step === 2) {
      setStep(3);
      return;
    }
    
    // Final submission
    uploadMutation.mutate(formData);
  };

  const handleFormatConversion = async () => {
    setIsConverting(true);
    try {
      // Simulate format conversion
      await new Promise(resolve => setTimeout(resolve, 2000));
      setFormData(prev => ({ ...prev, target_format: 'json' }));
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Import Benchmark</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= stepNumber ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benchmark Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input w-full"
                  placeholder="Enter benchmark name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-textarea w-full"
                  rows={3}
                  placeholder="Describe the benchmark purpose and content"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benchmark Type
                </label>
                <select
                  value={formData.benchmark_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, benchmark_type: e.target.value }))}
                  className="form-select w-full"
                >
                  {benchmarkTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: File Upload and Format Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Benchmark File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".json,.csv,.txt,.xlsx,.xls,.xml,.yaml,.yml"
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-500 font-medium">
                        Choose a file
                      </span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    JSON, CSV, TXT up to 10MB
                  </p>
                </div>
              </div>

              {preview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">File Preview</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>Name:</strong> {preview.name}</p>
                    <p><strong>Size:</strong> {(preview.size / 1024).toFixed(2)} KB</p>
                    <p><strong>Format:</strong> {preview.format}</p>
                    <div className="mt-2">
                      <p><strong>Content Preview:</strong></p>
                      <pre className="bg-white p-2 rounded border text-xs overflow-auto max-h-32">
                        {preview.content}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source Format
                  </label>
                  <select
                    value={formData.source_format}
                    onChange={(e) => setFormData(prev => ({ ...prev, source_format: e.target.value }))}
                    className="form-select w-full"
                    required
                  >
                    <option value="">Select format</option>
                    {supportedFormats.map(format => (
                      <option key={format.value} value={format.value} disabled={format.disabled}>
                        {format.icon} {format.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Format
                  </label>
                  <select
                    value={formData.target_format}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_format: e.target.value }))}
                    className="form-select w-full"
                  >
                    {supportedFormats.filter(f => !f.disabled).map(format => (
                      <option key={format.value} value={format.value}>
                        {format.icon} {format.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Conversion Configuration */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CogIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <h4 className="font-medium text-blue-900">Format Conversion</h4>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Converting from {formData.source_format.toUpperCase()} to {formData.target_format.toUpperCase()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversion Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Validate data structure</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Normalize field names</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Remove duplicate entries</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Mapping (Optional)
                  </label>
                  <textarea
                    className="form-textarea w-full"
                    rows={4}
                    placeholder="Define custom field mappings in JSON format"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="btn-secondary"
            >
              {step === 1 ? 'Cancel' : 'Previous'}
            </button>
            
            <div className="flex space-x-2">
              {step === 2 && formData.source_format !== formData.target_format && (
                <button
                  type="button"
                  onClick={handleFormatConversion}
                  disabled={isConverting}
                  className="btn-secondary flex items-center"
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  {isConverting ? 'Converting...' : 'Convert Format'}
                </button>
              )}
              
              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="btn-primary"
              >
                {step === 3 ? (uploadMutation.isPending ? 'Importing...' : 'Import Benchmark') : 'Next'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BenchmarkImportForm; 