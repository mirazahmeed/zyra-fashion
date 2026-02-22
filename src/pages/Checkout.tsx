import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import AuthGuard from '../components/AuthGuard';

const Checkout: React.FC = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, isEmailVerified, resendVerificationEmail, reloadUser } = useAuth();
  const { createOrder } = useOrder();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    reloadUser();
  }, []);
  
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    streetAddress: '',
    city: '',
    zipCode: ''
  });
  
  const totalPrice = getTotalPrice();

  const handlePlaceOrder = async () => {
    if (!isEmailVerified) {
      alert('Please verify your email before placing an order. Check your inbox for the verification link.');
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.streetAddress || !shippingAddress.city || !shippingAddress.zipCode) {
      alert('Please fill in all shipping address fields');
      return;
    }

    setIsProcessing(true);
    
    try {
      const order = await createOrder(shippingAddress);
      alert(`Order placed successfully! Order number: ${order.orderNumber}`);
      navigate('/orders');
    } catch (error) {
      console.error('Order creation failed:', error);
      alert(`Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      alert('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tight text-black mb-4">
              Checkout
            </h1>
            <nav className="text-sm text-gray-600">
              <Link to="/" className="hover:text-black">Home</Link>
              <span className="mx-2">/</span>
              <Link to="/cart" className="hover:text-black">Cart</Link>
              <span className="mx-2">/</span>
              <span className="text-black">Checkout</span>
            </nav>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Information */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h2 className="text-xl font-medium text-black mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  </div>
                  {!isEmailVerified && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm text-yellow-800 font-medium">
                            Email not verified
                          </p>
                          <p className="text-xs text-yellow-700 mt-1">
                            You must verify your email before placing an order.
                          </p>
                          <button
                            onClick={handleResendVerification}
                            disabled={isResending}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                          >
                            {isResending ? 'Sending...' : 'Resend verification email'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={user?.displayName || 'N/A'}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h2 className="text-xl font-medium text-black mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-0">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-black">{item.name}</h3>
                        <p className="text-xs text-gray-500">
                          {item.selectedColor && `Color: ${item.selectedColor}`}
                          {item.selectedColor && item.selectedSize && ' • '}
                          {item.selectedSize && `Size: ${item.selectedSize}`}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium text-black">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h2 className="text-xl font-medium text-black mb-6">Shipping Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={shippingAddress.streetAddress}
                    onChange={(e) => setShippingAddress({...shippingAddress, streetAddress: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gray-50 rounded-lg p-6 sticky top-6"
              >
                <h2 className="text-xl font-medium text-black mb-6">Order Total</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-black">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-black">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-black">${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-black">Total</span>
                      <span className="text-lg font-bold text-black">
                        ${(totalPrice * 1.08).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || cart.length === 0 || !isEmailVerified}
                  className="w-full py-3 px-4 bg-black text-white text-sm font-medium tracking-wider uppercase rounded-md hover:bg-gray-900 transition-colors duration-200 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : !isEmailVerified ? 'Verify Email to Order' : 'Place Order'}
                </button>
                
                <Link
                  to="/cart"
                  className="block w-full py-3 px-4 text-center text-sm font-medium tracking-wider text-black uppercase border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-200"
                >
                  Back to Cart
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Checkout;