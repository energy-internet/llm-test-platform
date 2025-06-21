// src/pages/Reports.jsx
import React from 'react';
import { ChartBarIcon } from '@heroicons/react/24/outline';
import ReportList from '../components/Reports/ReportList';

const Reports = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Evaluation Reports</h1>
          <p className="mt-2 text-gray-600">
            View and analyze model evaluation results and performance metrics
          </p>
        </div>
        <div className="flex items-center text-gray-500">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">Reports are generated automatically after test completion</span>
        </div>
      </div>

      <ReportList />
    </div>
  );
};

export default Reports;