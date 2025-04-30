import React, { useState, useEffect } from 'react';

const EditExpenseModal = ({ isOpen, onClose, expenseId, currentDescription, onUpdate }) => {
  const [description, setDescription] = useState(currentDescription || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDescription(currentDescription || '');
      setError('');
    }
  }, [isOpen, currentDescription]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Description cannot be empty');
      return;
    }
    setLoading(true);
    try {
      await onUpdate(expenseId, description.trim());
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-500 dark:text-gray-400 mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-secondary dark:bg-gray-700 border border-accent dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
