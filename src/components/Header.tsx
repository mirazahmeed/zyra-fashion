import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import CartDropdown from './CartDropdown';
import UserDropdown from './UserDropdown';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <header className="hidden md:block">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-8 lg:px-12">
            <div className="flex justify-between items-center h-24">
              {/* Logo */}
              <Link to="/" className="group">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-3xl font-light tracking-tight text-black transition-all duration-300 group-hover:opacity-70"
                >
                  ZYRA
                </motion.div>
              </Link>

              {/* Navigation Links */}
              <div className="flex items-center space-x-8">
                {['men', 'women', 'kids', 'unisex', 'about'].map((item) => (
                  <Link
                    key={item}
                    to={`/${item}`}
                    className="relative group"
                  >
                    <span className="text-sm font-medium tracking-wider text-gray-900 uppercase transition-colors duration-300 group-hover:text-gray-500">
                      {item}
                    </span>
                    <motion.div
                      className="absolute -bottom-1 left-0 w-full h-px bg-black origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                ))}
                <Link
                  to="/admin"
                  className="relative group"
                >
                  <span className="text-sm font-medium tracking-wider text-gray-900 uppercase transition-colors duration-300 group-hover:text-gray-500">
                    Admin
                  </span>
                  <motion.div
                    className="absolute -bottom-1 left-0 w-full h-px bg-black origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
                
                {/* User Dropdown */}
                <UserDropdown />
                
                {/* Cart Dropdown */}
                <CartDropdown />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation */}
      <header className="md:hidden">
        <nav className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-light tracking-tight text-black">
                ZYRA
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2"
              >
                <div className="space-y-1">
                  <div className={`w-6 h-0.5 bg-black transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <div className={`w-6 h-0.5 bg-black transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                  <div className={`w-6 h-0.5 bg-black transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-8 space-y-6">
                  {['men', 'women', 'kids', 'unisex', 'about'].map((item) => (
                    <Link
                      key={item}
                      to={`/${item}`}
                      className="block text-lg font-medium tracking-wider text-gray-900 uppercase"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item}
                    </Link>
                  ))}
                  <Link
                    to="/admin"
                    className="block text-lg font-medium tracking-wider text-gray-900 uppercase"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                  
                   {/* Mobile User Link */}
                   <div className="pt-6 border-t border-gray-200">
                     <Link
                       to="/auth"
                       className="flex items-center justify-between text-lg font-medium tracking-wider text-gray-900 uppercase"
                       onClick={() => setMobileMenuOpen(false)}
                     >
                       <span>Account</span>
                       <svg
                         className="w-5 h-5"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M9 5l7 7-7 7"
                         />
                       </svg>
                     </Link>
                   </div>
                   
                   {/* Mobile Cart Link */}
                   <div className="pt-2">
                     <Link
                       to="/cart"
                       className="flex items-center justify-between text-lg font-medium tracking-wider text-gray-900 uppercase"
                       onClick={() => setMobileMenuOpen(false)}
                     >
                       <span>Cart</span>
                       <svg
                         className="w-5 h-5"
                         fill="none"
                         stroke="currentColor"
                         viewBox="0 0 24 24"
                       >
                         <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M9 5l7 7-7 7"
                         />
                       </svg>
                     </Link>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </>
  );
};

export default Header;