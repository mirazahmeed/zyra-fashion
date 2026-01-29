import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import SwipableImage from './SwipableImage';

interface Product {
  id: number;
  name: string;
  categories: string[];
  price: number;
  image: string;
  images?: string[];
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
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product, 1);
    setAddedToCart(true);
    
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  return (
    <div>
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
        {/* Product Images - Swipable */}
        <div className="relative overflow-hidden bg-gray-50 aspect-[3/4]" >
          <SwipableImage
            images={product.images || [product.image]}
            alt={product.name}
            className="aspect-[3/4]"
          />
          {product.isBest && (
            <div className="absolute top-4 left-4 bg-black text-white text-xs font-medium tracking-widest px-3 py-1 z-20">
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

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            className={`w-full py-3 px-4 text-xs font-medium tracking-widest uppercase transition-all duration-300 ${
              addedToCart 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-black text-white hover:bg-gray-900'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
          </motion.button>
        </div>
      </motion.article>
      </Link>
    </div>
  );
};

export default ProductCard;