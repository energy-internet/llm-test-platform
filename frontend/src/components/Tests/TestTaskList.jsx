// src/components/Tests/TestTaskList.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlayIcon, 
  PauseIcon,
  StopIcon,
  TrashIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import TestProgress from './TestProgress';
import LoadingSpinner from '../Common/LoadingSpinner';
import { apiClient } from '../../utils/api';

const TestTaskList = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['test-tasks', filter],
    queryFn: () => {
      const params = filter !== 'all' ? { status: filter } : {};
      return apiClient.get('/tests/tasks', { params }).then(res => res.data);
    },
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const startTestMutation = useMutation({
    mutationFn: (taskId) => apiClient.post(`/tests/tasks/${taskId}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries(['test-tasks']);
    },
  });

  const stopTestMutation = useMutation({
    mutationFn: (taskId) => apiClient.post(`/tests/tasks/${taskId}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries(['test-tasks']);
    },
  });

  const deleteTestMutation = useMutation({
    mutationFn: (taskId) => apiClient.delete(`/tests/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['test-tasks']);
    },
  });

  const handleStart = (task) => {
    startTestMutation.mutate(task.id);
  };

  const handleStop = (task) => {
    if (window.confirm('Are you sure you want to stop this test?')) {
      stopTestMutation.mutate(task.id);
    }
  };

  const handleDelete = (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.name}"?`)) {
      deleteTestMutation.mutate(task.id);
    }
  };

  const handleViewProgress = (task) => {
    setSelectedTask(task);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <PlayIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'stopped':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      running: 'badge-info',
      completed: 'badge-success',
      failed: 'badge-danger',
      stopped: 'badge-warning'
    };
    return badges[status] || 'badge-warning';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Tests' },
    { value: 'pending', label: 'Pending' },
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
  ];

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
        <h2 className="text-2xl font-bold text-gray-900">Test Tasks</h2>
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

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🧪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No test tasks found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Create your first test task to start evaluating models'
              : `No tests with status "${filter}" found`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tasks.map((task) => (
            <div key={task.id} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {task.benchmark?.name} • {task.models?.length || 0} model(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${getStatusBadge(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">Created: </span>
                    <span className="text-gray-900">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {task.started_at && (
                    <div className="text-sm">
                      <span className="text-gray-600">Started: </span>
                      <span className="text-gray-900">
                        {new Date(task.started_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {task.completed_at && (
                    <div className="text-sm">
                      <span className="text-gray-600">Duration: </span>
                      <span className="text-gray-900">
                        {formatDuration(Math.floor((new Date(task.completed_at) - new Date(task.started_at)) / 1000))}
                      </span>
                    </div>
                  )}
                </div>

                {task.status === 'running' && task.progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(task.progress.percentage)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${task.progress.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {task.progress.completed_cases || 0} / {task.progress.total_cases || 0} test cases
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleStart(task)}
                      disabled={startTestMutation.isLoading}
                      className="btn-success"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Start
                    </button>
                  )}
                  
                  {task.status === 'running' && (
                    <button
                      onClick={() => handleStop(task)}
                      disabled={stopTestMutation.isLoading}
                      className="btn-danger"
                    >
                      <StopIcon className="h-4 w-4 mr-1" />
                      Stop
                    </button>
                  )}

                  <button
                    onClick={() => handleViewProgress(task)}
                    className="btn-primary"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </button>

                  {['completed', 'failed', 'stopped'].includes(task.status) && (
                    <button
                      onClick={() => handleDelete(task)}
                      disabled={deleteTestMutation.isLoading}
                      className="btn-danger"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTask && (
        <TestProgress
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default TestTaskList;