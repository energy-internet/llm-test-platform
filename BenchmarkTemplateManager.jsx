// src/components/Benchmarks/BenchmarkTemplateManager.jsx
import React, { useState } from 'react';
import { 
  PlusIcon,
  DocumentTextIcon,
  CogIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BenchmarkTemplateManager = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: 'MMLU Template',
      description: 'Template for Massive Multitask Language Understanding benchmark',
      format: 'json',
      fields: ['question', 'answer', 'category', 'options'],
      sample: {
        question: "What is the capital of France?",
        answer: "Paris",
        category: "geography",
        options: ["London", "Paris", "Berlin", "Madrid"]
      },
      usage_count: 45
    },
    {
      id: 2,
      name: 'GSM8K Template',
      description: 'Template for Grade School Math 8K benchmark',
      format: 'json',
      fields: ['question', 'answer', 'solution'],
      sample: {
        question: "Janet's dogs eat 2 pounds of food each week. How many pounds of food do they eat in 4 weeks?",
        answer: "8",
        solution: "2 pounds per week × 4 weeks = 8 pounds"
      },
      usage_count: 32
    },
    {
      id: 3,
      name: 'HumanEval Template',
      description: 'Template for HumanEval code generation benchmark',
      format: 'json',
      fields: ['prompt', 'canonical_solution', 'test'],
      sample: {
        prompt: "def add_numbers(a, b):\n    \"\"\"Add two numbers together.\"\"\"",
        canonical_solution: "return a + b",
        test: "assert add_numbers(1, 2) == 3"
      },
      usage_count: 28
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleCreateTemplate = (templateData) => {
    const newTemplate = {
      id: Date.now(),
      ...templateData,
      usage_count: 0
    };
    setTemplates(prev => [...prev, newTemplate]);
    setIsCreateModalOpen(false);
  };

  const handleEditTemplate = (templateData) => {
    setTemplates(prev => prev.map(t => 
      t.id === selectedTemplate.id ? { ...t, ...templateData } : t
    ));
    setIsEditModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleUseTemplate = (template) => {
    // This would typically navigate to the import form with template pre-filled
    console.log('Using template:', template);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Benchmark Templates</h2>
            <p className="text-gray-600 mt-1">
              Predefined templates for common benchmark formats
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Template
          </button>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.format.toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsPreviewModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Preview"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsEditModalOpen(true);
                    }}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">{template.description}</p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Required Fields:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.fields.map((field) => (
                    <span
                      key={field}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Used {template.usage_count} times
                </div>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="btn-secondary text-sm"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new benchmark template.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {isCreateModalOpen && (
        <CreateTemplateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTemplate}
        />
      )}

      {/* Edit Template Modal */}
      {isEditModalOpen && selectedTemplate && (
        <EditTemplateModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onSubmit={handleEditTemplate}
        />
      )}

      {/* Preview Template Modal */}
      {isPreviewModalOpen && selectedTemplate && (
        <PreviewTemplateModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};

// Create Template Modal Component
const CreateTemplateModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    format: 'json',
    fields: [''],
    sample: {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, '']
    }));
  };

  const removeField = (index) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? value : field)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create Template</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <PlusIcon className="h-6 w-6 transform rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input w-full"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={formData.format}
              onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value }))}
              className="form-select w-full"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="txt">TXT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Fields
            </label>
            <div className="space-y-2">
              {formData.fields.map((field, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={field}
                    onChange={(e) => updateField(index, e.target.value)}
                    className="form-input flex-1"
                    placeholder="Field name"
                    required
                  />
                  {formData.fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addField}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + Add Field
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Template
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Template Modal Component
const EditTemplateModal = ({ isOpen, onClose, template, onSubmit }) => {
  const [formData, setFormData] = useState(template);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Edit Template</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <PlusIcon className="h-6 w-6 transform rotate-45" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="form-input w-full"
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
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Preview Template Modal Component
const PreviewTemplateModal = ({ isOpen, onClose, template }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Template Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <PlusIcon className="h-6 w-6 transform rotate-45" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sample Data Structure</h4>
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-64">
              {JSON.stringify(template.sample, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Fields</h4>
            <div className="flex flex-wrap gap-2">
              {template.fields.map((field) => (
                <span
                  key={field}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarkTemplateManager; 