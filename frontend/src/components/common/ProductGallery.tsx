import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { ProductImage } from '../../types';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedVariantName?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  selectedVariantName,
}) => {
  const sortedImages = Array.isArray(images) && images.length > 0
    ? [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    : [];

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Reset selected image when image list updates (e.g., variant switch)
  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  if (sortedImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400 border border-slate-200">
        <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
        <span className="text-sm font-medium">No Images Available</span>
      </div>
    );
  }

  const currentImage = sortedImages[selectedIndex] || sortedImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Main Image Container */}
      <div className="relative w-full aspect-square bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden group shadow-sm flex items-center justify-center p-4">
        <img
          src={currentImage.url}
          alt={currentImage.altText || `${productName} ${selectedVariantName ? `- ${selectedVariantName}` : ''}`}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Variant Badge overlay if active */}
        {selectedVariantName && (
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-medium shadow-sm">
            {selectedVariantName}
          </div>
        )}

        {/* Navigation Buttons for Gallery */}
        {sortedImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              type="button"
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Index counter badge */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-0.5 rounded-md font-mono">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}
      </div>

      {/* Thumbnail Carousel Row */}
      {sortedImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-300">
          {sortedImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                type="button"
                className={`relative flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all p-1 bg-white ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 scale-105'
                    : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.altText || `Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
