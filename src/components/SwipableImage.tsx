import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SwipableImageProps {
  images: string[];
  alt: string;
  className?: string;
  onSwipeChange?: (index: number) => void;
  currentIndex?: number; // Add external control support
  showArrows?: boolean; // Control arrow visibility
}

const SwipableImage: React.FC<SwipableImageProps> = ({ 
  images, 
  alt, 
  className = '', 
  onSwipeChange,
  currentIndex: externalIndex,
  showArrows = true
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  
  const setCurrentIndex = (newIndex: number) => {
    if (externalIndex !== undefined) {
      onSwipeChange?.(newIndex);
    } else {
      setInternalIndex(newIndex);
    }
    onSwipeChange?.(newIndex);
  };
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onSwipeChange?.(newIndex);
    }
    if (isRightSwipe && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onSwipeChange?.(newIndex);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    onSwipeChange?.(index);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
    onSwipeChange?.(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onSwipeChange?.(newIndex);
  };

  // Auto-rotate images every 3 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, images.length]);

  // Pause auto-rotation on hover
  const [isHovered, setIsHovered] = useState(false);

  if (images.length === 0) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-500">No images</span>
      </div>
    );
  }

  // Always render the full structure for consistency
  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative w-full h-full">
        {/* Main image */}
        <motion.img
          key={currentIndex}
          src={images[currentIndex]?.startsWith('http') ? images[currentIndex] : images[currentIndex]}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://picsum.photos/seed/noimage/400/500.jpg';
          }}
        />

        {/* Navigation arrows - controlled by showArrows prop */}
        {images.length > 1 && showArrows && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg transition-all duration-200 z-20 border border-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg transition-all duration-200 z-20 border border-gray-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dots indicator - controlled by showArrows prop */}
        {images.length > 1 && showArrows && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10 bg-black/30 px-3 py-2 rounded-full">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* Image counter - controlled by showArrows prop */}
        {images.length > 1 && showArrows && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-full text-sm font-medium z-10">
            {currentIndex + 1}/{images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipableImage;