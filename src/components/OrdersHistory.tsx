/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Clock, CheckCircle2, ChevronLeft, Calendar, FileText, ShoppingBag } from 'lucide-react';

export const OrdersHistory: React.FC = () => {
  const { user, userOrders, fetchUserOrders, setCurrentView } = useStore();

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoStr;
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Conecte-se para ver seu histórico</h2>
        <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
          Faça login com sua conta do Google para visualizar todos os pedidos enviados.
        </p>
        <button 
          onClick={handleBackToHome} 
          className="mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition cursor-pointer"
        >
          Voltar para Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Back CTA */}
      <button
        onClick={handleBackToHome}
        className="inline-flex items-center gap-2 group text-sm font-semibold text-slate-600 hover:text-rose-600 transition mb-6 cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Voltar para a Loja
      </button>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-slate-900 tracking-tighter uppercase">
          Meus Pedidos <span className="text-rose-600">Enviados</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Histórico completo de compras finalizadas na conta <span className="font-semibold text-slate-700">{user.email}</span>.
        </p>
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingBag className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-slate-800 text-sm">Nenhum pedido encontrado</h3>
            <p className="text-xs text-slate-400 mt-1">
              Todos os pedidos que você concluir de agora em diante serão monitorados neste painel.
            </p>
          </div>
          <button
            onClick={handleBackToHome}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-95"
          >
            Começar a Comprar
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {userOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white border border-slate-105 rounded-xl p-6 hover:border-rose-200 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-200"
            >
              {/* Order Metadata Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-800">
                    <FileText className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Código do Pedido</span>
                    <span className="font-mono text-sm text-slate-800 font-bold block mt-0.5">{order.id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {/* Creation Date */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium font-semibold">
                    <Calendar className="w-4 h-4 text-rose-500" />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>

                  {/* Order state tracker status badge */}
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Completo
                  </div>
                </div>
              </div>

              {/* Order items nested listing */}
              <div className="py-4 space-y-3.5">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 text-left">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="font-mono text-[11px] text-slate-400 mt-1 flex gap-2">
                        <span>Tam: <strong className="text-slate-650">{item.selectedSize}</strong></span>
                        {item.selectedColor && (
                          <span>Cor: <strong className="text-slate-650">{item.selectedColor}</strong></span>
                        )}
                        <span>Qtd: <strong className="text-slate-650">{item.quantity}x</strong></span>
                      </p>
                    </div>

                    <span className="font-sans font-bold text-sm text-slate-800 tracking-tight">
                      R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order total footer */}
              <div className="border-t border-slate-100 pt-4 flex justify-between items-center bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-xl">
                <div>
                  <span className="font-sans font-medium text-xs text-slate-500 block">Status do Pedido</span>
                  <span className="font-sans font-bold text-xs text-rose-600 block mt-0.5 capitalize">{order.status || 'Novo'}</span>
                </div>

                <div>
                  <span className="font-sans font-medium text-xs text-slate-500 block text-right">Valor Total</span>
                  <span className="font-sans font-extrabold text-slate-900 text-lg block mt-0.5">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
