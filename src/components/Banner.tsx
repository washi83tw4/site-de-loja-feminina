/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CreditCard, Truck, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export const Banner: React.FC = () => {
  const { products, setSelectedProductId, setCurrentView } = useStore();

  const handleScrollToCatalog = () => {
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter products where active = true (active !== false) AND banner = true
  const carouselProducts = products.filter(
    p => p.active !== false && p.banner === true
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselProducts.length]);

  const handleGoToProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    setCurrentView('product-detail');
  };

  const getCategoryLabel = (cat: string) => {
    if (!cat) return 'Geral';
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const cleanCat = normalize(cat);
    switch (cleanCat) {
      case 'camisetas': return 'Camisetas';
      case 'blusas': return 'Blusas';
      case 'calcas': return 'Calças';
      case 'shorts': return 'Shorts';
      case 'vestidos': return 'Vestidos';
      case 'casacos': return 'Casacos';
      case 'saias': return 'Saias';
      case 'bolsas': return 'Bolsas';
      case 'acessorios': return 'Acessórios';
      case 'sapatos': return 'Sapatos';
      default: return cat;
    }
  };

  // Gradients matching the specified list:
  // - rosa escuro com roxo
  // - preto com rosa
  // - vinho com azul escuro
  // - roxo com pink
  const themeGradients = [
    "from-pink-900 via-rose-950 to-purple-950", // rosa escuro com roxo
    "from-neutral-950 via-rose-950 to-neutral-900", // preto com rosa
    "from-red-950 via-rose-900 to-slate-950", // vinho com azul escuro
    "from-purple-950 via-fuchsia-950 to-pink-900" // roxo com pink
  ];

  const currentGradient = themeGradients[currentIndex % themeGradients.length];

  // Resolve background based on project specs: inline background, tailwind classes or default gradients
  const activeProduct = carouselProducts[currentIndex];
  const getBgConfig = () => {
    if (!activeProduct) {
      return { className: `bg-gradient-to-r ${currentGradient}`, style: {} };
    }
    
    // Rule 3: Se banner_image existir, aplicar como background-image no container do banner
    const bannerImage = activeProduct.bannerImage;
    if (bannerImage && bannerImage.trim() !== '') {
      return {
        className: 'bg-cover bg-center bg-no-repeat',
        style: { backgroundImage: `url(${bannerImage.trim()})` }
      };
    }
    
    // Rule 4: Se banner_image não existir, usar banner_bg ou gradiente como fundo
    const bannerBg = activeProduct.bannerBg;
    if (!bannerBg || bannerBg.trim() === '') {
      return { className: `bg-gradient-to-r ${currentGradient}`, style: {} };
    }
    
    const bannerBgTrimmed = bannerBg.trim();
    // Detect typical tailwind classes
    const isTailwind = /^(bg-|from-|via-|to-|linear-|grid-|flex-)/.test(bannerBgTrimmed) || bannerBgTrimmed.includes(' ');
    if (isTailwind) {
      if (bannerBgTrimmed.includes('from-') && !bannerBgTrimmed.includes('bg-')) {
        return { className: `bg-gradient-to-r ${bannerBgTrimmed}`, style: {} };
      }
      return { className: bannerBgTrimmed, style: {} };
    }
    
    // Standard color hex, rgb or valid single-string/gradient css statement
    return { className: '', style: { background: bannerBgTrimmed } };
  };

  const bgConfig = getBgConfig();

  return (
    <div className="w-full">
      {/* Dynamic Banner Carousel or Fallback */}
      {carouselProducts.length > 0 ? (
        <div className="relative overflow-hidden w-full mb-8 shadow-sm bg-slate-950 border-b border-rose-100/5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className={`relative px-6 py-8 md:py-12 ${bgConfig.className}`}
              style={bgConfig.style}
            >
              {/* Tint overlay to guarantee ultimate readability over any custom banner backdrops while keeping it light and vibrant */}
              {activeProduct?.bannerImage && activeProduct.bannerImage.trim() !== '' && (
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent z-10 pointer-events-none" />
              )}

              {/* Tight, elegant, and centered content wrapper to pull elements together */}
              <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-20">
                {/* Glamorous background decoration elements */}
                <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full bg-rose-500/5 blur-3xl -translate-x-10 -translate-y-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full bg-slate-400/5 blur-2xl translate-x-10 translate-y-25 pointer-events-none"></div>
                
                {/* Left Side: Elegant dynamic headings */}
                <div className="space-y-4 text-left md:col-span-7 z-20">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[9px] sm:text-xs font-mono font-bold text-rose-300 tracking-widest uppercase shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-rose-450 animate-pulse" />
                    {carouselProducts[currentIndex].onSale ? 'SUPER OFERTA DA SEMANA • IMPERDÍVEL' : 'DESTAQUE EM ELEGÂNCIA • NOVIDADE'}
                  </div>
                  
                  <div className="space-y-1.5">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black tracking-tight text-white leading-tight">
                      {carouselProducts[currentIndex].name}
                    </h1>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-300 uppercase tracking-widest bg-slate-800/60 px-2.5 py-0.5 rounded border border-slate-700">
                        {getCategoryLabel(carouselProducts[currentIndex].category)}
                      </span>
                      
                      {carouselProducts[currentIndex].onSale && (
                        <span className="bg-rose-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-pulse">
                          OFERTA ESPECIAL
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-slate-300 max-w-xl text-xs sm:text-sm font-normal leading-relaxed line-clamp-3 font-sans">
                    {carouselProducts[currentIndex].description}
                  </p>

                  <div className="flex flex-wrap items-center gap-5 pt-2">
                    <button
                      onClick={() => handleGoToProduct(carouselProducts[currentIndex].id)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider rounded-md active:scale-98 transition-all duration-200 shadow-md shadow-rose-950/20 cursor-pointer"
                    >
                      Ver Detalhes do Produto
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>

                    <div className="flex flex-col text-left bg-black/35 backdrop-blur-[2px] px-3.5 py-2 rounded-lg border border-white/10 shadow-lg">
                      <span className="font-mono text-[9px] text-pink-200 font-extrabold uppercase tracking-widest leading-none">
                        Preço Exclusivo
                      </span>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        {carouselProducts[currentIndex].onSale && carouselProducts[currentIndex].promotionalPrice !== undefined ? (
                          <>
                            <span className="font-sans font-black text-rose-400 text-xl sm:text-2xl leading-none">
                              R$ {carouselProducts[currentIndex].promotionalPrice.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="font-sans font-medium text-slate-300 text-xs sm:text-sm line-through leading-none opacity-80">
                              R$ {carouselProducts[currentIndex].price.toFixed(2).replace('.', ',')}
                            </span>
                          </>
                        ) : (
                          <span className="font-sans font-black text-white text-xl sm:text-2xl leading-none">
                            R$ {carouselProducts[currentIndex].price.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Portrait Image View with nice badges */}
                <div 
                  onClick={() => handleGoToProduct(carouselProducts[currentIndex].id)}
                  className="relative md:col-span-5 h-[220px] sm:h-[260px] rounded-none overflow-hidden group shadow-xl border border-white/10 cursor-pointer z-20 justify-self-center md:justify-self-end w-full max-w-[360px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Rule 6: Show product.imagem || product.imageUrl in product card, never bannerImage */}
                  <img
                    src={carouselProducts[currentIndex].imageUrl}
                    alt={carouselProducts[currentIndex].name}
                    className="w-full h-full object-cover transform scale-102 group-hover:scale-105 duration-700 transition-transform"
                  />
                  
                  <div className="absolute bottom-4 left-4 z-20 text-left">
                    <div className="font-mono text-[9px] text-rose-400 tracking-wider uppercase font-bold">DESTAQUE PREMIUM</div>
                    <div className="text-sm font-sans font-extrabold text-white mt-0.5 line-clamp-1">{carouselProducts[currentIndex].name}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel dots indicators */}
          {carouselProducts.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {carouselProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex 
                      ? 'bg-rose-500 w-3' 
                      : 'bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ir para slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Immersive Barbie-themed Fallback Banner - Full Bleed and Slimmer design */
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-550 via-rose-900 to-purple-950 w-full mb-8 shadow-sm border-b border-rose-100/5">
          {/* Glamorous background decoration elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl -translate-x-10 -translate-y-20 animate-pulse duration-5000"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-pink-300/5 blur-2xl translate-x-10 translate-y-25"></div>

          <div className="relative max-w-5xl mx-auto px-6 py-8 md:py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-20">
            
            {/* Left Side: Elegant headings */}
            <div className="space-y-4 text-left md:col-span-7 z-20">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[9px] sm:text-xs font-mono font-bold text-white tracking-widest uppercase shadow-sm">
                <Sparkles className="w-3 h-3 text-pink-200 animate-pulse" />
                COLEÇÃO EXCLUSIVA • BARBIE GIRL
              </div>
              
              <div className="space-y-0.5">
                <h1 className="text-4xl sm:text-5xl lg:text-5xl font-serif font-extrabold tracking-tight text-white leading-none">
                  Barbie<span className="text-pink-100 font-light italic">Girl</span>
                </h1>
                <p className="text-lg sm:text-xl font-sans font-semibold text-rose-100 tracking-tight">
                  Coleção de Vestuário Feminino Premium
                </p>
              </div>
              
              <p className="text-rose-50 max-w-xl text-xs sm:text-sm font-normal leading-relaxed">
                Inspirado na sofisticação contemporânea com pinceladas vibrantes de rosa e acabamentos impecáveis de design de luxo. Vista o seu melhor style.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleScrollToCatalog}
                  className="inline-flex items-center gap-1.5 px-6 py-2 bg-white text-pink-600 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider rounded-md hover:bg-pink-50 active:scale-98 transition-all duration-200 shadow-md cursor-pointer"
                >
                  Comprar Coleção
                  <ArrowRight className="w-3.5 h-3.5 text-pink-600" />
                </button>
                
                <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-xs text-white bg-black/10 px-2.5 py-0.5 rounded-full border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  <span>Cupom ativo: <span className="font-bold underline text-pink-100">BARBIE10</span></span>
                </div>
              </div>
            </div>

            {/* Right Side: Slimmer Portrait Visual and Rotating Seal */}
            <div className="relative md:col-span-5 h-[180px] sm:h-[240px] md:h-[260px] rounded-none overflow-hidden group shadow-lg border-2 border-white/15 justify-self-center md:justify-self-end w-full max-w-[360px]">
              <div className="absolute inset-0 bg-gradient-to-t from-pink-950/50 via-transparent to-transparent z-10 pointer-events-none"></div>
              
              <img
                src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop&q=80"
                alt="Modelo usando conjunto rosa premium"
                className="w-full h-full object-cover transform scale-102 group-hover:scale-105 duration-1000 transition-transform"
              />
              
              {/* Spinning seal badge */}
              <div className="absolute top-2.5 left-2.5 z-20 w-16 h-16 sm:w-20 sm:h-20 hidden xs:flex items-center justify-center">
                <div 
                  className="absolute inset-0 rounded-full bg-pink-600/95 border border-white/30 backdrop-blur-sm flex items-center justify-center"
                  style={{ animation: 'spin 12s linear infinite' }}
                >
                  <svg className="w-full h-full p-0.5" viewBox="0 0 100 100">
                    <path
                      id="rotated-text-path"
                      d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                      fill="none"
                    />
                    <text className="font-mono text-[8px] font-bold fill-white tracking-widest">
                      <textPath href="#rotated-text-path" startOffset="0%">
                        ED. LIMITADA • FASHION PREMIUM • 
                      </textPath>
                    </text>
                  </svg>
                </div>
                <div className="z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                  <span className="text-pink-600 text-xs font-bold">♥</span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 z-20 text-left">
                <div className="font-mono text-[9px] text-pink-200 tracking-wider uppercase font-bold">ESTILO AUTORAL</div>
                <div className="text-sm font-serif font-bold text-white mt-0.5 animate-pulse">La Vie En Rose</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Row of Benefit Badges under the banner - Centered responsive grids */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Benefit item 1 */}
          <div className="bg-white border border-rose-100/40 p-4.5 rounded-2xl shadow-sm text-left flex items-start gap-3 hover:border-pink-200 transition-colors duration-200">
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-slate-800 text-[11px] sm:text-xs">ENVIOS PARA TODO BRASIL</h4>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Frete cortesia em compras qualificadas ou via Sedex</p>
            </div>
          </div>

          {/* Benefit item 2 */}
          <div className="bg-white border border-rose-100/40 p-4.5 rounded-2xl shadow-sm text-left flex items-start gap-3 hover:border-pink-200 transition-colors duration-200">
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-slate-800 text-[11px] sm:text-xs">PARCELE EM ATÉ 6X</h4>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Parcele nos cartões sem juros ou pague com facilidade via PIX</p>
            </div>
          </div>

          {/* Benefit item 3 */}
          <div className="bg-white border border-rose-100/40 p-4.5 rounded-2xl shadow-sm text-left flex items-start gap-3 hover:border-pink-200 transition-colors duration-200">
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-slate-800 text-[11px] sm:text-xs">TROCA FÁCIL E GRÁTIS</h4>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Até 7 dias após o recebimento para solicitar sua troca grátis</p>
            </div>
          </div>

          {/* Benefit item 4 */}
          <div className="bg-white border border-rose-100/40 p-4.5 rounded-2xl shadow-sm text-left flex items-start gap-3 hover:border-pink-200 transition-colors duration-200">
            <div className="p-2.5 rounded-xl bg-pink-50 text-pink-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-slate-800 text-[11px] sm:text-xs">CHECKOUT 100% SEGURO</h4>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Seus dados e pedidos são gravados com segurança em tempo real</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
