// src/components/Models/ModelTestDialog.jsx
import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import LoadingSpinner from '../Common/LoadingSpinner';
import { apiClient } from '../../utils/api';

const ModelTestDialog = ({ provider, isOpen, onClose }) => {
  const [testMessage, setTestMessage] = useState('Hello, this is a test message. Please respond.');
  const [testResult, setTestResult] = useState(null);

  const testMutation = useMutation({
    mutationFn: (data) => 
      apiClient.post(`/model-providers/providers/${provider.id}/test`, data),
    onSuccess: (response) => {
      setTestResult(response.data);
    },
    onError: (error) => {
      setTestResult({
        success: false,
        error: error.response?.data?.detail || error.message,
        response_time: null,
        model_info: null
      });
    }
  });

  const handleTest = () => {
    setTestResult(null);
    testMutation.mutate({
      provider_id: provider.id,
      test_message: testMessage
    });
  };

  const handleClose = () => {
    setTestResult(null);
    setTestMessage('Hello, this is a test message. Please respond.');
    onClose();
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Test {provider.name}
                  </Dialog.Title>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="form-label">Test Message</label>
                    <textarea
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="form-textarea"
                      rows={3}
                      placeholder="Enter a test message to send to the model..."
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Provider:</span> {provider.name} ({provider.provider_type})
                    </div>
                    <button
                      onClick={handleTest}
                      disabled={testMutation.isLoading || !testMessage.trim()}
                      className="btn-primary"
                    >
                      {testMutation.isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </button>
                  </div>

                  {testResult && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Test Results</h4>
                      
                      <div className={`p-4 rounded-lg border ${
                        testResult.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex items-center mb-2">
                          <div className={`h-3 w-3 rounded-full mr-2 ${
                            testResult.success ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span className={`font-medium ${
                            testResult.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                          </span>
                        </div>

                        {testResult.response_time && (
                          <div className="text-sm text-gray-600 mb-2">
                            Response time: {testResult.response_time.toFixed(3)}s
                          </div>
                        )}

                        {testResult.error && (
                          <div className="text-sm text-red-700 mb-2 whitespace-pre-wrap overflow-auto max-h-32 border border-red-200 p-2 rounded bg-red-50">
                            <strong>Error:</strong> {testResult.error}
                          </div>
                        )}

                        {testResult.model_info && (
                          <div className="mt-3">
                            <div className="text-sm text-gray-600 mb-1">
                              <strong>Model:</strong> {testResult.model_info.model}
                            </div>
                            {testResult.model_info.response && (
                              <div className="mt-2">
                                <div className="text-sm text-gray-600 mb-1">
                                  <strong>Response:</strong>
                                </div>
                                <div className="bg-white p-3 rounded border text-sm">
                                  {testResult.model_info.response}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    onClick={handleClose}
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

export default ModelTestDialog;