"use client";
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, X, Save, ArrowLeft, Loader2 } from 'lucide-react';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddProduct() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Apparel');
  const [price, setPrice] = useState('');
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [currentSize, setCurrentSize] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [loading, setLoading] = useState(false);

  const addTag = (type: 'size' | 'color') => {
    if (type === 'size' && currentSize.trim()) {
      setSizes([...sizes, currentSize.trim()]);
      setCurrentSize('');
    } else if (type === 'color' && currentColor.trim()) {
      setColors([...colors, currentColor.trim()]);
      setCurrentColor('');
    }
  };

  const handleGenerateAndSave = async () => {
    if (!name || sizes.length === 0 || colors.length === 0 || !price) {
      alert("Please fill in Name, Price, and at least one Size/Color.");
      return;
    }

    setLoading(true);
    const allVariants = [];

    // Create combinations for every size and color
    for (const s of sizes) {
      for (const c of colors) {
        allVariants.push({
          name: name,
          category: category,
          variant_size: s,
          variant_color: c,
          stock: 0,
          price: parseFloat(price),
          sku: `VEL-${name.substring(0,3).toUpperCase()}-${s}-${c.substring(0,2).toUpperCase()}`
        });
      }
    }

    // Insert into Supabase
    const { error } = await supabase.from('products').insert(allVariants);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert(`Success! ${allVariants.length} variants added.`);
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <button onClick={() => window.location.href='/dashboard'} className="flex items-center text-slate-500 hover:text-blue-600 transition font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[40px] p-10">
        <h1 className="text-4xl font-black tracking-tight mb-8">New Product</h1>
        
        <div className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Product Name</label>
              <input 
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-100 outline-none transition"
                placeholder="e.g. Premium Panjabi"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Price (৳)</label>
              <input 
                type="number"
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-5 py-4 outline-none"
                placeholder="1200"
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Category</label>
              <select 
                className="w-full bg-white/50 border border-slate-200 rounded-2xl px-5 py-4 outline-none"
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Apparel</option>
                <option>Fragrance</option>
                <option>Accessories</option>
              </select>
            </div>
          </div>

          {/* Sizes Tag Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Sizes (Type & Press Enter)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {sizes.map(s => (
                <span key={s} className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black flex items-center shadow-md">
                  {s} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setSizes(sizes.filter(x => x !== s))} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={currentSize}
                onChange={(e) => setCurrentSize(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag('size')}
                className="flex-1 bg-white/50 border border-slate-200 rounded-2xl px-5 py-3 outline-none"
                placeholder="XL, 42, M..."
              />
              <button onClick={() => addTag('size')} className="p-3 bg-slate-900 text-white rounded-2xl active:scale-95 transition"><Plus /></button>
            </div>
          </div>

          {/* Colors Tag Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Colors</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map(c => (
                <span key={c} className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black flex items-center shadow-md">
                  {c} <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setColors(colors.filter(x => x !== c))} />
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag('color')}
                className="flex-1 bg-white/50 border border-slate-200 rounded-2xl px-5 py-3 outline-none"
                placeholder="Black, White..."
              />
              <button onClick={() => addTag('color')} className="p-3 bg-slate-900 text-white rounded-2xl active:scale-95 transition"><Plus /></button>
            </div>
          </div>

          <button 
            onClick={handleGenerateAndSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[24px] shadow-2xl shadow-blue-200 transition-all active:scale-95 flex justify-center items-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            GENERATE ALL VARIANTS
          </button>
        </div>
      </div>
    </div>
  );
}
