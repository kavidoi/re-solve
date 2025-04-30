import React, { useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  // Add more languages here
];

export default function Settings({ currentLang = 'en', onLanguageChange, onPasswordChange }) {
  const [selectedLang, setSelectedLang] = useState(currentLang);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLangChange = (e) => {
    setSelectedLang(e.target.value);
    onLanguageChange && onLanguageChange(e.target.value);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }
    // Call parent or API to change password
    onPasswordChange && onPasswordChange(oldPassword, newPassword, setMessage);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      {/* Language Selector */}
      <div className="mb-6">
        <label className="block mb-2 font-semibold">Default Language</label>
        <select
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          value={selectedLang}
          onChange={handleLangChange}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>{lang.label}</option>
          ))}
        </select>
      </div>
      {/* Change Password */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <label className="block font-semibold">Change Password</label>
        <input
          type="password"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          placeholder="Old Password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark">
          Change Password
        </button>
        {message && <div className="mt-2 text-red-500">{message}</div>}
      </form>
    </div>
  );
}
