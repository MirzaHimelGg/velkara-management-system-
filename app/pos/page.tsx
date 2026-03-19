"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingCart, Trash2, Camera, User, Tag, Plus, Minus, Loader2, CheckCircle } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Auto-scan listener from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sku = params.get('sku');
    if (sku) handleAddItem(sku);
  }, []);

  const handleAddItem = async (sku: string) => {
    const { data } = await supabase.from('products').select('*').eq('sku', sku).single();
    if (data) {
      // Check if item already in cart to increase quantity instead of adding new row
      const existing = cart.find(item => item.id === data.id);
      if (existing) {
        updateQuantity(existing.cartId, 1);
      } else {
        setCart(prev => [...prev, { ...data, cartId: Date.now(), quantity: 1, customPrice: data.price }]);
      }
    }
  };

  const updateQuantity = (cartId: number, delta: number) => {
    setCart(prev => prev.map(item => 
      item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const updateItemPrice = (cartId: number, newPrice: number) => {
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, customPrice: newPrice } : item));
  };

  const removeItem = (cartId: number) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.customPrice) * item.quantity), 0);
  const finalTotal = subtotal - globalDiscount;

  const handleCompleteSale = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    setLoading(true);

    try {
      // 1. MEMBERSHIP CONDITION: Only add to DB if total >= 5000
      if (finalTotal >= 5000 && customerPhone) {
        await supabase.from('customers').upsert({ 
          phone: customerPhone, 
          name: customerName,
          membership_tier: 'Silver' // Upgraded status
        }, { onConflict: 'phone' });
        console.log("Customer added to Membership Database.");
      }

      // 2. RECORD THE SALE
      const { error: saleError } = await supabase.from('sales').insert({
        customer_phone: customerPhone || 'Guest',
        total_amount: finalTotal,
        discount_applied: globalDiscount,
        items: cart
      });
      if (saleError) throw saleError;

      // 3. MULTI-ITEM STOCK DEDUCTION
      for (const item of cart) {
        // Subtract the specific quantity sold
        await supabase.rpc('decrement_stock', { 
          row_id: item.id, 
          quantity: item.quantity 
        });
      }

      alert(finalTotal >= 5000 ? "Sale Complete! Member Registered." : "Sale Complete!");
      
      // Reset State
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setGlobalDiscount(0);

    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-10 min-h-screen bg-[#f8fafc]">
      
      {/* LEFT: CART & ITEMS */}
      <div className="flex-1 space-y-6">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-xl border border-white">
          <h2 className="text-2xl font-black mb-6 flex items-center text-slate-900">
            <ShoppingCart className="mr-3 text-blue-600"/> Billing Terminal
          </h2>
          <div className="flex gap-4">
            <input 
              className="flex-1 bg-slate-100 p-5 rounded-2xl outline-none focus:ring-4 ring-blue-50 font-bold" 
              placeholder="Scan Barcode or Type SKU..." 
              onKeyDown={(e: any) => e.key === 'Enter' && (handleAddItem(e.target.value), e.target.value = '')}
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden border border-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5 text-center">Qty</th>
                <th className="px-8 py-5">Price per Unit</th>
                <th className="px-8 py-5">Total</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cart.map((item) => (
                <tr key={item.cartId} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{item.variant_size} / {item.variant_color}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-3 bg-slate-100 p-2 rounded-xl">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1 hover:text-blue-600"><Minus size={14}/></button>
                      <span className="font-black text-slate-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 hover:text-blue-600"><Plus size={14}/></button>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <input 
                      type="number"
                      value={item.customPrice}
                      onChange={(e) => updateItemPrice(item.cartId, Number(e.target.value))}
                      className="w-24 bg-blue-50 text-blue-700 font-black p-2 rounded-xl outline-none text-center"
                    />
                  </td>
                  <td className="px-8 py-5 font-black text-slate-900 text-lg">
                    ৳{item.customPrice * item.quantity}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => removeItem(item.cartId)} className="text-rose-300 hover:text-rose-600 transition-colors"><Trash2 size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cart.length === 0 && <div className="p-20 text-center text-slate-300 font-black uppercase tracking-widest">Cart is empty</div>}
        </div>
      </div>

      {/* RIGHT: CUSTOMER & TOTALS */}
      <div className="w-full lg:w-[420px] space-y-6">
        <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[40px] shadow-2xl border border-white">
          <h2 className="text-xl font-black mb-6 flex items-center"><User className="mr-2 text-blue-600"/> Customer Details</h2>
          <div className="space-y-4">
            <input 
              placeholder="Name" 
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:border-blue-400 font-bold"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <input 
              placeholder="Phone (e.g. 017...)" 
              className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:border-blue-400 font-bold"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
            {finalTotal >= 5000 && customerPhone && (
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center border border-emerald-100">
                <CheckCircle className="w-3 h-3 mr-2" /> Membership Qualified
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-10 rounded-[45px] shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
              <span>Subtotal</span>
              <span>৳{subtotal}</span>
            </div>
            
            <div className="flex justify-between items-center text-emerald-400 mb-8">
              <span className="text-xs font-black uppercase tracking-widest flex items-center"><Tag className="w-3 h-3 mr-2"/> Discount</span>
              <input 
                type="number"
                className="bg-white/10 w-24 p-2 rounded-xl outline-none font-black text-right text-white"
                value={globalDiscount}
                onChange={(e) => setGlobalDiscount(Number(e.target.value))}
              />
            </div>

            <div className="border-t border-white/10 pt-8">
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">Grand Total</p>
              <p className="text-6xl font-black mb-10 tracking-tighter">৳{finalTotal}</p>
              
              <button 
                onClick={handleCompleteSale}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[28px] font-black text-xl shadow-2xl shadow-blue-900/40 active:scale-95 transition-all flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : "COMPLETE SALE"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
