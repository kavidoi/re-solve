import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // TODO: Add function to store user data/token (e.g., in context or state management)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      console.log('Registration API success:', response.data);
      
      console.log('Calling login function with:', response.data);
      login(response.data);
      console.log('Called login function. Check localStorage.');

      navigate('/'); // Redirect to dashboard on successful registration
    } catch (err) {
      console.error('Registration error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-full max-w-md border border-accent dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 dark:text-white">Register</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-500 dark:text-gray-400 mb-2">Name</label>
            <input 
              type="text" 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full bg-secondary dark:bg-gray-700 border-accent dark:border-gray-600 dark:text-white" 
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-500 dark:text-gray-400 mb-2">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full bg-secondary dark:bg-gray-700 border-accent dark:border-gray-600 dark:text-white" 
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-500 dark:text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full bg-secondary dark:bg-gray-700 border-accent dark:border-gray-600 dark:text-white"
              required
              minLength={6}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary w-full bg-primary hover:bg-indigo-700 text-white py-2 rounded-lg transition" 
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 