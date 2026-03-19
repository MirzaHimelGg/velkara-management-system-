"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Search, AlertCircle, Package, Edit, Trash2 } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const { data: { user } } = await supabase.auth.getUser();
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter'); // 'low' or null

    let query = supabase.from('products').select('*').eq('user_id', user?.id);
    
    if (filter === 'low') {
      query = query.lte('stock', 5); // Show only stock <= 5
    }

    const { data } = await query.order('name', { ascending: true });
    setItems(data || []);
    setLoading(false);
  }

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <button onClick={() => window.location.href='/dashboard'} className="flex items-center text-slate-500 font-bold"><ArrowLeft className="mr-2"/> Dashboard</button>
          <h1 className="text-2xl font-black">Store Inventory</h1>
          <div className="w-20"></div>
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            placeholder="Search inventory..." 
            className="w-full bg-white border border-slate-200 p-4 pl-12 rounded-2xl outline-none focus:ring-2 ring-blue-500 font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400">
              <tr>
                <th className="px-8 py-5">Product</th>
                <th className="px-8 py-5">SKU</th>
                <th className="px-8 py-5 text-center">Stock</th>
                <th className="px-8 py-5 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td className="px-8 py-5 font-bold">{item.name} <span className="text-[10px] text-slate-400 ml-2">{item.variant_size}</span></td>
                  <td className="px-8 py-5 font-mono text-xs">{item.sku}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${item.stock <= 5 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {item.stock} left
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-black">৳{item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">No items found</div>
          )}
        </div>
      </div>
    </div>
  );
}
