/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CreditCard, Truck, RefreshCw } from 'lucide-react';

export const Banner: React.FC = () => {
  const handleScrollToCatalog = () => {
    const catalogEl = document.getElementById('catalogo');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      {/* Immersive Barbie-themed Banner - Full Bleed and Slimmer design */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 w-full mb-8 shadow-md">
        
        {/* Glamorous background decoration elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl -translate-x-10 -translate-y-20 animate-pulse duration-5000"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-pink-300/10 blur-2xl translate-x-10 translate-y-25"></div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-1/3 right-[45%] w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-40 delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-8 md:py-12 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Side: Elegant high-fashion headings */}
          <div className="space-y-4 text-left md:col-span-8 z-20">
            
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[9px] sm:text-xs font-mono font-bold text-white tracking-widest uppercase shadow-sm">
              <Sparkles className="w-3 h-3 text-pink-250 animate-pulse" />
              COLEÇÃO EXCLUSIVA • BARBIE GIRL
            </div>
            
            <div className="space-y-0.5">
              <h1 className="text-4xl sm:text-5xl lg:text-5xl font-serif font-extrabold tracking-tight text-white leading-none">
                Barbie<span className="text-pink-100 font-light italic">Girl</span>
              </h1>
              <p className="text-lg sm:text-xl font-sans font-semibold text-rose-105 tracking-tight">
                Coleção de Vestuário Feminino Premium
              </p>
            </div>
            
            <p className="text-rose-50 max-w-md text-xs sm:text-sm font-normal leading-relaxed">
              Inspirado na sofisticação contemporânea com pinceladas vibrantes de rosa e acabamentos impecáveis de design de luxo. Vista o seu melhor estilo.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleScrollToCatalog}
                className="inline-flex items-center gap-1.5 px-6 py-2 bg-white text-pink-600 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider rounded-full hover:bg-pink-50 active:scale-98 transition-all duration-200 shadow-md shadow-pink-900/10 cursor-pointer"
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
          <div className="relative md:col-span-4 h-[180px] sm:h-[240px] md:h-[260px] rounded-2xl overflow-hidden group shadow-lg border-2 border-white/20">
            {/* Dark/pink overlay dynamic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-pink-900/50 via-transparent to-transparent z-10 pointer-events-none"></div>
            
            <img
              src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&auto=format&fit=crop&q=80"
              alt="Modelo usando conjunto rosa premium"
              className="w-full h-full object-cover transform scale-102 group-hover:scale-105 duration-1000 transition-transform"
            />
            
            {/* Spinning seal badge (Directly matching reference circular tag) */}
            <div className="absolute top-2.5 left-2.5 z-20 w-16 h-16 sm:w-20 sm:h-20 hidden xs:flex items-center justify-center">
              {/* Rotating outer ring */}
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
              {/* Heart/Sparkle visual indicator center */}
              <div className="z-10 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
                <span className="text-pink-600 text-xs font-bold">♥</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 z-20 text-left">
              <div className="font-mono text-[9px] text-pink-200 tracking-wider uppercase font-bold">ESTILO AUTORAL</div>
              <div className="text-sm font-serif font-bold text-white mt-0.5">La Vie En Rose</div>
            </div>
          </div>

        </div>
      </div>

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
              <h4 className="font-sans font-bold text-slate-800 text-[11px] sm:text-xs">CHECKOUT WHATSAPP</h4>
              <p className="text-[10px] text-slate-450 mt-1 leading-normal">Finalize seu pedido e envie direto para atendimento humanizado</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
