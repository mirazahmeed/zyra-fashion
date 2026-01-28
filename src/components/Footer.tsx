import React, { useState } from 'react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Newsletter Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-light tracking-wide text-black mb-4">
              STAY INFORMED
            </h2>
            <p className="text-sm font-light text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to receive updates on new collections and exclusive offers
            </p>
            
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:border-black transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white text-sm font-medium tracking-wider uppercase hover:bg-gray-900 transition-colors"
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
              {subscribed && (
                <p className="mt-4 text-sm text-green-600">
                  Thank you for subscribing!
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Oversized Brand Typography */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-black opacity-10">
              ZYRA
            </h1>
            <p className="mt-4 text-sm font-light tracking-wide text-gray-600">
              Minimalist Luxury Fashion
            </p>
          </div>
        </div>
      </section>

      {/* Footer Links */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-sm font-medium tracking-wider text-black uppercase mb-4">
                Shop
              </h3>
              <ul className="space-y-2">
                <li><a href="/women" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Women</a></li>
                <li><a href="/men" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Men</a></li>
                <li><a href="/kids" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Kids</a></li>
                <li><a href="/unisex" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Unisex</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium tracking-wider text-black uppercase mb-4">
                About
              </h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Our Story</a></li>
                <li><a href="/campaign" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Campaign</a></li>
                <li><a href="/contact" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium tracking-wider text-black uppercase mb-4">
                Customer Care
              </h3>
              <ul className="space-y-2">
                <li><a href="/shipping" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Shipping</a></li>
                <li><a href="/returns" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Returns</a></li>
                <li><a href="/size-guide" className="text-sm font-light text-gray-600 hover:text-black transition-colors">Size Guide</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Copyright */}
      <section className="py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm font-light text-gray-600">
              © 2026 Zyra Fashion. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/privacy" className="text-sm font-light text-gray-600 hover:text-black transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-sm font-light text-gray-600 hover:text-black transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;