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
  inventory?: { [key: string]: number };
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
      
      const productData: Product = await response.json();
      setProduct(productData);
      setSelectedColor(productData.colors?.[0] || '');
      setSelectedSize(productData.sizes?.[0] || '');
      setLoading(false);
    } catch (err) {
      setError('Failed to load product');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm font-light tracking-wider text-black uppercase">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-light text-gray-600 mb-4">Failed to load product</div>
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-light text-gray-600 mb-4">Product not found</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const getAvailableQuantity = () => {
    if (!product || !selectedSize || !selectedColor) return 0;
    
    const key = `${selectedSize}-${selectedColor}`;
    return product.inventory?.[key] || 0;
  };

  const getMaxQuantity = () => {
    const available = getAvailableQuantity();
    return Math.min(available, 10);
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

    setNotification(`Added ${product.name} to cart`);
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

    setNotification(`Processing purchase of ${product.name}...`);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-8 lg:px-12">
        {/* Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg max-w-sm ${
              notification.includes('Added') ? 'bg-green-100 border-green-200 text-green-800' :
              notification.includes('Processing') ? 'bg-blue-100 border-blue-200 text-blue-800' :
              'bg-red-100 border-red-200 text-red-800'
            }`}
          >
            {notification}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          {/* Product Image */}
          <div className="md:col-span-1">
            <div className="relative overflow-hidden bg-gray-50">
              <img
                src={product.image.startsWith('http') ? product.image : `http://localhost:5001${product.image}`}
                alt={product.name}
                className="w-full h-[600px] object-cover grayscale transition-all duration-700 md:grayscale-0 hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x800/cccccc?text=Product+Not+Found';
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="md:col-span-1 space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-6">
              {product.name}
            </h1>
            <p className="text-2xl font-light text-black mb-6">${product.price}</p>
            <p className="text-lg font-light text-gray-600 mb-8">{product.description}</p>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-medium tracking-wider text-black uppercase mb-4">Color</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {product.colors?.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-6 py-3 border-2 transition-all duration-300 ${
                      selectedColor === color 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 bg-white text-black hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium tracking-wider text-black uppercase mb-4">Size</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border-2 transition-all duration-300 ${
                      selectedSize === size 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 bg-white text-black hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-medium tracking-wider text-black uppercase mb-4">Quantity</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max={getMaxQuantity()}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-4 py-2 border border-gray-300 bg-white text-black focus:outline-none focus:border-black transition-colors"
                />
                <span className="text-sm font-light text-gray-600">
                  ({getAvailableQuantity()} available)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-6 border border border-gray-300 bg-white text-black hover:bg-gray-100 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 px-6 border border border-black bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Inventory Info */}
            {selectedColor && selectedSize && (
              <div className="mt-8 p-4 bg-gray-50">
                <p className="text-sm font-medium text-black">
                  {selectedSize} - {selectedColor}: {getAvailableQuantity()} items available
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;