import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ImageUpload from './ImageUpload';
import ImageGallery from './ImageGallery';

interface Product {
  id: number;
  name: string;
  categories: string[];
  price: number;
  description: string;
  isBest: boolean;
  image: string;
  images?: string[];
  colors: string[];
  sizes: string[];
  inventory: { [key: string]: number };
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  zipCode: string;
}

interface Order {
  _id?: string;
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'images' | 'orders'>('products');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categories: [] as string[],
    price: '',
    description: '',
    isBest: false,
    colors: [] as string[],
    sizes: [] as string[],
    inventory: {} as { [key: string]: number }
  });

  const [imageFiles, setImageFiles] = useState<(File | string)[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');  
  // Available categories for selection
  const availableCategories = ['men', 'women', 'kids', 'unisex'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId || order._id === orderId
            ? { ...order, status: status as Order['status'], updatedAt: new Date().toISOString() }
            : order
        )
      );
      setSuccess('Order status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

  const addColor = () => {
    const trimmedColor = colorInput.trim();
    if (trimmedColor && !formData.colors.includes(trimmedColor)) {
      setFormData({
        ...formData,
        colors: [...formData.colors, trimmedColor]
      });
      setColorInput('');
    }
  };

  const removeColor = (index: number) => {
    const newColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: newColors });
  };

  const addSize = () => {
    const trimmedSize = sizeInput.trim();
    if (trimmedSize && !formData.sizes.includes(trimmedSize)) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, trimmedSize]
      });
      setSizeInput('');
    }
  };

  const removeSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    setFormData({ ...formData, sizes: newSizes });
  };

  const updateInventory = (size: string, color: string, quantity: number) => {
    const key = `${size}-${color}`;
    setFormData({
      ...formData,
      inventory: {
        ...formData.inventory,
        [key]: Math.max(0, quantity)
      }
    });
  };

  const generateInventoryGrid = () => {
    const inventory = { ...formData.inventory };
    formData.sizes.forEach(size => {
      if (size.trim() !== '') {
        formData.colors.forEach(color => {
          if (color.trim() !== '') {
            const key = `${size}-${color}`;
            if (inventory[key] === undefined) {
              inventory[key] = 0;
            }
          }
        });
      }
    });
    setFormData({ ...formData, inventory });
  };

  const toggleCategory = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(cat => cat !== category)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleImageChange = (images: (File | string)[]) => {
    setImageFiles(images);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('adminToken');
      
      // Filter out empty colors and sizes
      const validColors = formData.colors.filter(color => color.trim() !== '');
      const validSizes = formData.sizes.filter(size => size.trim() !== '');
      
      // Separate existing images from new files
      const existingImages = imageFiles.filter(img => typeof img === 'string') as string[];
      const newFiles = imageFiles.filter(img => img instanceof File) as File[];
      
      const productData = {
        name: formData.name,
        categories: JSON.stringify(formData.categories),
        price: formData.price,
        description: formData.description,
        isBest: formData.isBest.toString(),
        colors: JSON.stringify(validColors),
        sizes: JSON.stringify(validSizes),
        inventory: JSON.stringify(formData.inventory),
        existingImages: JSON.stringify(existingImages)
      };

      const formDataToSend = new FormData();
      Object.keys(productData).forEach(key => {
        formDataToSend.append(key, productData[key as keyof typeof productData]);
      });
      
      // Handle new files only
      if (newFiles.length > 0) {
        for (let i = 0; i < newFiles.length; i++) {
          formDataToSend.append('images', newFiles[i]);
        }
      }

      let response;
      if (editingProduct) {
        response = await axios.put(
          `/api/admin/products/${editingProduct.id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccess('Product updated successfully!');
      } else {
        response = await axios.post(
          '/api/admin/products',
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setSuccess('Product created successfully!');
      }

      fetchProducts();
      resetForm();
    } catch (err: any) {
      console.error('Product update error:', err);
      const errorMessage = err.response?.data?.error || 'Operation failed';
      const errorDetails = err.response?.data ? {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data
      } : null;
      
      console.error('Error details:', errorDetails);
      setError(`${errorMessage} ${errorDetails ? `(${err.response.status})` : ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categories: product.categories || [],
      price: product.price.toString(),
      description: product.description,
      isBest: product.isBest,
      colors: product.colors || [],
      sizes: product.sizes || [],
      inventory: product.inventory || {}
    });
    
    // Set existing images for editing
    const existingImages = product.images || [product.image]
      .filter(image => image && 
        image !== 'https://via.placeholder.com/300x400?text=No+Image' && 
        image !== '' && 
        image !== null && 
        image !== undefined
      );
    
    setImageFiles(existingImages);
    setShowAddForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      setSuccess('Product deleted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categories: [],
      price: '',
      description: '',
      isBest: false,
      colors: [],
      sizes: [],
      inventory: {}
    });
    setImageFiles([]);
    setColorInput('');
    setSizeInput('');
    setEditingProduct(null);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <button
            onClick={onLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'products'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => {
                  setActiveTab('orders');
                  fetchOrders();
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'orders'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Orders
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'images'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Images
              </button>
            </nav>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-start">
              <span>{error}</span>
              <button
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-start">
              <span>{success}</span>
              <button
                onClick={() => setSuccess('')}
                className="text-green-500 hover:text-green-700 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'images' ? (
          <ImageGallery onLogout={onLogout} />
        ) : activeTab === 'orders' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No orders found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <motion.tr
                        key={order.id || order._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{order.shippingAddress?.fullName}</div>
                          <div className="text-xs text-gray-400">{order.shippingAddress?.city}, {order.shippingAddress?.zipCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items?.length} item(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${order.total?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id || order._id!, e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-indigo-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                {showAddForm ? 'Cancel' : 'Add New Product'}
              </button>
            </div>

            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md p-6 mb-8"
                >
                  <h2 className="text-xl font-semibold mb-4">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
                        <div className="space-y-2">
                          {availableCategories.map(category => (
                            <label key={category} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.categories.includes(category)}
                                onChange={() => toggleCategory(category)}
                                className="mr-2"
                              />
                              <span className="capitalize text-gray-700">
                                {category === 'unisex' ? 'Unisex' : category}
                              </span>
                            </label>
                          ))}
                        </div>
                        {formData.categories.length === 0 && (
                          <p className="text-sm text-red-600">Please select at least one category</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                          type="number"
                          name="price"
                          required
                          step="0.01"
                          value={formData.price}
                          onChange={handleInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                        <ImageUpload
                          images={imageFiles}
                          onChange={handleImageChange}
                          maxImages={10}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500"
                      />
                    </div>
                    
                    {/* Colors Management */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.colors.map((color, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm">
                              {color}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeColor(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={colorInput}
                          onChange={(e) => setColorInput(e.target.value)}
                          placeholder="Add color"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={addColor}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Add Color
                        </button>
                      </div>
                    </div>

                    {/* Sizes Management */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.sizes.map((size, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <span className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm">
                              {size}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSize(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={sizeInput}
                          onChange={(e) => setSizeInput(e.target.value)}
                          placeholder="Add size"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={addSize}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Add Size
                        </button>
                      </div>
                    </div>

                    {/* Inventory Management */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Inventory Management</label>
                        <button
                          type="button"
                          onClick={generateInventoryGrid}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          Generate Grid
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-2">
                          {formData.sizes.map(size => (
                            <div key={size} className="space-y-2">
                              <div className="font-medium text-sm text-gray-700">{size}:</div>
                              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                {formData.colors.map(color => {
                                  const key = `${size}-${color}`;
                                  const quantity = formData.inventory[key] || 0;
                                  return (
                                    <div key={key} className="flex items-center space-x-1">
                                      <span className="text-xs text-gray-600 w-12">{color}:</span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={quantity}
                                        onChange={(e) => updateInventory(size, color, parseInt(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-indigo-500"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="isBest"
                          checked={formData.isBest}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">Best Seller</span>
                      </label>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Best Seller
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={product.image.startsWith('http') ? product.image : product.image}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/48x48?text=No+Img';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {product.categories.join(', ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.isBest ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;