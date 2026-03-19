"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingCart, Trash2, Camera, User, Tag, Percent, CheckCircle, Loader2 } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Auto-scan listener
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sku = params.get('sku');
    if (sku) handleAddItem(sku);
  }, []);

  const handleAddItem = async (sku: string) => {
    const { data } = await supabase.from('products').select('*').eq('sku', sku).single();
    if (data) {
      setCart(prev => [...prev, { ...data, cartId: Date.now(), customPrice: data.price }]);
    }
  };

  const updateItemPrice = (cartId: number, newPrice: number) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, customPrice: newPrice } : item));
  };

  const removeItem = (cartId: number) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.customPrice), 0);
  const finalTotal = subtotal - globalDiscount;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    setLoading(true);

    // 1. Save/Update Customer
    if (customerPhone) {
      await supabase.from('customers').upsert({ 
        phone: customerPhone, 
        name: customerName 
      }, { onConflict: 'phone' });
    }

    // 2. Record the Sale
    const { error } = await supabase.from('sales').insert({
      customer_phone: customerPhone,
      total_amount: finalTotal,
      discount_applied: globalDiscount,
      items: cart
    });

    if (!error) {
      alert("Sale Complete! Receipt Generated.");
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setGlobalDiscount(0);
    } else {
      alert("Error saving sale: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* LEFT: Items & Controls */}
      <div className="flex-1 space-y-6">
        <div className="bg-white/70 backdrop-blur-xl p-8 rounded-[40px] shadow-xl border border-white">
          <h2 className="text-2xl font-black mb-6 flex items-center"><Camera className="mr-2 text-blue-600"/> Scanning Terminal</h2>
          <div className="flex gap-4">
            <input 
              className="flex-1 bg-slate-100 p-5 rounded-2xl outline-none focus:ring-4 ring-blue-50 font-bold" 
              placeholder="Scan Barcode or Type SKU..." 
              onKeyDown={(e: any) => e.key === 'Enter' && (handleAddItem(e.target.value), e.target.value = '')}
            />
            <button onClick={() => window.location.href='/scanner'} className="bg-slate-900 text-white p-5 rounded-2xl hover:scale-105 transition-transform">
              <Camera />
            </button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-[40px] shadow-xl overflow-hidden border border-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-4">Product</th>
                <th className="px-8 py-4">Base Price</th>
                <th className="px-8 py-4">Selling Price</th>
                <th className="px-8 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cart.map((item) => (
                <tr key={item.cartId} className="group transition-colors">
                  <td className="px-8 py-4">
                    <p className="font-black text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.variant_size} / {item.variant_color}</p>
                  </td>
                  <td className="px-8 py-4 font-bold text-slate-400">৳{item.price}</td>
                  <td className="px-8 py-4">
                    <input 
                      type="number"
                      value={item.customPrice}
                      onChange={(e) => updateItemPrice(item.cartId, Number(e.target.value))}
                      className="w-24 bg-blue-50 text-blue-700 font-black p-2 rounded-xl border border-blue-100 outline-none"
                    />
                  </td>
                  <td className="px-8 py-4">
                    <button onClick={() => removeItem(item.cartId)} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length === 0 && <p className="p-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">Cart is empty</p>}
        </div>
      </div>

      {/* RIGHT: Customer & Checkout */}
      <div className="w-full lg:w-[400px] space-y-6">
        {/* Customer Box */}
        <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl border border-white">
          <h2 className="text-xl font-black mb-6 flex items-center text-slate-900"><User className="mr-2 text-blue-600"/> Customer Info</h2>
          <div className="space-y-4">
            <input 
              placeholder="Customer Name" 
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:border-blue-400 transition-all font-medium"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input 
              placeholder="Phone Number" 
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:border-blue-400 transition-all font-medium"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Totals Box */}
        <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center text-slate-400 font-bold uppercase text-xs tracking-widest">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            
            <div className="flex justify-between items-center text-emerald-400 font-bold">
              <span className="flex items-center text-xs uppercase tracking-widest"><Tag className="w-3 h-3 mr-1"/> Extra Discount</span>
              <div className="flex items-center bg-white/10 rounded-xl px-2">
                <span className="mr-1">৳</span>
                <input 
                  type="number"
                  className="bg-transparent w-20 p-2 outline-none font-black text-right"
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-slate-400 uppercase text-xs tracking-widest">Grand Total</span>
                <span className="text-5xl font-black">৳{finalTotal}</span>
              </div>
              <button 
                onClick={handleCompleteSale}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[25px] font-black text-xl shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : "COMPLETE SALE"}
              </button>
            </div>
          </div>
          {/* Decorative Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 blur-[80px] opacity-20"></div>
        </div>
      </div>
    </div>
  );
}
