// src/components/Benchmarks/BenchmarkUpload.jsx
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../Common/LoadingSpinner';
import { apiClient } from '../../utils/api';

const BenchmarkUpload = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    benchmark_type: 'custom',
  });
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('name', data.name);
      formDataToSend.append('description', data.description);
      formDataToSend.append('benchmark_type', data.benchmark_type);
      formDataToSend.append('file', data.file);

      return apiClient.post('/benchmarks', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['benchmarks']);
      handleClose();
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Upload failed');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    uploadMutation.mutate({ ...formData, file });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', benchmark_type: 'custom' });
    setFile(null);
    setError('');
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Upload Custom Benchmark
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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="form-label">Benchmark Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="My Custom Benchmark"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-textarea"
                      rows={3}
                      placeholder="Describe what this benchmark tests..."
                    />
                  </div>

                  <div>
                    <label className="form-label">Benchmark Type</label>
                    <select
                      value={formData.benchmark_type}
                      onChange={(e) => setFormData({ ...formData, benchmark_type: e.target.value })}
                      className="form-select"
                    >
                      <option value="custom">Custom</option>
                      <option value="elecbench">ElecBench</option>
                      <option value="engibench">EngiBench</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Upload File</label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${
                        dragActive
                          ? 'border-blue-400 bg-blue-50'
                          : file
                          ? 'border-green-400 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".json,.csv,.txt"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      <div className="text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2">
                          {file ? (
                            <div>
                              <p className="text-sm font-medium text-green-600">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-gray-600">
                                Drop your file here, or{' '}
                                <span className="text-blue-600 font-medium">browse</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Supports JSON, CSV, and TXT files (max 50MB)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">File Format Guidelines</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• <strong>JSON:</strong> {"{ \"test_cases\": [{ \"id\": \"1\", \"input\": \"question\", \"expected_output\": \"answer\" }] }"}</li>
                      <li>• <strong>CSV:</strong> One question per line with columns: id, input, expected_output</li>
                      <li>• <strong>TXT:</strong> One question per line (simple format)</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-secondary"
                      disabled={uploadMutation.isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={uploadMutation.isLoading || !file}
                    >
                      {uploadMutation.isLoading ? <LoadingSpinner size="sm" /> : 'Upload'}
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

export default BenchmarkUpload;