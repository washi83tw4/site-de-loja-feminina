import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, Clipboard, Check, ShoppingBag } from 'lucide-react';
import { updateOrderStatus } from '../supabase';

interface PaymentStatusProps {
  type: 'sucesso' | 'erro' | 'pendente';
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ type }) => {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [merchantOrderId, setMerchantOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    // Extract query parameters from URL returned by Mercado Pago
    const params = new URLSearchParams(window.location.search);
    const pId = params.get('payment_id');
    const oId = params.get('external_reference');
    const mId = params.get('merchant_order_id');

    setPaymentId(pId);
    setOrderId(oId);
    setMerchantOrderId(mId);

    if (oId) {
      let targetStatus = 'Pendente';
      if (type === 'sucesso') {
        targetStatus = 'Pago';
      } else if (type === 'erro') {
        targetStatus = 'Recusado';
      }

      updateOrderStatus(oId, targetStatus)
        .then((ok) => {
          if (ok) {
            console.log(`Order ${oId} status updated successfully to ${targetStatus}`);
          }
        })
        .catch((err) => {
          console.error("Failed to update order status in Supabase:", err);
        });
    }
  }, [type]);

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleBackToStore = () => {
    window.location.href = '/';
  };

  const getStatusDetails = () => {
    switch (type) {
      case 'sucesso':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-fade-in" />,
          title: 'Pagamento Confirmado!',
          subtitle: 'Agradecemos sua compra! Seu pagamento foi processado com sucesso pelo Mercado Pago.',
          bgClass: 'bg-emerald-50/50 border-emerald-100',
          titleColor: 'text-emerald-800'
        };
      case 'erro':
        return {
          icon: <XCircle className="w-16 h-16 text-rose-500 animate-fade-in" />,
          title: 'Pagamento não concluído',
          subtitle: 'Tivemos um problema ao processar seu pagamento. Nenhuma cobrança foi realizada.',
          bgClass: 'bg-rose-50/50 border-rose-100',
          titleColor: 'text-rose-800'
        };
      case 'pendente':
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-amber-500 animate-fade-in" />,
          title: 'Pagamento em análise',
          subtitle: 'Seu pagamento está pendente ou sob análise de segurança do Mercado Pago. Te avisaremos assim que for aprovado!',
          bgClass: 'bg-amber-50/50 border-amber-100',
          titleColor: 'text-amber-800'
        };
    }
  };

  const { icon, title, subtitle, bgClass, titleColor } = getStatusDetails();

  return (
    <div className="flex-1 flex items-center justify-center min-h-[70vh] px-4 py-16" id="mp-payment-status-wrapper">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 space-y-8 text-center transition-all duration-300 hover:shadow-2xl">
        
        {/* Dynamic Payment State Icon Header */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-slate-50 rounded-full inline-block">
            {icon}
          </div>
          <h2 className={`font-sans font-black text-2xl tracking-tight ${titleColor}`}>
            {title}
          </h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Transaction details card panel */}
        {(orderId || paymentId || merchantOrderId) && (
          <div className={`text-left rounded-xl border p-5 space-y-3.5 text-xs ${bgClass}`}>
            <h3 className="font-sans font-bold text-slate-800 uppercase tracking-widest text-[10px] border-b border-black/5 pb-2">
              Detalhes da Transação
            </h3>
            
            {orderId && (
              <div className="flex justify-between items-center gap-4">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider">ID do Pedido</span>
                  <span className="font-mono font-extrabold text-slate-700 break-all">{orderId}</span>
                </div>
                <button 
                  onClick={copyOrderId}
                  className="p-1.5 bg-white border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 rounded-md transition shadow-xs flex items-center shrink-0 cursor-pointer"
                  title="Copiar ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {paymentId && (
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider">Código de Operação MP</span>
                <span className="font-mono font-extrabold text-slate-700 break-all">{paymentId}</span>
              </div>
            )}

            {merchantOrderId && (
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider">Nº Pedido Comercial</span>
                <span className="font-mono font-extrabold text-slate-700">{merchantOrderId}</span>
              </div>
            )}

            <div className="border-t border-black/5 pt-2 flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
              <span>Checkout 100% criptografado e seguro</span>
            </div>
          </div>
        )}

        {/* Buttons section */}
        <div className="pt-2 space-y-2.5">
          <button
            type="button"
            onClick={handleBackToStore}
            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition duration-200 cursor-pointer active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            Voltar para a Loja
          </button>
          
          <p className="text-[10px] text-slate-400">
            Qualquer dúvida ou suporte com o seu pagamento, entre em contato com nosso atendimento com o ID do pedido acima.
          </p>
        </div>

      </div>
    </div>
  );
};
