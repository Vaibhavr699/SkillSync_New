// components/projects/ProjectFilters.jsx
import React, { useState } from 'react';
import { 
  FunnelIcon, 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const statusOptions = ['', 'open', 'in-progress', 'completed', 'cancelled'];
const tagOptions = ['Frontend', 'Backend', 'Design', 'Bug', 'Feature', 'Mobile', 'API', 'Database', 'DevOps', 'UI/UX'];

const ProjectFilters = ({ initialFilters = {}, onApply, onCancel }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    tags: initialFilters.tags || [],
    minBudget: initialFilters.minBudget || '',
    maxBudget: initialFilters.maxBudget || '',
    deadline: initialFilters.deadline || '',
  });

  const toggleTag = (tag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ status: '', tags: [], minBudget: '', maxBudget: '', deadline: '' });
    if (onApply) onApply({ status: '', tags: [], minBudget: '', maxBudget: '', deadline: '' });
  };

  const handleApply = () => {
    if (onApply) onApply(filters);
    setIsOpen(false);
  };

  const activeFiltersCount = (filters.tags.length > 0 ? 1 : 0) + 
    (filters.status ? 1 : 0) + 
    (filters.minBudget ? 1 : 0) + 
    (filters.maxBudget ? 1 : 0) + 
    (filters.deadline ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center">
          <FunnelIcon className="w-5 h-5 mr-2 text-gray-600" />
          <span className="font-medium text-gray-900">Advanced Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-black text-white text-xs px-2 py-1 rounded-full font-medium">
              {activeFiltersCount} active
            </span>
          )}
        </div>
        {isOpen ? <ChevronUpIcon className="w-5 h-5 text-gray-600" /> : <ChevronDownIcon className="w-5 h-5 text-gray-600" />}
      </button>

      {isOpen && (
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-gray-500" />
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm bg-white dark:bg-indigo-950 dark:text-white dark:border-indigo-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              >
                <option value="">All Statuses</option>
                {statusOptions.filter(opt => opt).map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-500" />
                Min Budget
              </label>
              <input
                type="number"
                name="minBudget"
                value={filters.minBudget}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm bg-white dark:bg-indigo-950 dark:text-white dark:border-indigo-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                placeholder="₹0"
                min="0"
              />
            </div>

            {/* Max Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 mr-2 text-gray-500" />
                Max Budget
              </label>
              <input
                type="number"
                name="maxBudget"
                value={filters.maxBudget}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm bg-white dark:bg-indigo-950 dark:text-white dark:border-indigo-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                placeholder="No limit"
                min="0"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                Deadline Before
              </label>
              <input
                type="date"
                name="deadline"
                value={filters.deadline}
                onChange={handleChange}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-sm bg-white dark:bg-indigo-950 dark:text-white dark:border-indigo-700 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-900 mb-3 flex items-center">
              <TagIcon className="w-4 h-4 mr-2 text-gray-500" />
              Skills & Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 flex items-center ${
                    filters.tags.includes(tag)
                      ? 'bg-black border-black text-white dark:bg-indigo-700 dark:border-indigo-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:bg-indigo-950 dark:border-indigo-700 dark:text-white dark:hover:bg-indigo-900'
                  }`}
                >
                  {filters.tags.includes(tag) && (
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                  )}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end mt-8 space-x-3">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 dark:bg-indigo-950 dark:text-white dark:border-indigo-700 dark:hover:bg-indigo-900 dark:focus:ring-indigo-400"
            >
              <XMarkIcon className="w-4 h-4 mr-2" />
              Clear All
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 dark:bg-indigo-700 dark:hover:bg-indigo-900 dark:focus:ring-indigo-400"
            >
              Apply Filters
            </button>
            {onCancel && (
              <button 
                type="button" 
                onClick={onCancel} 
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 dark:bg-indigo-950 dark:text-white dark:border-indigo-700 dark:hover:bg-indigo-900 dark:focus:ring-indigo-400"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectFilters;