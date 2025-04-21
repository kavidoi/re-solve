import React, { useState } from 'react';

const AddFriendModal = ({ isOpen, onClose, onSendRequest }) => {
  const [identifier, setIdentifier] = useState(''); // Can be email, username, etc.
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setIdentifier(e.target.value);
    if (error) setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter an email or username.');
      return;
    }
    setLoading(true);
    setError('');
    // Call the handler passed from Dashboard, which will handle the API call
    await onSendRequest(identifier);
    setLoading(false);
    // Keep modal open on error (handled in Dashboard), close on success (handled in Dashboard)
  };

  const handleClose = () => {
    setIdentifier(''); // Reset state on close
    setError('');
    setLoading(false);
    onClose();
  };

  // Prevent rendering if not open
  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleClose} // Close on backdrop click
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm shadow-xl border border-accent dark:border-gray-700" 
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold dark:text-white">Add Friend</h2>
          <button 
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
            onClick={handleClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter the email address or username of the friend you want to add.
          </p>
          <div className="mb-4">
            <label htmlFor="friendIdentifier" className="sr-only">Email or Username</label>
            <input 
              type="text" 
              id="friendIdentifier"
              value={identifier}
              onChange={handleInputChange}
              placeholder="friend@example.com or friend_username"
              className="input w-full bg-secondary dark:bg-gray-700 border-accent dark:border-gray-600 dark:text-white"
              required
              aria-describedby="identifier-error"
            />
            {error && <p id="identifier-error" className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
                    
          <div className="flex space-x-3 mt-6">
            <button 
              type="button" 
              onClick={handleClose}
              className="flex-1 bg-secondary dark:bg-gray-700 hover:bg-accent dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 btn btn-primary bg-primary hover:bg-indigo-700 text-white rounded-lg py-2 transition" 
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriendModal; 