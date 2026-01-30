import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ImageManager from './ImageManager';

interface ImageGalleryProps {
  onLogout: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onLogout }) => {
  const [allImages, setAllImages] = useState<string[]>([]);
  const [usedImages, setUsedImages] = useState<string[]>([]);
  const [unusedImages, setUnusedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch all products to get used images
      const productsResponse = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const products = productsResponse.data;
      const usedImageSet = new Set<string>();
      
      // Collect all used images from products
      products.forEach((product: any) => {
        if (product.image && product.image !== 'https://via.placeholder.com/300x400?text=No+Image') {
          usedImageSet.add(product.image);
        }
        if (product.images && Array.isArray(product.images)) {
          product.images.forEach((img: string) => {
            if (img && img !== 'https://via.placeholder.com/300x400?text=No+Image') {
              usedImageSet.add(img);
            }
          });
        }
      });

      const usedImagesArray = Array.from(usedImageSet);
      setAllImages(usedImagesArray);
      setUsedImages(usedImagesArray);
      setUnusedImages([]);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const handleUnusedImagesChange = (images: string[]) => {
    setUnusedImages(images);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Image Management</h1>
            <p className="text-gray-600 mt-1">Manage unused images and clean up storage</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-start">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Total Images</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{allImages.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Used Images</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{usedImages.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900">Unused Images</h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">{unusedImages.length}</p>
              </div>
            </div>

            {/* Used Images Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold mb-4">
                Used Images ({usedImages.length})
              </h2>
              
              <p className="text-sm text-gray-600 mb-4">
                These images are currently being used by products and cannot be deleted.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {usedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={image.startsWith('http') ? image : `http://localhost:5001${image}`}
                        alt={`Used image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Error';
                        }}
                      />
                    </div>
                    
                    {/* Protected Badge */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      In Use
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;