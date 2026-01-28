import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  categories: string[];
  price: number;
  image: string;
  description: string;
  isBest: boolean;
  colors: string[];
  sizes: string[];
  inventory: { [key: string]: number };
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error('Product not found');
      }
      const data = await response.json();
      setProduct(data);
      // Set default selections
      if (data.colors.length > 0) setSelectedColor(data.colors[0]);
      if (data.sizes.length > 0) setSelectedSize(data.sizes[0]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableQuantity = () => {
    if (!product || !selectedSize || !selectedColor) return 0;
    const key = `${selectedSize}-${selectedColor}`;
    return product.inventory[key] || 0;
  };

  const getMaxQuantity = () => {
    const available = getAvailableQuantity();
    return Math.min(available, 10); // Max 10 items per order
  };

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) {
      setNotification('Please select size and color');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    const available = getAvailableQuantity();
    if (quantity > available) {
      setNotification(`Only ${available} items available`);
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setNotification(`Added ${quantity} ${product.name} (${selectedSize}, ${selectedColor}) to cart`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleBuyNow = () => {
    if (!product || !selectedSize || !selectedColor) {
      setNotification('Please select size and color');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    const available = getAvailableQuantity();
    if (quantity > available) {
      setNotification(`Only ${available} items available`);
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setNotification(`Processing purchase of ${quantity} ${product.name}...`);
    setTimeout(() => setNotification(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error || 'Product not found'}</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const availableQuantity = getAvailableQuantity();
  const maxQuantity = getMaxQuantity();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
              notification.includes('Added') 
                ? 'bg-green-100 border border-green-200 text-green-800'
                : notification.includes('Processing')
                ? 'bg-blue-100 border border-blue-200 text-blue-800'
                : 'bg-red-100 border border-red-200 text-red-800'
            }`}
          >
            {notification}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex justify-center items-center">
              <motion.img
                src={product.image.startsWith('http') ? product.image : product.image}
                alt={product.name}
                className="w-full max-w-md h-96 object-cover rounded-lg shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                }}
              />
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold text-red-500">${product.price}</span>
                  {product.isBest && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      Best Seller
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded-md transition-all ${
                        selectedColor === color
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => {
                    const quantityForSize = Object.keys(product.inventory)
                      .filter(key => key.startsWith(`${size}-${selectedColor}`))
                      .reduce((sum, key) => sum + product.inventory[key], 0);
                    
                    const isOutOfStock = selectedColor && quantityForSize === 0;
                    
                    return (
                      <button
                        key={size}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`px-4 py-2 border-2 rounded-md transition-all ${
                          selectedSize === size && !isOutOfStock
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : isOutOfStock
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity and Stock Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantity
                  {selectedSize && selectedColor && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({availableQuantity} available)
                    </span>
                  )}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={availableQuantity === 0}
                  />
                  <span className="text-sm text-gray-600">
                    {availableQuantity === 0 
                      ? 'Out of Stock' 
                      : availableQuantity < 10 
                        ? `Only ${availableQuantity} left!` 
                        : 'In Stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={availableQuantity === 0}
                  className="flex-1 py-3 px-6 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={availableQuantity === 0}
                  className="flex-1 py-3 px-6 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;