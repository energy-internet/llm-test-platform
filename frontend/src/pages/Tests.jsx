// src/pages/Tests.jsx
import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import TestTaskList from '../components/Tests/TestTaskList';
import TestTaskForm from '../components/Tests/TestTaskForm';

const Tests = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Tasks</h1>
          <p className="mt-2 text-gray-600">
            Create and manage model evaluation test tasks
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)} 
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Test
        </button>
      </div>

      <TestTaskList />

      <TestTaskForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default Tests;