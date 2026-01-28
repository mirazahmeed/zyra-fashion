import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';

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

const Kids: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/category/kids')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching kids products:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-white">
        {/* Page Header */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black mb-4">
                KIDS
              </h1>
              <p className="text-lg font-light text-gray-600 max-w-2xl mx-auto">
                Playful essentials for the young generation
              </p>
            </motion.div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="pb-24">
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
      </div>
  );
};

export default Kids;