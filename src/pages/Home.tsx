import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Hero from '../components/Hero';

interface Product {
  id: number;
  name: string;
  categories: string[];
  price: number;
  image: string;
  description: string;
  isBest: boolean;
  colors?: string[];
  sizes?: string[];
  inventory?: { [key: string]: number };
}

interface HeroSettings {
  type: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  enabled: boolean;
}

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSettings, setHeroSettings] = useState<HeroSettings | null>(null);

  useEffect(() => {
    fetch('/api/products/best')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });

    fetch('/api/settings/hero')
      .then(response => response.json())
      .then(data => {
        setHeroSettings(data);
      })
      .catch(error => {
        console.error('Error fetching hero settings:', error);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm font-light tracking-wider text-black uppercase">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Dynamic Hero Section */}
      {heroSettings?.enabled ? (
        <Hero
          title={heroSettings.title}
          subtitle={heroSettings.subtitle}
          image={heroSettings.image}
          ctaText={heroSettings.ctaText}
          ctaLink={heroSettings.ctaLink}
        />
      ) : (
        <section className="relative h-screen flex items-center justify-center bg-white">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="relative z-10 text-center px-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight text-black mb-8"
            >
              OUR
              <br />
              COLLECTION
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-lg font-light tracking-wide text-gray-600 max-w-2xl mx-auto mb-12"
            >
              Minimalist luxury fashion designed for the modern individual
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex justify-center space-x-8"
            >
              <Link to="/women" className="group">
                <span className="text-sm font-medium tracking-widest text-black uppercase border-b border-black pb-1 transition-all duration-300 group-hover:border-transparent">
                  Women
                </span>
              </Link>
              <Link to="/men" className="group">
                <span className="text-sm font-medium tracking-widest text-black uppercase border-b border-black pb-1 transition-all duration-300 group-hover:border-transparent">
                  Men
                </span>
              </Link>
              <Link to="/kids" className="group">
                <span className="text-sm font-medium tracking-widest text-black uppercase border-b border-black pb-1 transition-all duration-300 group-hover:border-transparent">
                  Kids
                </span>
              </Link>
              <Link to="/unisex" className="group">
                <span className="text-sm font-medium tracking-widest text-black uppercase border-b border-black pb-1 transition-all duration-300 group-hover:border-transparent">
                  Unisex
                </span>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Product Gallery Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page Storefront Showcase */}
      <section className="relative h-96 bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
            >
              ARCHITECTURAL FRAMING
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg font-light text-white max-w-2xl mx-auto"
            >
              Experience fashion through architectural precision
            </motion.p>
          </div>
        </div>
      </section>

      {/* DESIGNED WITH INTENTION Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4">
              DESIGNED WITH INTENTION
            </h2>
            <p className="text-lg font-light text-gray-600 max-w-3xl mx-auto">
              Every piece is carefully crafted with purpose and precision
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: '○', title: 'SUSTAINABLE', desc: 'Ethically sourced materials' },
              { icon: '□', title: 'TIMELESS', desc: 'Beyond seasonal trends' },
              { icon: '△', title: 'PRECISION', desc: 'Meticulous craftsmanship' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-light text-black mb-4">{item.icon}</div>
                <h3 className="text-lg font-medium tracking-wider text-black uppercase mb-2">
                  {item.title}
                </h3>
                <p className="text-sm font-light text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-4">
              NEW ARRIVALS
            </h2>
            <p className="text-lg font-light text-gray-600">
              Discover our latest editorial pieces
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.slice(0, 2).map((product, index) => (
              <div key={product.id} className="relative group">
                <div className="aspect-[3/4] bg-gray-200 overflow-hidden">
                  <img
                    src={product.image.startsWith('http') ? product.image : product.image}
                    alt={product.name}
                    className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/600x800/cccccc?text=New+Arrival';
                    }}
                  />
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-light tracking-wide text-black uppercase mb-2">
                    {product.name}
                  </h3>
                  <p className="text-lg font-light text-black">${product.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;