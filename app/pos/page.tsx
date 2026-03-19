"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShoppingCart, Trash2, Camera, CheckCircle } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);

  // This "Listener" checks if we just came from the scanner
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skuFromScanner = params.get('sku');
    if (skuFromScanner) {
      handleAddItem(skuFromScanner);
    }
  }, []);

  const handleAddItem = async (sku: string) => {
    const { data, error } = await supabase.from('products').select('*').eq('sku', sku).single();
    if (data) {
      setCart(prev => [...prev, { ...data, id: Date.now() }]); // Add to list
    } else {
      alert("SKU Not Found in Velkara Database");
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-screen animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-xl border border-white">
          <h2 className="text-2xl font-black mb-4">Billing Desk</h2>
          <div className="flex gap-4">
            <input 
              className="flex-1 bg-slate-100 p-4 rounded-2xl outline-none focus:ring-2 ring-blue-500" 
              placeholder="Enter SKU manually..." 
              onKeyDown={(e: any) => e.key === 'Enter' && handleAddItem(e.target.value)}
            />
            <button onClick={() => window.location.href='/scanner'} className="bg-blue-600 text-white p-4 rounded-2xl">
              <Camera />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 shadow-2xl flex flex-col border border-slate-100">
        <h2 className="text-2xl font-black mb-6 flex items-center"><ShoppingCart className="mr-2"/> Cart</h2>
        <div className="flex-1 space-y-4 overflow-y-auto">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="font-bold">{item.name}</p>
                <p className="text-xs text-slate-500">{item.variant_size} / {item.variant_color}</p>
              </div>
              <p className="font-black text-blue-600">৳{item.price}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex justify-between text-2xl font-black mb-6">
            <span>Total</span> <span>৳{total}</span>
          </div>
          <button className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg shadow-xl active:scale-95 transition-all">
            COMPLETE SALE
          </button>
        </div>
      </div>
    </div>
  );
}
