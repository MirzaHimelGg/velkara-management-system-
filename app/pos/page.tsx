"use client";
import React, { useState } from 'react';
import { ShoppingBag, CreditCard, Banknote, Trash2, CheckCircle2 } from 'lucide-react';

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'digital'>('cash');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      {/* Left side: Product Grid/Scanner */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 border border-white/40 shadow-xl">
           <h2 className="text-xl font-bold mb-4">Quick Add</h2>
           <input 
             className="w-full bg-slate-100 rounded-2xl px-6 py-4 focus:ring-2 ring-blue-500 outline-none" 
             placeholder="Search by name or scan barcode..." 
           />
        </div>
        
        {/* Placeholder for scanned items */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition text-left">
            <p className="font-bold">Premium Tee</p>
            <p className="text-sm text-slate-500">XL / Black</p>
            <p className="text-blue-600 font-bold mt-2">৳ 1,200</p>
          </button>
        </div>
      </div>

      {/* Right side: Modern Cart */}
      <div className="bg-white/90 backdrop-blur-2xl rounded-[40px] p-8 shadow-2xl border border-white/50 flex flex-col h-[85vh]">
        <div className="flex items-center mb-8">
          <ShoppingBag className="w-6 h-6 mr-3 text-blue-600" />
          <h2 className="text-2xl font-black">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
           {cart.length === 0 ? (
             <div className="text-center py-20 text-slate-400">Cart is empty</div>
           ) : null}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
          <div className="flex justify-between font-bold text-2xl">
            <span>Total</span>
            <span>৳ 0.00</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={`flex items-center justify-center p-4 rounded-2xl border-2 transition ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
            >
              <Banknote className="mr-2" /> Cash
            </button>
            <button 
              onClick={() => setPaymentMethod('digital')}
              className={`flex items-center justify-center p-4 rounded-2xl border-2 transition ${paymentMethod === 'digital' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
            >
              <CreditCard className="mr-2" /> Digital
            </button>
          </div>

          <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg shadow-xl active:scale-95 transition-all">
            COMPLETE SALE
          </button>
        </div>
      </div>
    </div>
  );
}
