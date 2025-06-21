// src/pages/Benchmarks.jsx
import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import BenchmarkList from '../components/Benchmarks/BenchmarkList';
import BenchmarkUpload from '../components/Benchmarks/BenchmarkUpload';

const Benchmarks = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benchmarks</h1>
          <p className="mt-2 text-gray-600">
            Manage evaluation benchmarks and test datasets
          </p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)} 
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Upload Benchmark
        </button>
      </div>

      <BenchmarkList />

      <BenchmarkUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};

export default Benchmarks;