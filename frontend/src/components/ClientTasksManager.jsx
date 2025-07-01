import React, { useState, useEffect } from 'react';
import {
  Add as Plus,
  Edit,
  Delete as Trash2,
  AccessTime as Clock,
  LocalOffer as Tag,
  Warning as AlertCircle
} from '@mui/icons-material';
import { api } from '../services/api';

const ClientTasksManager = ({ clientId, isOpen, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [newTask, setNewTask] = useState({
    task_name: '',
    task_category: 'personal_care',
    description: '',
    frequency: 'daily',
    estimated_duration_minutes: '',
    special_instructions: '',
    is_mandatory: false
  });

  const taskCategories = [
    { value: 'personal_care', label: 'Personal Care', color: 'bg-pink-100 text-pink-800' },
    { value: 'domestic', label: 'Domestic', color: 'bg-blue-100 text-blue-800' },
    { value: 'medication', label: 'Medication', color: 'bg-red-100 text-red-800' },
    { value: 'social', label: 'Social', color: 'bg-green-100 text-green-800' },
    { value: 'mobility', label: 'Mobility', color: 'bg-purple-100 text-purple-800' },
    { value: 'nutrition', label: 'Nutrition', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi_weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as_needed', label: 'As Needed' }
  ];

  const taskTemplates = {
    personal_care: [
      'Bath/Shower Assistance',
      'Personal Hygiene Support',
      'Dressing/Undressing',
      'Toileting Assistance',
      'Grooming'
    ],
    domestic: [
      'Light Cleaning',
      'Laundry',
      'Shopping',
      'Meal Preparation',
      'Dishwashing'
    ],
    medication: [
      'Medication Administration',
      'Medication Reminders',
      'Medication Monitoring'
    ],
    social: [
      'Companionship',
      'Social Activities',
      'Family Contact',
      'Emotional Support'
    ],
    mobility: [
      'Mobility Assistance',
      'Transfer Assistance',
      'Light Exercise',
      'Physiotherapy Support'
    ],
    nutrition: [
      'Meal Preparation',
      'Feeding Assistance',
      'Dietary Monitoring',
      'Hydration Monitoring'
    ]
  };

  useEffect(() => {
    if (isOpen && clientId) {
      fetchTasks();
    }
  }, [isOpen, clientId]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/clients/${clientId}/tasks`);
      if (response.data.success) {
        setTasks(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/clients/${clientId}/tasks`, newTask);
      if (response.data.success) {
        setTasks([...tasks, response.data.data]);
        setNewTask({
          task_name: '',
          task_category: 'personal_care',
          description: '',
          frequency: 'daily',
          estimated_duration_minutes: '',
          special_instructions: '',
          is_mandatory: false
        });
        setShowAddTask(false);
      }
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err.response?.data?.error || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/clients/${clientId}/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const getCategoryInfo = (category) => {
    return taskCategories.find(cat => cat.value === category) || taskCategories[taskCategories.length - 1];
  };

  const handleTemplateSelect = (template) => {
    setNewTask(prev => ({
      ...prev,
      task_name: template
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Client Tasks</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddTask(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus style={{fontSize: 16}} />
              <span>Add Task</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-b">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Add Task Form */}
        {showAddTask && (
          <div className="p-6 bg-gray-50 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Task</h3>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Category *
                  </label>
                  <select
                    value={newTask.task_category}
                    onChange={(e) => setNewTask(prev => ({ ...prev, task_category: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {taskCategories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency *
                  </label>
                  <select
                    value={newTask.frequency}
                    onChange={(e) => setNewTask(prev => ({ ...prev, frequency: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {frequencyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Task Templates */}
              {taskTemplates[newTask.task_category] && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Templates (click to use):
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {taskTemplates[newTask.task_category].map(template => (
                      <button
                        key={template}
                        type="button"
                        onClick={() => handleTemplateSelect(template)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Name *
                </label>
                <input
                  type="text"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, task_name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newTask.estimated_duration_minutes}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimated_duration_minutes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 30"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    checked={newTask.is_mandatory}
                    onChange={(e) => setNewTask(prev => ({ ...prev, is_mandatory: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Mandatory task
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  value={newTask.special_instructions}
                  onChange={(e) => setNewTask(prev => ({ ...prev, special_instructions: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter any special instructions"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="p-6">
          {loading && tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tasks added yet.</p>
              <button
                onClick={() => setShowAddTask(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Add the first task
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => {
                const categoryInfo = getCategoryInfo(task.task_category);
                return (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{task.task_name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${categoryInfo.color}`}>
                            {categoryInfo.label}
                          </span>
                          {task.is_mandatory && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full flex items-center">
                              <AlertCircle style={{fontSize: 12}} className="mr-1" />
                              Mandatory
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Tag style={{fontSize: 14}} className="mr-1" />
                            {frequencyOptions.find(f => f.value === task.frequency)?.label}
                          </span>
                          {task.estimated_duration_minutes && (
                            <span className="flex items-center">
                              <Clock style={{fontSize: 14}} className="mr-1" />
                              {task.estimated_duration_minutes} min
                            </span>
                          )}
                        </div>
                        
                        {task.special_instructions && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                            <strong>Special Instructions:</strong> {task.special_instructions}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit style={{fontSize: 16}} />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 style={{fontSize: 16}} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientTasksManager;
