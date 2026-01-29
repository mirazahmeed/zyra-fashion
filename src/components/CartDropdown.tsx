import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDropdown: React.FC = () => {
  const { cart, getTotalItems, getTotalPrice, getLatestItems, removeFromCart, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const latestItems = getLatestItems(5);
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const showMoreLink = cart.length > 5;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-black hover:text-gray-600 transition-colors duration-200"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col"
          >
            {latestItems.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm font-light">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-sm font-medium tracking-wider text-black uppercase">
                      Latest Items ({totalItems})
                    </h3>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {latestItems.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = 'https://picsum.photos/seed/noimage/64/64.jpg';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-black truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                              {item.selectedColor && item.selectedSize && <span> • </span>}
                              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-sm font-medium text-black">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(item.id, item.quantity - 1);
                                    }}
                                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="text-xs">−</span>
                                  </button>
                                  <span className="text-sm font-medium w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(item.id, item.quantity + 1);
                                    }}
                                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                  >
                                    <span className="text-xs">+</span>
                                  </button>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromCart(item.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-black">Total:</span>
                    <span className="text-lg font-bold text-black">${totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {showMoreLink && (
                      <Link
                        to="/cart"
                        onClick={() => setIsOpen(false)}
                        className="block w-full text-center py-2 px-4 text-sm font-medium tracking-wider text-black uppercase border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-200"
                      >
                        View All Items ({cart.length})
                      </Link>
                    )}
                    
                    <Link
                      to="/cart"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center py-3 px-4 text-sm font-medium tracking-wider text-white uppercase bg-black rounded-md hover:bg-gray-900 transition-colors duration-200"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CartDropdown;