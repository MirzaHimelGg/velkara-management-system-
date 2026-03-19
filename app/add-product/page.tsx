"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, X, Save, ArrowLeft, Loader2, Camera, Search } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function SmartAddProduct() {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stockToAdd, setStockToAdd] = useState('1');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(true);

  // 1. ACTION: Search for SKU after scanning or typing
  const handleLookup = async (inputSku: string) => {
    setSku(inputSku);
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').eq('sku', inputSku).single();
    
    if (data) {
      // Product exists - Fill info for restocking
      setName(data.name);
      setCategory(data.category);
      setPrice(data.price);
      setSize(data.variant_size);
      setColor(data.variant_color);
      setIsNewProduct(false);
      alert("Existing Product Found! Adjust info or just add stock.");
    } else {
      // New Product - Clear fields but keep SKU
      setIsNewProduct(true);
      alert("New SKU detected. Please enter product details.");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!sku || !name || !price) return alert("SKU, Name, and Price are mandatory!");
    setLoading(true);

    if (isNewProduct) {
      // CREATE NEW
      const { error } = await supabase.from('products').insert([{
        sku, name, category, price: parseFloat(price), 
        variant_size: size, variant_color: color, stock: parseInt(stockToAdd)
      }]);
      if (!error) alert("New Product Added!");
    } else {
      // UPDATE EXISTING STOCK
      const { data } = await supabase.from('products').select('stock').eq('sku', sku).single();
      const { error } = await supabase.from('products').update({
        stock: (data?.stock || 0) + parseInt(stockToAdd),
        price: parseFloat(price) // Update price in case it changed
      }).eq('sku', sku);
      if (!error) alert("Stock Updated Successfully!");
    }

    setLoading(false);
    window.location.href = '/dashboard';
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in">
      <button onClick={() => window.location.href='/dashboard'} className="flex items-center text-slate-500 font-bold mb-6 hover:text-blue-600">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl rounded-[40px] p-8 md:p-12">
        <h1 className="text-3xl font-black mb-8 text-slate-900">
          {isNewProduct ? "Add New Product" : "Restock Inventory"}
        </h1>

        <div className="space-y-6">
          {/* SKU INPUT SECTION */}
          <div className="bg-slate-900 p-6 rounded-3xl text-white">
            <label className="block text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Product SKU / Barcode</label>
            <div className="flex gap-3">
              <input 
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup(sku)}
                placeholder="Scan or Type SKU..."
                className="flex-1 bg-white/10 border border-white/20 p-4 rounded-xl outline-none font-black text-xl placeholder:text-white/20"
              />
              <button onClick={() => handleLookup(sku)} className="bg-blue-600 p-4 rounded-xl hover:bg-blue-500 transition-colors">
                <Search size={24} />
              </button>
            </div>
          </div>

          {/* DYNAMIC FORM SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" placeholder="Product Name" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" placeholder="e.g. Panjabi" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Price (৳)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold text-blue-600" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Size</label>
              <input value={size} onChange={(e) => setSize(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" placeholder="XL, 42..." />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Color</label>
              <input value={color} onChange={(e) => setColor(e.target.value)} className="w-full bg-slate-50 border p-4 rounded-2xl font-bold" placeholder="Black..." />
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
            <label className="block text-xs font-black text-blue-900 uppercase mb-2">Quantity to Add</label>
            <input 
              type="number" 
              value={stockToAdd} 
              onChange={(e) => setStockToAdd(e.target.value)} 
              className="w-full bg-white border-2 border-blue-200 p-4 rounded-xl font-black text-2xl text-blue-600"
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-[25px] font-black text-xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
            {isNewProduct ? "CONFIRM & ADD PRODUCT" : "UPDATE EXISTING INVENTORY"}
          </button>
        </div>
      </div>
    </div>
  );
}

