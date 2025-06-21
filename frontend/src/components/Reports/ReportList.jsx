// src/components/Reports/ReportList.jsx
import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  ArrowDownTrayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ReportViewer from './ReportViewer';
import LoadingSpinner from '../Common/LoadingSpinner';
import { api, handleApiError } from '../../utils/api';

const ReportList = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError('');
        const params = filter !== 'all' ? { report_type: filter } : {};
        const response = await api.get('/reports', { params });
        setReports(response.data || []);
      } catch (err) {
        setError(handleApiError(err));
        setReports([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filter]);

  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleDownloadReport = async (report) => {
    try {
      // This endpoint needs to be implemented in the backend
      alert('Download functionality is not yet implemented.');
    } catch (err) {
      alert(`Failed to download report: ${handleApiError(err)}`);
    }
  };

  const getReportIcon = (type) => {
    const icons = {
      comparison: '📊',
      performance: '⚡',
      summary: '📋',
      detailed: '📈'
    };
    return icons[type] || '📄';
  };

  const filterOptions = [
    { value: 'all', label: 'All Reports' },
    { value: 'comparison', label: 'Comparison' },
    { value: 'performance', label: 'Performance' },
    { value: 'summary', label: 'Summary' },
    { value: 'detailed', label: 'Detailed' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <h3 className="text-lg font-medium">Failed to load reports</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Evaluation Reports</h2>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-select w-auto"
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports available</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Complete some test tasks to generate evaluation reports'
              : `No ${filter} reports found`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div key={report.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getReportIcon(report.report_type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {report.report_type} Report
                      </p>
                    </div>
                  </div>
                </div>

                {report.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {report.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Test Task: </span>
                    <span className="text-gray-900">
                      {report.test_task?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Models: </span>
                    <span className="badge badge-info">
                      {report.models_count || 0}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Generated: </span>
                    <span className="text-gray-900">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {report.metrics && (
                    <div className="text-sm">
                      <span className="text-gray-600">Avg Score: </span>
                      <span className={`badge ${
                        report.metrics.average_score >= 80 ? 'badge-success' :
                        report.metrics.average_score >= 60 ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {report.metrics.average_score?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewReport(report)}
                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="flex items-center justify-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportViewer
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};

export default ReportList;