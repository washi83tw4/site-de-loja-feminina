/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Shirt, 
  ShoppingBag, 
  Tag, 
  Sparkles, 
  Briefcase, 
  Scissors, 
  Layers, 
  Wind, 
  Gem, 
  Footprints, 
  Percent,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const CategoryList: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Map icon strings to Lucide icon components representing premium fashion
  const renderIcon = (iconName: string, isActive: boolean) => {
    const className = `w-3 h-3 transition-transform duration-200 shrink-0 ${
      isActive ? 'text-white' : 'text-slate-400 group-hover:text-rose-500'
    }`;
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className={className} strokeWidth={1.5} />;
      case 'Shirt':
        return <Shirt className={className} strokeWidth={1.5} />;
      case 'Tag':
        return <Tag className={className} strokeWidth={1.5} />;
      case 'Sparkles':
        return <Sparkles className={className} strokeWidth={1.5} />;
      case 'Briefcase':
        return <Briefcase className={className} strokeWidth={1.5} />;
      case 'Scissors':
        return <Scissors className={className} strokeWidth={1.5} />;
      case 'Layers':
        return <Layers className={className} strokeWidth={1.5} />;
      case 'Wind':
        return <Wind className={className} strokeWidth={1.5} />;
      case 'Gem':
        return <Gem className={className} strokeWidth={1.5} />;
      case 'Footprints':
        return <Footprints className={className} strokeWidth={1.5} />;
      case 'Percent':
        return <Percent className={className} strokeWidth={1.5} />;
      default:
        return <Shirt className={className} strokeWidth={1.5} />;
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      // Extra check after initial load
      const timeoutId = setTimeout(checkScroll, 300);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div id="catalogo" className="px-4 sm:px-6 lg:px-8 py-2.5 transition-all max-w-7xl mx-auto scroll-mt-24">
      {/* Header section with light styling */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="text-left">
          <h2 className="text-lg font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
            Nossa <span className="text-rose-600 italic font-light">Coleção Autoral</span>
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
            Peças exclusivas e selecionadas com acabamento de alfaiataria premium
          </p>
        </div>

        {/* Elegant Minimal Human Search Bar */}
        <div className="relative w-full md:max-w-[220px] shrink-0 z-10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar no catálogo..."
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200/50 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-200 focus:bg-white transition-all duration-200"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[14px] leading-none font-bold text-slate-450 hover:text-rose-600 cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Luxury horizontal scroll container viewport wrapper */}
      <div className="relative group/viewport">
        {/* Left Scroll Button (Premium desktop chevrons) */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-7 h-7 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-slate-100 text-slate-600 hover:text-rose-600 hover:scale-105 transition-all duration-200 cursor-pointer animate-fade-in"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="w-4 h-4 ml-[-1px]" />
          </button>
        )}

        {/* Right Scroll Button (Premium desktop chevrons) */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-30 hidden md:flex items-center justify-center w-7 h-7 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-slate-100 text-slate-600 hover:text-rose-600 hover:scale-105 transition-all duration-200 cursor-pointer animate-fade-in"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="w-4 h-4 mr-[-1px]" />
          </button>
        )}

        {/* Dynamic Fading Edges Overlays to signify scroll depth */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50/50 via-slate-50/20 to-transparent pointer-events-none z-20 transition-opacity duration-300" />
        )}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50/50 via-slate-50/20 to-transparent pointer-events-none z-20 transition-opacity duration-300" />
        )}

        {/* Main scroll list */}
        <div 
          ref={scrollContainerRef}
          className="flex flex-row items-center gap-1.5 overflow-x-auto pb-3 pt-0.5 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex-nowrap whitespace-nowrap scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`group relative flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-[11px] sm:text-xs font-semibold tracking-normal transition-all duration-300 cursor-pointer active:scale-95 shrink-0 select-none overflow-hidden ${
                  isActive
                    ? 'text-white shadow-sm font-bold shadow-rose-950/25'
                    : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Micro Animated Background using Framer Motion springs */}
                {isActive && (
                  <motion.span
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-rose-600 z-0 rounded-md"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}

                {/* Content layers */}
                <span className="relative z-10 flex items-center justify-center transition-transform group-hover:scale-105 duration-250">
                  {renderIcon(cat.icon, isActive)}
                </span>
                
                <span className="relative z-10 leading-none">
                  {cat.label}
                </span>

                {/* Promo label glow indicator */}
                {cat.name === 'promocoes' && !isActive && (
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            );
          })}

          {/* Golden spacing pill at the very end of list so it is NEVER cut off under overflow */}
          <div className="w-8 sm:w-16 h-2 shrink-0 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
