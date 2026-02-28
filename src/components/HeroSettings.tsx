import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface HeroSettings {
  type: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
}

const HeroSettings: React.FC = () => {
  const [settings, setSettings] = useState<HeroSettings>({
    type: 'hero',
    title: 'OUR COLLECTION',
    subtitle: 'Minimalist luxury fashion designed for the modern individual',
    image: '',
    ctaText: 'Shop Now',
    ctaLink: '/women',
    enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    try {
      const response = await axios.get('/api/settings/hero');
      setSettings(response.data);
    } catch (err) {
      console.error('Error fetching hero settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('images', file);

      const response = await axios.post('/api/settings/hero/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSettings({ ...settings, image: response.data.imageUrl });
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      await axios.put('/api/settings/hero', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Hero settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading hero settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Hero Section Settings</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">×</button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-start">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700">×</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div>
            <label className="font-medium text-gray-700">Enable Hero Section</label>
            <p className="text-sm text-gray-500">Show or hide the hero section on the homepage</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="enabled"
              checked={settings.enabled}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
          <input
            type="text"
            name="title"
            value={settings.title}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500"
            placeholder="Enter hero title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
          <textarea
            name="subtitle"
            value={settings.subtitle}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500"
            placeholder="Enter hero subtitle"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
          <div className="space-y-4">
            {settings.image && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={settings.image.startsWith('http') ? settings.image : settings.image}
                  alt="Hero preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, image: '' })}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <span className="text-sm text-gray-500">Recommended: 1920x1080px or larger</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              name="ctaText"
              value={settings.ctaText}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500"
              placeholder="Shop Now"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
            <select
              name="ctaLink"
              value={settings.ctaLink}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500"
            >
              <option value="/women">Women</option>
              <option value="/men">Men</option>
              <option value="/kids">Kids</option>
              <option value="/unisex">Unisex</option>
              <option value="/cart">Cart</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Hero Settings'}
          </button>
        </div>
      </form>

      {/* Preview Section */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-medium mb-4">Live Preview</h3>
        <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
          {settings.image ? (
            <img
              src={settings.image.startsWith('http') ? settings.image : settings.image}
              alt="Hero"
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-600"></div>
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-center px-4"
            >
              {settings.title || 'YOUR TITLE'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm md:text-base text-gray-200 text-center max-w-md px-4 mb-4"
            >
              {settings.subtitle || 'Your subtitle will appear here'}
            </motion.p>
            {settings.enabled && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white text-black px-6 py-2 rounded-md font-medium"
              >
                {settings.ctaText || 'Shop Now'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSettings;
