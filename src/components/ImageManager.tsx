import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface ImageManagerProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onDeleteImage?: (imagePath: string) => void;
  className?: string;
}

const ImageManager: React.FC<ImageManagerProps> = ({ 
  images, 
  onImagesChange, 
  onDeleteImage,
  className = '' 
}) => {
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteImage = async (imagePath: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setDeletingImage(imagePath);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      
      // Extract image name from path
      const imageName = imagePath.split('/').pop() || imagePath;
      
      const response = await axios.delete(`/api/admin/images/${imageName}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        const newImages = images.filter(img => img !== imagePath);
        onImagesChange(newImages);
        onDeleteImage?.(imagePath);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete image';
      setError(errorMessage);
      
      // If the error is about image being used by products, show that info
      if (error.response?.data?.products) {
        const products = error.response.data.products;
        setError(`${errorMessage}: ${products.join(', ')}`);
      }
    } finally {
      setDeletingImage(null);
    }
  };

  const handleBulkDelete = async () => {
    if (images.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete all ${images.length} images?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.delete('/api/admin/images', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: { imagePaths: images }
      });

      if (response.status === 200) {
        onImagesChange([]);
        onDeleteImage?.(images[0]); // Signal that images were deleted
        
        if (response.data.errors && response.data.errors.length > 0) {
          setError(`Deleted ${response.data.deleted.length} images. Some images couldn't be deleted because they're used by products.`);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete images';
      setError(errorMessage);
    }
  };

  const getImageUrl = (imagePath: string): string => {
    return imagePath.startsWith('http') ? imagePath : `http://localhost:5001${imagePath}`;
  };

  const getImageName = (imagePath: string): string => {
    return imagePath.split('/').pop() || imagePath;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 ? (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Product Images ({images.length})
            </h3>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img
                    src={getImageUrl(image)}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/200x200?text=Error';
                    }}
                  />
                </div>
                
                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="truncate">{getImageName(image)}</p>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteImage(image)}
                  disabled={deletingImage === image}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingImage === image ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 6 6">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l4 4m0-4l-4 4" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2">No images found</p>
        </div>
      )}
    </div>
  );
};

export default ImageManager;