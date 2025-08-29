// src/components/Benchmarks/BenchmarkFormatConverter.jsx
import React, { useState } from 'react';
import { 
  ArrowPathIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const BenchmarkFormatConverter = () => {
  const [sourceFile, setSourceFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('json');
  const [conversionResult, setConversionResult] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [fieldMapping, setFieldMapping] = useState({});

  const supportedFormats = [
    { value: 'json', label: 'JSON', icon: '📄', description: 'Standard JSON format' },
    { value: 'csv', label: 'CSV', icon: '📊', description: 'Comma-separated values' },
    { value: 'txt', label: 'TXT', icon: '📝', description: 'Plain text format' }
  ];

  const predefinedMappings = {
    'mmlu': {
      'question': 'question',
      'answer': 'answer',
      'category': 'category',
      'options': 'options'
    },
    'gsm8k': {
      'question': 'question',
      'answer': 'answer',
      'solution': 'solution'
    },
    'human_eval': {
      'prompt': 'prompt',
      'canonical_solution': 'canonical_solution',
      'test': 'test'
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSourceFile(file);
      setConversionResult(null);
      
      // Auto-detect format and suggest mapping
      const extension = file.name.split('.').pop().toLowerCase();
      if (extension === 'csv') {
        // Try to detect benchmark type from filename
        const filename = file.name.toLowerCase();
        if (filename.includes('mmlu')) {
          setFieldMapping(predefinedMappings.mmlu);
        } else if (filename.includes('gsm8k')) {
          setFieldMapping(predefinedMappings.gsm8k);
        } else if (filename.includes('human_eval')) {
          setFieldMapping(predefinedMappings.human_eval);
        }
      }
    }
  };

  const handleConvert = async () => {
    if (!sourceFile) return;

    setIsConverting(true);
    try {
      // Simulate conversion process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock conversion result
      setConversionResult({
        success: true,
        originalFormat: sourceFile.name.split('.').pop(),
        targetFormat: targetFormat,
        originalSize: sourceFile.size,
        convertedSize: Math.floor(sourceFile.size * 0.8),
        testCases: Math.floor(Math.random() * 1000) + 100,
        preview: {
          format: targetFormat,
          content: `{
  "benchmark_name": "${sourceFile.name.split('.')[0]}",
  "version": "1.0",
  "test_cases": [
    {
      "id": "test_001",
      "question": "Sample question here",
      "answer": "Sample answer",
      "category": "general"
    }
  ]
}`
        }
      });
    } catch (error) {
      setConversionResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!conversionResult) return;
    
    const blob = new Blob([conversionResult.preview.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_benchmark.${targetFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Format Converter</h2>
        <p className="text-gray-600 mb-6">
          Convert benchmark files between different formats for unified testing
        </p>

        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".json,.csv,.txt"
                  className="hidden"
                  id="converter-file-upload"
                />
                <label htmlFor="converter-file-upload" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500 font-medium">
                    Choose a file
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                JSON, CSV, TXT files supported
              </p>
            </div>
          </div>

          {sourceFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{sourceFile.name}</h4>
                  <p className="text-sm text-gray-600">
                    Size: {(sourceFile.size / 1024).toFixed(2)} KB | 
                    Format: {sourceFile.name.split('.').pop().toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSourceFile(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          )}

          {/* Target Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {supportedFormats.map(format => (
                <div
                  key={format.value}
                  onClick={() => setTargetFormat(format.value)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    targetFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-2">{format.icon}</span>
                    <span className="font-medium">{format.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{format.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Field Mapping */}
          {sourceFile && Object.keys(fieldMapping).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Mapping
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(fieldMapping).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">{key}:</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setFieldMapping(prev => ({
                          ...prev,
                          [key]: e.target.value
                        }))}
                        className="form-input flex-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Convert Button */}
          <div className="flex justify-center">
            <button
              onClick={handleConvert}
              disabled={!sourceFile || isConverting}
              className="btn-primary flex items-center"
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${isConverting ? 'animate-spin' : ''}`} />
              {isConverting ? 'Converting...' : 'Convert Format'}
            </button>
          </div>
        </div>

        {/* Conversion Result */}
        {conversionResult && (
          <div className="mt-6 border-t pt-6">
            <div className={`rounded-lg p-4 ${
              conversionResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center mb-4">
                {conversionResult.success ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
                )}
                <h3 className="font-medium text-gray-900">
                  {conversionResult.success ? 'Conversion Successful' : 'Conversion Failed'}
                </h3>
              </div>

              {conversionResult.success ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Original Format:</span>
                      <p className="font-medium">{conversionResult.originalFormat.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Target Format:</span>
                      <p className="font-medium">{conversionResult.targetFormat.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Test Cases:</span>
                      <p className="font-medium">{conversionResult.testCases}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Size Reduction:</span>
                      <p className="font-medium">
                        {Math.round((1 - conversionResult.convertedSize / conversionResult.originalSize) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                    <pre className="bg-white border rounded-lg p-4 text-xs overflow-auto max-h-64">
                      {conversionResult.preview.content}
                    </pre>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleDownload}
                      className="btn-secondary flex items-center"
                    >
                      <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                      Download Converted File
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-red-700">{conversionResult.error}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkFormatConverter; 