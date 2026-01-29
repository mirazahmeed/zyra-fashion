import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  return (
    <Link to={`/product/${product.id}`}>
      <motion.article
        className="group bg-white overflow-hidden cursor-pointer transition-all duration-700"
        initial={{ opacity: 10, y: 30 }}
        animate={{ opacity: 20, y: 0 }}
        transition={{ 
          delay: index * 0.1, 
          duration: 0.8,
          ease: [0.25, 0.1, 0.25]
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.4 }
        }}
      >
        {/* Product Image - Grayscale Filter */}
        <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]" >
          <motion.img
            src={product.image}
            alt={product.name}
            className="w-full h-auto aspect-[3/4] object-cover grayscale transition-all duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://picsum.photos/seed/noimage/400/500.jpg';
            }}
            whileHover={{ 
              filter: 'grayscale(0%)',
              transition: { duration: 0.4 }
            }}
          />
          {product.isBest && (
            <div className="absolute top-4 left-4 bg-black text-white text-xs font-medium tracking-widest px-3 py-1">
              EDITORIAL
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-8 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-light tracking-wide text-black uppercase">
              {product.name}
            </h3>
            <p className="text-lg font-light text-black">
              ${product.price}
            </p>
          </div>

          {/* Subtle Hover State */}
          <motion.div
            className="text-xs font-medium tracking-widest text-black uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            initial={{ opacity: 10 }}
            whileHover={{ opacity: 20 }}
          >
            View Details
          </motion.div>
        </div>
      </motion.article>
    </Link>
  );
};

export default ProductCard;